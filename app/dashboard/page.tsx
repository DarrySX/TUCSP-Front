'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser, supabase } from '@/lib/auth';

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  avgAttendees: number;
  myRsvps: number;
  myAttended: number;
  myAbsences: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string | null;
  event_type: string;
  rsvp_count: number;
  has_rsvp: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  presentacion: 'Presentación',
  ensayo: 'Ensayo',
  serenata: 'Serenata',
  acto_academico: 'Acto Académico',
  reunion: 'Reunión',
  otro: 'Otro',
};

export default function UserDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;
      setUserId(user.id);

      const [
        { data: profile },
        { data: allEvents },
        { data: myRsvps },
        { data: myAttendance },
      ] = await Promise.all([
        supabase.from('profiles').select('full_name, mote').eq('id', user.id).single(),
        supabase.from('events').select('id, status, event_rsvps(count)'),
        supabase.from('event_rsvps').select('event_id').eq('user_id', user.id),
        supabase.from('event_attendance').select('attended').eq('user_id', user.id),
      ]);

      setUserName(profile?.mote ? `"${profile.mote}"` : profile?.full_name ?? null);

      const events = allEvents ?? [];
      const completed = events.filter((e) => e.status === 'completed');
      const totalAttendees = completed.reduce((sum, e) => sum + ((e.event_rsvps as { count: number }[])[0]?.count ?? 0), 0);
      const avgAttendees = completed.length > 0 ? Math.round(totalAttendees / completed.length) : 0;

      const attended = (myAttendance ?? []).filter((a) => a.attended).length;
      const absences = (myAttendance ?? []).filter((a) => !a.attended).length;

      setStats({
        totalEvents: events.length,
        upcomingEvents: events.filter((e) => e.status === 'upcoming').length,
        avgAttendees,
        myRsvps: myRsvps?.length ?? 0,
        myAttended: attended,
        myAbsences: absences,
      });

      // Load upcoming events with user's RSVP status
      const myRsvpIds = new Set(myRsvps?.map((r) => r.event_id) ?? []);
      const { data: upcomingData } = await supabase
        .from('events')
        .select('id, title, date, location, event_type, event_rsvps(count)')
        .eq('status', 'upcoming')
        .order('date')
        .limit(4);

      setUpcoming(
        (upcomingData ?? []).map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          location: e.location,
          event_type: e.event_type,
          rsvp_count: (e.event_rsvps as { count: number }[])[0]?.count ?? 0,
          has_rsvp: myRsvpIds.has(e.id),
        }))
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRsvp(eventId: string, hasRsvp: boolean) {
    if (!userId || rsvpLoading) return;
    setRsvpLoading(eventId);
    try {
      if (hasRsvp) {
        await supabase.from('event_rsvps').delete().match({ event_id: eventId, user_id: userId });
      } else {
        await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId });
      }
      setUpcoming((prev) => prev.map((e) =>
        e.id === eventId
          ? { ...e, has_rsvp: !hasRsvp, rsvp_count: e.rsvp_count + (hasRsvp ? -1 : 1) }
          : e
      ));
    } finally {
      setRsvpLoading(null);
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="space-y-8">

        {/* Bienvenida */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Bienvenido{userName ? `, ${userName}` : ''} 👋
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Mantente al día con la UCSP Tuna
          </p>
        </div>

        {/* Estadísticas generales */}
        {stats && (
          <>
            <div>
              <h2 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Estadísticas Generales
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard icon="🎵" label="Total Presentaciones" value={stats.totalEvents} />
                <StatCard icon="📅" label="Próximas" value={stats.upcomingEvents} />
                <StatCard icon="👥" label="Promedio de Asistentes" value={stats.avgAttendees} />
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Mi Participación
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <StatCard icon="✓" label="Eventos Confirmados" value={stats.myRsvps} />
                <StatCard icon="🎉" label="Asistencias" value={stats.myAttended} color="green" />
                <StatCard icon="⚠" label="Faltas" value={stats.myAbsences} color="red" />
              </div>
            </div>
          </>
        )}

        {/* Próximas presentaciones */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Próximas Presentaciones</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/events">Ver todas</Link>
            </Button>
          </div>

          {upcoming.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No hay presentaciones próximas programadas.
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {upcoming.map((event) => (
                <Card key={event.id} className="p-5">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                      </span>
                      <h3 className="font-semibold mt-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        📅 {new Date(event.date).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Lima' })}
                        {' · '}
                        🕐 {new Date(event.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' })}
                      </p>
                      {event.location && <p className="text-sm text-muted-foreground">📍 {event.location}</p>}
                      <p className="text-sm text-muted-foreground">👥 {event.rsvp_count} confirmados</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {event.has_rsvp && (
                        <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          ✓ Confirmado
                        </span>
                      )}
                      <div className="flex gap-2 ml-auto">
                        <Button
                          size="sm"
                          variant={event.has_rsvp ? 'outline' : 'default'}
                          disabled={rsvpLoading === event.id}
                          onClick={() => handleRsvp(event.id, event.has_rsvp)}
                          className={event.has_rsvp ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}
                        >
                          {rsvpLoading === event.id ? '...' : event.has_rsvp ? 'Cancelar' : 'Confirmar'}
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/dashboard/events/${event.id}`}>Ver</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: number;
  color?: 'green' | 'red';
}) {
  const valueColor = color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : '';
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
