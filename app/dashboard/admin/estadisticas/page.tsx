'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getCurrentUser, supabase } from '@/lib/auth';
import {
  ResponsiveContainer,
  BarChart, Bar,
  ComposedChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

type Range = '3m' | '6m' | '1y';

interface EventSummary {
  id: string;
  title: string;
  date: string;
  event_type: string;
  attended: number;
  late: number;
  absent: number;
}

interface MemberStat {
  id: string;
  name: string;
  mote: string | null;
  numero_roa: number | null;
  role: string;
  attended: number;
  late: number;
  absent: number;
}

interface Metrics {
  totalEvents: number;
  totalAttended: number;
  totalLate: number;
  totalAbsent: number;
  attendanceRate: number;
  events: EventSummary[];
  members: MemberStat[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RANGE_LABELS: Record<Range, string> = {
  '3m': 'Últimos 3 meses',
  '6m': 'Últimos 6 meses',
  '1y': 'Último año',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  presentacion: 'Presentación',
  ensayo: 'Ensayo',
  serenata: 'Serenata',
  acto_academico: 'Acto Académico',
  reunion: 'Reunión',
  otro: 'Otro',
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  tuno_admin: 'Admin Tuna',
  tuno: 'Tuno',
  pardillo: 'Pardillo',
  aspirante: 'Aspirante',
};

function rangeStart(range: Range): Date {
  const d = new Date();
  if (range === '3m') d.setMonth(d.getMonth() - 3);
  else if (range === '6m') d.setMonth(d.getMonth() - 6);
  else d.setFullYear(d.getFullYear() - 1);
  return d;
}

// ── Chart colors ──────────────────────────────────────────────────────────────

const C = {
  attended: '#16a34a',
  late:     '#d97706',
  absent:   '#ef4444',
  primary:  '#7c3aed',
  grid:     '#e2e8f0',
  tick:     '#94a3b8',
};

// ── Custom tooltips ───────────────────────────────────────────────────────────

function AttendTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const visible = payload.filter((p) => p.value > 0);
  return (
    <div className="bg-background border shadow-xl rounded-xl px-4 py-3 text-sm min-w-[170px]">
      <p className="font-semibold text-xs text-muted-foreground mb-2 uppercase tracking-wide">{label}</p>
      {visible.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6 leading-[1.75]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: p.fill ?? p.color }} />
            {p.name}
          </span>
          <span className="font-bold tabular-nums">
            {p.name === 'Tasa %' ? `${p.value}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function MemberTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border shadow-xl rounded-xl px-4 py-3 text-sm min-w-[160px]">
      <p className="font-semibold text-xs text-muted-foreground mb-2 uppercase tracking-wide">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6 leading-[1.75]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: p.fill }} />
            {p.name}
          </span>
          <span className="font-bold tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EstadisticasPage() {
  const router = useRouter();
  const [range, setRange] = useState<Range>('3m');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [eventAttendees, setEventAttendees] = useState<Record<string, { name: string; mote: string | null; attended: boolean; late: boolean }[]>>({});

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'super_admin' && profile?.role !== 'tuno_admin') {
        router.push('/dashboard');
        return;
      }
    })();
  }, [router]);

  useEffect(() => {
    loadMetrics(range);
  }, [range]);

  async function loadMetrics(r: Range) {
    setIsLoading(true);
    setMetrics(null);
    try {
      const start = rangeStart(r).toISOString();

      // Completed events in range
      const { data: eventsRaw } = await supabase
        .from('events')
        .select('id, title, date, event_type')
        .eq('status', 'completed')
        .gte('date', start)
        .order('date', { ascending: false });

      const events = eventsRaw ?? [];
      if (events.length === 0) {
        setMetrics({ totalEvents: 0, totalAttended: 0, totalLate: 0, totalAbsent: 0, attendanceRate: 0, events: [], members: [] });
        return;
      }

      const eventIds = events.map((e) => e.id);

      // Attendance records — use full_name (not first_name/last_name) and include is_late
      const { data: attendanceRaw } = await supabase
        .from('event_attendance')
        .select('event_id, user_id, attended, is_late, profile:user_id(id, full_name, mote, numero_roa, role)')
        .in('event_id', eventIds);

      const attendance = attendanceRaw ?? [];

      // Per-event counts
      const eventMap: Record<string, EventSummary> = {};
      for (const ev of events) {
        eventMap[ev.id] = { ...ev, attended: 0, late: 0, absent: 0 };
      }

      // Per-member counts
      const memberMap: Record<string, MemberStat> = {};

      for (const rec of attendance) {
        const ev = eventMap[rec.event_id];
        const isLate = !!(rec as { is_late?: boolean }).is_late;
        const isPresent = !!(rec.attended);

        if (ev) {
          if (!isPresent)  ev.absent++;
          else if (isLate) ev.late++;
          else             ev.attended++;
        }

        const p = (rec as unknown as { profile?: { id: string; full_name: string | null; mote: string | null; numero_roa: number | null; role: string } | null }).profile ?? null;
        if (!p) continue;

        if (!memberMap[p.id]) {
          memberMap[p.id] = {
            id: p.id,
            name: p.full_name || 'Sin nombre',
            mote: p.mote,
            numero_roa: p.numero_roa,
            role: p.role,
            attended: 0,
            late: 0,
            absent: 0,
          };
        }
        if (!isPresent)  memberMap[p.id].absent++;
        else if (isLate) memberMap[p.id].late++;
        else             memberMap[p.id].attended++;
      }

      const eventSummaries = Object.values(eventMap);
      const members = Object.values(memberMap).sort((a, b) => b.absent - a.absent || a.name.localeCompare(b.name));

      const totalAttended = eventSummaries.reduce((s, e) => s + e.attended, 0);
      const totalLate     = eventSummaries.reduce((s, e) => s + e.late, 0);
      const totalAbsent   = eventSummaries.reduce((s, e) => s + e.absent, 0);
      const total = totalAttended + totalLate + totalAbsent;

      setMetrics({
        totalEvents: events.length,
        totalAttended,
        totalLate,
        totalAbsent,
        attendanceRate: total > 0 ? Math.round(((totalAttended + totalLate) / total) * 100) : 0,
        events: eventSummaries,
        members,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadEventDetail(eventId: string) {
    if (eventAttendees[eventId]) {
      setExpandedEvent(expandedEvent === eventId ? null : eventId);
      return;
    }
    const { data } = await supabase
      .from('event_attendance')
      .select('attended, is_late, profile:user_id(full_name, mote)')
      .eq('event_id', eventId);

    const list = ((data ?? []) as unknown as { attended: boolean; is_late: boolean; profile: { full_name: string | null; mote: string | null } | null }[])
      .map((r) => ({
        name: r.profile?.full_name || r.profile?.mote || '—',
        mote: r.profile?.mote ?? null,
        attended: r.attended,
        late: r.is_late,
      }))
      .sort((a, b) => Number(b.attended) - Number(a.attended) || a.name.localeCompare(b.name));

    setEventAttendees((prev) => ({ ...prev, [eventId]: list }));
    setExpandedEvent(eventId);
  }

  // ── Chart data ───────────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!metrics) return [];
    const evs = [...metrics.events].reverse();
    if (range === '3m') {
      return evs.map((ev) => {
        const total = ev.attended + ev.late + ev.absent;
        return {
          label: new Date(ev.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', timeZone: 'America/Lima' }),
          Asistieron: ev.attended,
          Tardanza:   ev.late,
          Faltaron:   ev.absent,
          tasa: total > 0 ? Math.round(((ev.attended + ev.late) / total) * 100) : 0,
        };
      });
    }
    // Group by month for 6m / 1y
    const map: Record<string, { label: string; Asistieron: number; Tardanza: number; Faltaron: number; tasa: number }> = {};
    evs.forEach((ev) => {
      const key = new Intl.DateTimeFormat('es-PE', { year: 'numeric', month: 'short', timeZone: 'America/Lima' }).format(new Date(ev.date));
      if (!map[key]) map[key] = { label: key, Asistieron: 0, Tardanza: 0, Faltaron: 0, tasa: 0 };
      map[key].Asistieron += ev.attended;
      map[key].Tardanza   += ev.late;
      map[key].Faltaron   += ev.absent;
    });
    return Object.values(map).map((m) => {
      const total = m.Asistieron + m.Tardanza + m.Faltaron;
      return { ...m, tasa: total > 0 ? Math.round(((m.Asistieron + m.Tardanza) / total) * 100) : 0 };
    });
  }, [metrics, range]);

  const donutData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Asistieron', value: metrics.totalAttended, color: C.attended },
      { name: 'Tardanza',   value: metrics.totalLate,     color: C.late },
      { name: 'Faltaron',   value: metrics.totalAbsent,   color: C.absent },
    ].filter((d) => d.value > 0);
  }, [metrics]);

  const memberBarData = useMemo(() => {
    if (!metrics) return [];
    return metrics.members
      .filter((m) => m.absent > 0 || m.late > 0)
      .slice(0, 8)
      .reverse()
      .map((m) => ({
        name:     m.mote || m.name.split(' ')[0],
        fullName: m.name,
        Faltas:    m.absent,
        Tardanzas: m.late,
      }));
  }, [metrics]);

  const hasChartData = chartData.some((d) => d.Asistieron + d.Tardanza + d.Faltaron > 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full px-4 md:px-8 py-8 space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Estadísticas de Participación</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Métricas de asistencia e inasistencia por período
          </p>
        </div>

        {/* Range selector */}
        <div className="flex bg-secondary/40 rounded-lg p-1 gap-1">
          {(['3m', '6m', '1y'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                range === r
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === '3m' ? '3 meses' : r === '6m' ? '6 meses' : '1 año'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground">Cargando métricas...</div>
      ) : !metrics || metrics.totalEvents === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No hay eventos completados en {RANGE_LABELS[range].toLowerCase()}.
        </Card>
      ) : (
        <div className="space-y-8">

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard label="Eventos realizados" value={metrics.totalEvents} icon="🎵" />
            <MetricCard label="Asistencias" value={metrics.totalAttended} icon="✓" color="green" />
            <MetricCard label="Tardanzas" value={metrics.totalLate} icon="⚠" color="amber" />
            <MetricCard label="Inasistencias" value={metrics.totalAbsent} icon="✗" color="red" />
            <MetricCard label="Tasa de asistencia" value={`${metrics.attendanceRate}%`} icon="📊"
              color={metrics.attendanceRate >= 70 ? 'green' : metrics.attendanceRate >= 50 ? 'amber' : 'red'} />
          </div>

          {/* ── Charts ─────────────────────────────────────────────────────── */}
          {hasChartData && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold">Análisis Visual</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visualización interactiva — {range === '3m' ? 'por evento' : 'agrupado por mes'}
                </p>
              </div>

              {/* Row 1: Stacked bar + Donut */}
              <div className="grid lg:grid-cols-3 gap-5">

                {/* Stacked bar + rate line */}
                <Card className="lg:col-span-2 p-5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                    Asistencia por {range === '3m' ? 'evento' : 'mes'}
                  </p>
                  <ResponsiveContainer width="100%" height={272}>
                    <ComposedChart data={chartData} margin={{ top: 8, right: 32, bottom: 52, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.grid} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.tick }} angle={-40} textAnchor="end" interval={0} />
                      <YAxis yAxisId="l" tick={{ fontSize: 11, fill: C.tick }} allowDecimals={false} width={28} />
                      <YAxis yAxisId="r" orientation="right" unit="%" tick={{ fontSize: 11, fill: C.tick }} domain={[0, 100]} width={36} />
                      <Tooltip content={<AttendTooltip />} />
                      <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
                      <Bar yAxisId="l" dataKey="Asistieron" stackId="s" fill={C.attended} />
                      <Bar yAxisId="l" dataKey="Tardanza"   stackId="s" fill={C.late} />
                      <Bar yAxisId="l" dataKey="Faltaron"   stackId="s" fill={C.absent} radius={[3, 3, 0, 0]} />
                      <Line yAxisId="r" type="monotone" dataKey="tasa" name="Tasa %" stroke={C.primary} strokeWidth={2.5}
                        dot={{ r: 3.5, fill: C.primary, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>

                {/* Donut with center label */}
                <Card className="p-5 flex flex-col">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Distribución global
                  </p>
                  <div className="flex-1 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={62} outerRadius={90}
                          paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip formatter={(v, name) => [`${v}`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-3xl font-bold tabular-nums">{metrics!.attendanceRate}%</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">asistencia</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {donutData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                          <span className="text-muted-foreground">{d.name}</span>
                        </div>
                        <span className="font-semibold tabular-nums">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Row 2: Area trend + Members bar */}
              <div className="grid lg:grid-cols-2 gap-5">

                {/* Area — tasa trend */}
                <Card className="p-5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                    Tendencia de tasa de asistencia
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 52, left: 0 }}>
                      <defs>
                        <linearGradient id="gradTasa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={C.primary} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.grid} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.tick }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: C.tick }} unit="%" domain={[0, 100]} width={36} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Tasa de asistencia']}
                        contentStyle={{ borderRadius: 12, fontSize: 13 }} labelStyle={{ fontWeight: 600 }} />
                      <Area type="monotone" dataKey="tasa" name="Tasa %" stroke={C.primary} strokeWidth={2.5}
                        fill="url(#gradTasa)"
                        dot={{ r: 4, fill: C.primary, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Horizontal bar — top members */}
                {memberBarData.length > 0 ? (
                  <Card className="p-5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                      Top miembros — faltas y tardanzas
                    </p>
                    <ResponsiveContainer width="100%" height={Math.max(220, memberBarData.length * 34 + 24)}>
                      <BarChart data={memberBarData} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={C.grid} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: C.tick }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.tick }} width={72} />
                        <Tooltip content={<MemberTooltip />} />
                        <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Faltas"    fill={C.absent} stackId="m" />
                        <Bar dataKey="Tardanzas" fill={C.late}   stackId="m" radius={[0, 3, 3, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                ) : (
                  <Card className="p-5 flex items-center justify-center text-sm text-muted-foreground">
                    Sin faltas registradas en el período.
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ── Detalle por evento ─────────────────────────────────────────── */}
          <div>
            <h2 className="text-base font-semibold">Detalle por evento</h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              {RANGE_LABELS[range]} · solo eventos finalizados
            </p>
          </div>

          {/* Events table */}
          <div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Evento</th>
                      <th className="text-center px-4 py-3 font-medium text-green-700">Asistieron</th>
                      <th className="text-center px-4 py-3 font-medium text-amber-600 hidden sm:table-cell">Tardanza</th>
                      <th className="text-center px-4 py-3 font-medium text-red-600">Faltaron</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Tasa</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.events.map((ev) => {
                      const total = ev.attended + ev.late + ev.absent;
                      const rate = total > 0 ? Math.round(((ev.attended + ev.late) / total) * 100) : null;
                      const isExpanded = expandedEvent === ev.id;
                      return (
                        <Fragment key={ev.id}>
                          <tr className="border-b last:border-0 hover:bg-secondary/20 transition">
                            <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                              {new Date(ev.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' })}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Link href={`/dashboard/events/${ev.id}`} className="font-medium hover:text-primary transition">
                                {ev.title}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-green-700">{ev.attended}</td>
                            <td className="px-4 py-3 text-center font-semibold text-amber-600 hidden sm:table-cell">{ev.late}</td>
                            <td className="px-4 py-3 text-center font-semibold text-red-600">{ev.absent}</td>
                            <td className="px-4 py-3 text-center">
                              {rate !== null ? (
                                <span className={`font-medium ${rate >= 70 ? 'text-green-700' : rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                  {rate}%
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {total > 0 && (
                                <button
                                  onClick={() => loadEventDetail(ev.id)}
                                  className="text-xs text-muted-foreground hover:text-foreground transition underline underline-offset-2"
                                >
                                  {isExpanded ? 'Ocultar' : 'Ver lista'}
                                </button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && eventAttendees[ev.id] && (
                            <tr className="bg-secondary/10">
                              <td colSpan={8} className="px-6 py-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {eventAttendees[ev.id].map((p, i) => {
                                    const cls = !p.attended
                                      ? 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                                      : p.late
                                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                        : 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400';
                                    const icon = !p.attended ? '✗' : p.late ? '⚠' : '✓';
                                    return (
                                      <div key={i} className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 ${cls}`}>
                                        <span className="shrink-0">{icon}</span>
                                        <span className="truncate">{p.name}</span>
                                      </div>
                                    );
                                  })}
                                  {eventAttendees[ev.id].length === 0 && (
                                    <p className="text-sm text-muted-foreground col-span-full">Sin registros de asistencia.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Member absences ranking */}
          <div>
            <h2 className="text-base font-semibold mb-3">
              Miembros con más inasistencias — {RANGE_LABELS[range].toLowerCase()}
            </h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground w-10">#</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Miembro</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">ROA</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Rol</th>
                      <th className="text-center px-4 py-3 font-medium text-red-600">Faltas</th>
                      <th className="text-center px-4 py-3 font-medium text-amber-600 hidden sm:table-cell">Tardanzas</th>
                      <th className="text-center px-4 py-3 font-medium text-green-700">Asistencias</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Tasa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.members.map((m, i) => {
                      const total = m.attended + m.late + m.absent;
                      const rate = total > 0 ? Math.round(((m.attended + m.late) / total) * 100) : null;
                      const highlight = m.absent >= 3;
                      return (
                        <tr key={m.id}
                          className={`border-b last:border-0 transition ${highlight ? 'bg-red-50/50 dark:bg-red-950/10' : 'hover:bg-secondary/20'}`}>
                          <td className="px-4 py-3 text-muted-foreground font-mono">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{m.name}</div>
                            {m.mote && <div className="text-xs text-muted-foreground">"{m.mote}"</div>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-mono hidden sm:table-cell">
                            {m.numero_roa ?? '—'}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                              {ROLE_LABELS[m.role] ?? m.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${m.absent >= 3 ? 'text-red-600' : 'text-red-500'}`}>
                              {m.absent}
                              {m.absent >= 3 && <span className="ml-1 text-xs">⚠</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-amber-600 hidden sm:table-cell">{m.late}</td>
                          <td className="px-4 py-3 text-center font-semibold text-green-700">{m.attended}</td>
                          <td className="px-4 py-3 text-center">
                            {rate !== null ? (
                              <span className={`font-medium ${rate >= 70 ? 'text-green-700' : rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                {rate}%
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="text-xs text-muted-foreground mt-2">
              Filas resaltadas en rojo indican 3 o más inasistencias en el período.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({
  label, value, icon, color,
}: {
  label: string;
  value: number | string;
  icon: string;
  color?: 'green' | 'red' | 'amber';
}) {
  const valueColor =
    color === 'green' ? 'text-green-600' :
    color === 'red' ? 'text-red-600' :
    color === 'amber' ? 'text-amber-600' : '';
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground leading-tight">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </Card>
  );
}
