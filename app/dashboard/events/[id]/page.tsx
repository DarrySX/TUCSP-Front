'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentUser, supabase } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────────────────────────

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  event_type: string;
  status: string;
  created_at: string;
  created_by: string;
  creator: { full_name: string | null; mote: string | null } | null;
}

interface RsvpEntry {
  id: string;
  user_id: string;
  created_at: string;
  profile: {
    full_name: string | null;
    mote: string | null;
    role: string | null;
    avatar_url: string | null;
    numero_roa: number | null;
  } | null;
}

interface AttendanceEntry {
  id: string;
  user_id: string;
  attended: boolean;
  marked_at: string;
  marker: { full_name: string | null } | null;
  profile: {
    full_name: string | null;
    mote: string | null;
    avatar_url: string | null;
    numero_roa: number | null;
  } | null;
}

interface CommentEntry {
  id: string;
  user_id: string;
  content: string;
  edited: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string | null;
    mote: string | null;
    avatar_url: string | null;
  } | null;
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

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  tuno_admin: 'Admin Tuna',
  tuno: 'Tuno',
  pardillo: 'Pardillo',
  aspirante: 'Aspirante',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} día${days !== 1 ? 's' : ''}`;
}

function Avatar({ profile, size = 'md' }: {
  profile: { full_name: string | null; avatar_url: string | null } | null;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initials = profile?.full_name
    ? profile.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';
  if (profile?.avatar_url) {
    return (
      <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 relative`}>
        <Image src={profile.avatar_url} alt={profile.full_name ?? ''} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasRsvp, setHasRsvp] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, [eventId]);

  async function loadAll() {
    setIsLoading(true);
    setError(null);
    try {
      const user = await getCurrentUser();
      if (!user) { router.push('/auth/login'); return; }
      setUserId(user.id);

      const [
        { data: profileData },
        { data: eventData, error: eventErr },
        { data: rsvpData },
        { data: attendanceData },
        { data: commentsData },
        { data: myRsvp },
      ] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase.from('events').select('*, creator:created_by(full_name, mote)').eq('id', eventId).single(),
        supabase.from('event_rsvps').select('id, user_id, created_at, profile:user_id(full_name, mote, role, avatar_url, numero_roa)').eq('event_id', eventId).order('created_at'),
        supabase.from('event_attendance').select('id, user_id, attended, marked_at, marker:marked_by(full_name), profile:user_id(full_name, mote, avatar_url, numero_roa)').eq('event_id', eventId),
        supabase.from('event_comments').select('id, user_id, content, edited, created_at, updated_at, profile:user_id(full_name, mote, avatar_url)').eq('event_id', eventId).order('created_at'),
        supabase.from('event_rsvps').select('id').match({ event_id: eventId, user_id: user.id }).maybeSingle(),
      ]);

      if (eventErr) { setError('Evento no encontrado'); return; }

      setUserRole(profileData?.role ?? null);
      setEvent(eventData as EventDetail);
      setRsvps((rsvpData as RsvpEntry[]) ?? []);
      setAttendance((attendanceData as AttendanceEntry[]) ?? []);
      setComments((commentsData as CommentEntry[]) ?? []);
      setHasRsvp(!!myRsvp);

      // Initialize attendance map from existing records
      const map: Record<string, boolean> = {};
      (attendanceData as AttendanceEntry[])?.forEach((a) => { map[a.user_id] = a.attended; });
      setAttendanceMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  }

  // ── RSVP ─────────────────────────────────────────────────────────────────────

  async function handleRsvp() {
    if (!userId || rsvpLoading) return;
    setRsvpLoading(true);
    try {
      if (hasRsvp) {
        await supabase.from('event_rsvps').delete().match({ event_id: eventId, user_id: userId });
        setHasRsvp(false);
        setRsvps((prev) => prev.filter((r) => r.user_id !== userId));
      } else {
        const { data } = await supabase.from('event_rsvps')
          .insert({ event_id: eventId, user_id: userId })
          .select('id, user_id, created_at, profile:user_id(full_name, mote, role, avatar_url, numero_roa)')
          .single();
        setHasRsvp(true);
        if (data) setRsvps((prev) => [...prev, data as RsvpEntry]);
      }
    } finally {
      setRsvpLoading(false);
    }
  }

  // ── Comments ──────────────────────────────────────────────────────────────────

  async function handleAddComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      const { data } = await supabase.from('event_comments')
        .insert({ event_id: eventId, user_id: userId, content: newComment.trim() })
        .select('id, user_id, content, edited, created_at, updated_at, profile:user_id(full_name, mote, avatar_url)')
        .single();
      if (data) setComments((prev) => [...prev, data as CommentEntry]);
      setNewComment('');
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editCommentText.trim()) return;
    const { error } = await supabase.from('event_comments')
      .update({ content: editCommentText.trim(), edited: true })
      .eq('id', commentId);
    if (!error) {
      setComments((prev) => prev.map((c) =>
        c.id === commentId ? { ...c, content: editCommentText.trim(), edited: true } : c
      ));
      setEditingCommentId(null);
    }
  }

  async function handleDeleteComment(commentId: string) {
    const { error } = await supabase.from('event_comments').delete().eq('id', commentId);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  // ── Attendance ────────────────────────────────────────────────────────────────

  async function handleSaveAttendance() {
    if (!userId) return;
    setAttendanceSaving(true);
    try {
      const upserts = rsvps.map((r) => ({
        event_id: eventId,
        user_id: r.user_id,
        attended: attendanceMap[r.user_id] ?? false,
        marked_by: userId,
      }));
      const { error } = await supabase.from('event_attendance').upsert(upserts, { onConflict: 'event_id,user_id' });
      if (error) throw error;
      setSuccessMsg('Asistencia guardada');
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar asistencia');
    } finally {
      setAttendanceSaving(false);
    }
  }

  // ── Change status ─────────────────────────────────────────────────────────────

  async function handleStatusChange(newStatus: string) {
    if (!userId || !event) return;
    setStatusChanging(true);
    try {
      const { error } = await supabase.from('events')
        .update({ status: newStatus, updated_by: userId })
        .eq('id', eventId);
      if (error) throw error;
      setEvent((prev) => prev ? { ...prev, status: newStatus } : prev);
    } finally {
      setStatusChanging(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const isAdmin = userRole === 'super_admin' || userRole === 'tuno_admin';
  const isCompleted = event?.status === 'completed';
  const isUpcoming = event?.status === 'upcoming';
  const attendedCount = attendance.filter((a) => a.attended).length;

  if (isLoading) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Cargando...</div>;
  if (error || !event) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-destructive mb-4">{error ?? 'Evento no encontrado'}</p>
      <Button variant="outline" onClick={() => router.back()}>Volver</Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">

        {/* Back + status messages */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>← Volver</Button>
        </div>

        {successMsg && <div className="bg-primary/10 border border-primary rounded-lg p-3 text-sm text-primary">{successMsg}</div>}
        {error && <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-sm text-destructive">{error}</div>}

        {/* Event header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${EVENT_TYPE_COLORS[event.event_type] ?? 'bg-muted'}`}>
                  {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[event.status] ?? 'bg-muted'}`}>
                  {STATUS_LABELS[event.status] ?? event.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">{event.title}</h1>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>📅 {formatDateTime(event.date)}</p>
                {event.location && <p>📍 {event.location}</p>}
                {event.creator && (
                  <p>👤 Creado por <span className="font-medium text-foreground">
                    {event.creator.full_name}{event.creator.mote ? ` "${event.creator.mote}"` : ''}
                  </span></p>
                )}
                <p>👥 {rsvps.length} confirmado{rsvps.length !== 1 ? 's' : ''}
                  {isCompleted && ` · ${attendedCount} asistieron`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:items-end">
              {isUpcoming && (
                <Button
                  onClick={handleRsvp}
                  disabled={rsvpLoading}
                  variant={hasRsvp ? 'outline' : 'default'}
                  className={hasRsvp ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}
                >
                  {rsvpLoading ? '...' : hasRsvp ? 'Cancelar asistencia' : 'Confirmar asistencia'}
                </Button>
              )}
              {isAdmin && isUpcoming && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={statusChanging}
                  onClick={() => handleStatusChange('completed')}
                >
                  Marcar como finalizado
                </Button>
              )}
              {isAdmin && isUpcoming && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={statusChanging}
                  onClick={() => handleStatusChange('cancelled')}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  Cancelar evento
                </Button>
              )}
            </div>
          </div>

          {event.description && (
            <div className="mt-4 pt-4 border-t text-sm leading-relaxed">{event.description}</div>
          )}
        </Card>

        {/* RSVPs */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Asistentes confirmados
            <span className="ml-2 text-sm font-normal text-muted-foreground">({rsvps.length})</span>
          </h2>
          {rsvps.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nadie ha confirmado asistencia aún.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {rsvps.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Avatar profile={r.profile} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{r.profile?.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.profile?.mote ? `"${r.profile.mote}" · ` : ''}
                      {ROLE_LABELS[r.profile?.role ?? ''] ?? r.profile?.role ?? ''}
                      {r.profile?.numero_roa ? ` · ROA #${r.profile.numero_roa}` : ''}
                    </p>
                  </div>
                  {isCompleted && attendance.find((a) => a.user_id === r.user_id) && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      attendance.find((a) => a.user_id === r.user_id)?.attended
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {attendance.find((a) => a.user_id === r.user_id)?.attended ? '✓ Asistió' : '✗ Faltó'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Attendance (admin only, when completed) */}
        {isAdmin && isCompleted && rsvps.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-1">Tomar Asistencia</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Marca quién asistió efectivamente al evento.
            </p>
            <div className="space-y-2 mb-4">
              {rsvps.map((r) => (
                <label key={r.user_id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attendanceMap[r.user_id] ?? false}
                    onChange={(e) => setAttendanceMap((prev) => ({ ...prev, [r.user_id]: e.target.checked }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <Avatar profile={r.profile} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{r.profile?.full_name ?? '—'}</p>
                    {r.profile?.mote && <p className="text-xs text-muted-foreground">"{r.profile.mote}"</p>}
                  </div>
                  {attendanceMap[r.user_id] && (
                    <span className="text-xs text-green-600 font-medium flex-shrink-0">Asistió</span>
                  )}
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {Object.values(attendanceMap).filter(Boolean).length} de {rsvps.length} marcados
              </p>
              <Button onClick={handleSaveAttendance} disabled={attendanceSaving}>
                {attendanceSaving ? 'Guardando...' : 'Guardar asistencia'}
              </Button>
            </div>
          </Card>
        )}

        {/* Comments */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Comentarios
            <span className="ml-2 text-sm font-normal text-muted-foreground">({comments.length})</span>
          </h2>

          {/* Add comment */}
          <form onSubmit={handleAddComment} className="mb-6">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              rows={2}
              className="mb-2"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={commentLoading || !newComment.trim()}>
                {commentLoading ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </form>

          {/* Comments list */}
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sé el primero en comentar.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar profile={c.profile} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium text-sm">{c.profile?.full_name ?? '—'}</span>
                      {c.profile?.mote && <span className="text-xs text-muted-foreground">"{c.profile.mote}"</span>}
                      <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                      {c.edited && <span className="text-xs text-muted-foreground italic">(editado)</span>}
                    </div>

                    {editingCommentId === c.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditComment(c.id)}>Guardar</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-1 leading-relaxed">{c.content}</p>
                    )}

                    {/* Edit/delete actions */}
                    {editingCommentId !== c.id && (
                      <div className="flex gap-3 mt-1.5">
                        {c.user_id === userId && (
                          <button
                            onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.content); }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Editar
                          </button>
                        )}
                        {(c.user_id === userId || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-xs text-muted-foreground hover:text-destructive"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
