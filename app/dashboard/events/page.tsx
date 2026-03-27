'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { getCurrentUser, supabase } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────────────────────────

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  event_type: string;
  status: string;
  created_at: string;
  creator: { full_name: string | null; mote: string | null } | null;
  event_rsvps: { count: number }[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<string, string> = {
  presentacion: 'Presentación',
  ensayo: 'Ensayo',
  serenata: 'Serenata',
  acto_academico: 'Acto Académico',
  reunion: 'Reunión',
  otro: 'Otro',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  presentacion: 'bg-primary/10 text-primary border-primary/20',
  ensayo: 'bg-blue-50 text-blue-700 border-blue-200',
  serenata: 'bg-pink-50 text-pink-700 border-pink-200',
  acto_academico: 'bg-purple-50 text-purple-700 border-purple-200',
  reunion: 'bg-orange-50 text-orange-700 border-orange-200',
  otro: 'bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Próximo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

// ── Timezone helpers (Peru = America/Lima, UTC-5, no DST) ─────────────────────

const LIMA_TZ = 'America/Lima';

/** Formats a UTC ISO string as date in Lima timezone */
function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: LIMA_TZ,
  });
}

/** Formats a UTC ISO string as time in Lima timezone */
function formatEventTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-PE', {
    hour: '2-digit', minute: '2-digit',
    timeZone: LIMA_TZ,
  });
}

/** Extracts "YYYY-MM-DD" from a UTC ISO string, in Lima timezone */
function peruDateInput(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: LIMA_TZ }).format(new Date(iso));
}

