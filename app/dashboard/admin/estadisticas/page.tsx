'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser, supabase } from '@/lib/auth';

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

          {/* Events table */}
          <div>
            <h2 className="text-base font-semibold mb-3">
              Eventos en {RANGE_LABELS[range].toLowerCase()}
            </h2>
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