/** Extracts "HH:MM" from a UTC ISO string, in Lima timezone */
function peruTimeInput(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LIMA_TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso));
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [myRsvpIds, setMyRsvpIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'mine'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '', time: '', location: '', event_type: 'presentacion', status: 'upcoming' });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    event_type: 'presentacion',
  });

  // ── Load data ────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: profile }, { data: eventsData }, { data: rsvpsData }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase
          .from('events')
          .select('*, creator:created_by(full_name, mote), event_rsvps(count)')
          .order('date', { ascending: false }),
        supabase.from('event_rsvps').select('event_id').eq('user_id', user.id),
      ]);

      setUserRole(profile?.role ?? null);
      setEvents((eventsData as EventRow[]) ?? []);
      setMyRsvpIds(new Set(rsvpsData?.map((r) => r.event_id) ?? []));
    } finally {
      setIsLoading(false);
    }
  }

  // ── RSVP toggle ──────────────────────────────────────────────────────────────

  async function handleRsvp(eventId: string) {
    if (!userId || rsvpLoading) return;
    setRsvpLoading(eventId);
    try {
      if (myRsvpIds.has(eventId)) {
        await supabase.from('event_rsvps').delete().match({ event_id: eventId, user_id: userId });
        setMyRsvpIds((prev) => { const s = new Set(prev); s.delete(eventId); return s; });
        setEvents((prev) => prev.map((e) =>
          e.id === eventId
            ? { ...e, event_rsvps: [{ count: Math.max(0, (e.event_rsvps[0]?.count ?? 1) - 1) }] }
            : e
        ));
      } else {
        await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId });
        setMyRsvpIds((prev) => new Set([...prev, eventId]));
        setEvents((prev) => prev.map((e) =>
          e.id === eventId
            ? { ...e, event_rsvps: [{ count: (e.event_rsvps[0]?.count ?? 0) + 1 }] }
            : e
        ));
      }
    } finally {
      setRsvpLoading(null);
    }
  }

  // ── Create event ─────────────────────────────────────────────────────────────

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId || !newEvent.title || !newEvent.date) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const datetime = `${newEvent.date}T${newEvent.time || '00:00'}:00-05:00`;
      const { error } = await supabase.from('events').insert({
        title: newEvent.title,
        description: newEvent.description || null,
        date: datetime,
        location: newEvent.location || null,
        event_type: newEvent.event_type,
        created_by: userId,
        updated_by: userId,
      });
      if (error) throw error;
      setShowCreate(false);
      setNewEvent({ title: '', description: '', date: '', time: '', location: '', event_type: 'presentacion' });
      await loadAll();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear el evento');
    } finally {
      setIsCreating(false);
    }
  }

  // ── Edit event ───────────────────────────────────────────────────────────────

  function handleOpenEdit(ev: EventRow) {
    setEditForm({
      title: ev.title,
      description: ev.description ?? '',
      date: peruDateInput(ev.date),
      time: peruTimeInput(ev.date),
      location: ev.location ?? '',
      event_type: ev.event_type,
      status: ev.status,
    });
    setEditingEvent(ev);
    setEditError(null);
  }

  async function handleEdit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingEvent || !userId) return;
    setIsEditing(true);
    setEditError(null);
    try {
      const datetime = `${editForm.date}T${editForm.time || '00:00'}:00-05:00`;
      const { error } = await supabase.from('events').update({
        title: editForm.title,
        description: editForm.description || null,
        date: datetime,
        location: editForm.location || null,
        event_type: editForm.event_type,
        status: editForm.status,
        updated_by: userId,
      }).eq('id', editingEvent.id);
      if (error) throw error;
      setEditingEvent(null);
      await loadAll();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al editar el evento');
    } finally {
      setIsEditing(false);
    }
  }

  // ── Delete event ─────────────────────────────────────────────────────────────

  async function handleDeleteEvent() {
    if (!deletingEventId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('events').delete().eq('id', deletingEventId);
      if (error) throw error;
      setDeletingEventId(null);
      await loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Filter ───────────────────────────────────────────────────────────────────

  const filtered = events.filter((e) => {
    if (filter === 'upcoming') return e.status === 'upcoming';
    if (filter === 'completed') return e.status === 'completed';
    if (filter === 'mine') return myRsvpIds.has(e.id);
    return true;
  });

  const isAdmin = userRole === 'super_admin' || userRole === 'tuno_admin';

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Presentaciones</h1>
            <p className="text-muted-foreground mt-1">
              {events.length} evento{events.length !== 1 ? 's' : ''} registrados
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreate(true)} className="sm:self-start">
              + Nuevo Evento
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b overflow-x-auto">
          {([
            ['all', 'Todos'],
            ['upcoming', 'Próximos'],
            ['completed', 'Finalizados'],
            ['mine', 'Mis eventos'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                filter === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Events grid */}
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Cargando eventos...</div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No hay eventos en esta categoría.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((event) => {
              const rsvpCount = event.event_rsvps[0]?.count ?? 0;
              const hasRsvp = myRsvpIds.has(event.id);
              const isUpcoming = event.status === 'upcoming';

              return (
                <Card key={event.id} className="flex flex-col p-5 hover:shadow-md transition-shadow">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${EVENT_TYPE_COLORS[event.event_type] ?? 'bg-muted'}`}>
                      {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[event.status] ?? 'bg-muted'}`}>
                      {STATUS_LABELS[event.status] ?? event.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold leading-tight mb-3">{event.title}</h3>

                  {/* Info */}
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-3 flex-1">
                    <p>📅 {formatEventDate(event.date)}</p>
                    <p>🕐 {formatEventTime(event.date)}</p>
                    {event.location && <p>📍 {event.location}</p>}
                    <p>👥 {rsvpCount} confirmado{rsvpCount !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Description preview */}
                  {event.description && (
                    <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{event.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t mt-auto">
                    {isUpcoming && (
                      hasRsvp ? (
                        <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                          ✓ Confirmado
                        </span>
                      ) : null
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {isUpcoming && (
                        <Button
                          size="sm"
                          variant={hasRsvp ? 'outline' : 'default'}
                          disabled={rsvpLoading === event.id}
                          onClick={() => handleRsvp(event.id)}
                          className={hasRsvp ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}
                        >
                          {rsvpLoading === event.id
                            ? '...'
                            : hasRsvp ? 'Cancelar' : 'Confirmar'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/events/${event.id}`}>Ver detalle</Link>
                      </Button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(event)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
                            title="Editar evento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingEventId(event.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                            title="Eliminar evento"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit event dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            {editError && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{editError}</p>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Concierto de Primavera"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha *</label>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <Input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm((p) => ({ ...p, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo *</label>
                <select
                  value={editForm.event_type}
                  onChange={(e) => setEditForm((p) => ({ ...p, event_type: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  {Object.entries(EVENT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lugar</label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Auditorio Principal"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Detalles del evento..."
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingEvent(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingEventId} onOpenChange={(open) => !open && setDeletingEventId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar evento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta acción es permanente. Se eliminarán también todos los registros de asistencia y confirmaciones asociados.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeletingEventId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteEvent}
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create event dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Evento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{createError}</p>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                placeholder="Concierto de Primavera"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha *</label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora</label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent((p) => ({ ...p, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo *</label>
              <select
                value={newEvent.event_type}
                onChange={(e) => setNewEvent((p) => ({ ...p, event_type: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lugar</label>
              <Input
                value={newEvent.location}
                onChange={(e) => setNewEvent((p) => ({ ...p, location: e.target.value }))}
                placeholder="Auditorio Principal"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                placeholder="Detalles del evento..."
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creando...' : 'Crear Evento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
