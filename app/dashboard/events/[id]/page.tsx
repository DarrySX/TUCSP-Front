'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  is_late: boolean;
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

interface MemberOption {
  id: string;
  full_name: string | null;
  mote: string | null;
  numero_roa: number | null;
  role: string;
}

interface ReplacementRequest {
  id: string;
  event_id: string;
  requester_id: string;
  replacement_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  requester?: { full_name: string | null; mote: string | null } | null;
  replacement?: { full_name: string | null; mote: string | null } | null;
}

type AttendStatus = 'present' | 'late' | 'absent';

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

const ATTEND_CONFIG: Record<AttendStatus, { label: string; activeClass: string; badgeClass: string; icon: string }> = {
  present: {
    label: 'Asistió',
    icon: '✓',
    activeClass: 'bg-green-500 text-white border-green-500',
    badgeClass: 'bg-green-100 text-green-700',
  },
  late: {
    label: 'Tardanza',
    icon: '⚠',
    activeClass: 'bg-amber-500 text-white border-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  absent: {
    label: 'Faltó',
    icon: '✗',
    activeClass: 'bg-red-500 text-white border-red-500',
    badgeClass: 'bg-red-100 text-red-600',
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const LIMA_TZ = 'America/Lima';

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: LIMA_TZ,
  });
}

function peruDateInput(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: LIMA_TZ }).format(new Date(iso));
}

function peruTimeInput(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LIMA_TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso));
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} día${Math.floor(hrs / 24) !== 1 ? 's' : ''}`;
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
      <div className={`${dim} rounded-full overflow-hidden shrink-0 relative`}>
        <Image src={profile.avatar_url} alt={profile.full_name ?? ''} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function attendStatusFromRecord(a: AttendanceEntry): AttendStatus {
  if (a.is_late) return 'late';
  if (a.attended) return 'present';
  return 'absent';
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent]                   = useState<EventDetail | null>(null);
  const [rsvps, setRsvps]                   = useState<RsvpEntry[]>([]);
  const [attendance, setAttendance]         = useState<AttendanceEntry[]>([]);
  const [comments, setComments]             = useState<CommentEntry[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [userId, setUserId]                 = useState<string | null>(null);
  const [userRole, setUserRole]             = useState<string | null>(null);
  const [hasRsvp, setHasRsvp]               = useState(false);
  const [rsvpLoading, setRsvpLoading]       = useState(false);
  const [newComment, setNewComment]         = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText]   = useState('');
  const [attendanceMap, setAttendanceMap]   = useState<Record<string, AttendStatus>>({});
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [successMsg, setSuccessMsg]         = useState<string | null>(null);

  // Edit / delete state
  const [showEdit, setShowEdit]                   = useState(false);
  const [editForm, setEditForm]                   = useState({ title: '', description: '', date: '', time: '', location: '', event_type: 'presentacion', status: 'upcoming' });
  const [isEditing, setIsEditing]                 = useState(false);
  const [editError, setEditError]                 = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting]               = useState(false);
  const [linkCopied, setLinkCopied]               = useState(false);

  // Register member state
  const [showRegister, setShowRegister]           = useState(false);
  const [availableMembers, setAvailableMembers]   = useState<MemberOption[]>([]);
  const [registerSearch, setRegisterSearch]       = useState('');
  const [registerLoading, setRegisterLoading]     = useState(false);
  const [registerLoadingId, setRegisterLoadingId] = useState<string | null>(null);

  // Replacement request state
  const [showReplaceModal, setShowReplaceModal]   = useState(false);
  const [replaceSearch, setReplaceSearch]         = useState('');
  const [replaceMembers, setReplaceMembers]       = useState<MemberOption[]>([]);
  const [replaceMembersLoading, setReplaceMembersLoading] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState<MemberOption | null>(null);
  const [replaceSubmitting, setReplaceSubmitting] = useState(false);
  const [pendingReplaceOut, setPendingReplaceOut] = useState<ReplacementRequest | null>(null);
  const [pendingReplaceIn, setPendingReplaceIn]   = useState<ReplacementRequest | null>(null);
  const [respondingReplace, setRespondingReplace] = useState(false);

  useEffect(() => { loadAll(); }, [eventId]);

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
        { data: replaceOutData },
        { data: replaceInData },
      ] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase.from('events').select('*, creator:created_by(full_name, mote)').eq('id', eventId).single(),
        supabase.from('event_rsvps').select('id, user_id, created_at, profile:user_id(full_name, mote, role, avatar_url, numero_roa)').eq('event_id', eventId).order('created_at'),
        supabase.from('event_attendance').select('id, user_id, attended, is_late, marked_at, marker:marked_by(full_name), profile:user_id(full_name, mote, avatar_url, numero_roa)').eq('event_id', eventId),
        supabase.from('event_comments').select('id, user_id, content, edited, created_at, updated_at, profile:user_id(full_name, mote, avatar_url)').eq('event_id', eventId).order('created_at'),
        supabase.from('event_rsvps').select('id').match({ event_id: eventId, user_id: user.id }).maybeSingle(),
        supabase.from('rsvp_replacement_requests')
          .select('*, replacement:replacement_id(full_name, mote)')
          .eq('event_id', eventId).eq('requester_id', user.id).eq('status', 'pending').maybeSingle(),
        supabase.from('rsvp_replacement_requests')
          .select('*, requester:requester_id(full_name, mote)')
          .eq('event_id', eventId).eq('replacement_id', user.id).eq('status', 'pending').maybeSingle(),
      ]);

      if (eventErr) { setError('Evento no encontrado'); return; }

      setUserRole(profileData?.role ?? null);
      setEvent(eventData as EventDetail);
      setRsvps((rsvpData as unknown as RsvpEntry[]) ?? []);
      setAttendance((attendanceData as unknown as AttendanceEntry[]) ?? []);
      setComments((commentsData as unknown as CommentEntry[]) ?? []);
      setHasRsvp(!!myRsvp);
      setPendingReplaceOut((replaceOutData as unknown as ReplacementRequest) ?? null);
      setPendingReplaceIn((replaceInData as unknown as ReplacementRequest) ?? null);

      const map: Record<string, AttendStatus> = {};
      (attendanceData as unknown as AttendanceEntry[])?.forEach((a) => {
        map[a.user_id] = attendStatusFromRecord(a);
      });
      setAttendanceMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  }

  // ── RSVP (own) ────────────────────────────────────────────────────────────────

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
        if (data) setRsvps((prev) => [...prev, data as unknown as RsvpEntry]);
      }
    } finally {
      setRsvpLoading(false);
    }
  }

  // ── Edit event (admin) ───────────────────────────────────────────────────────

  function handleOpenEdit() {
    if (!event) return;
    setEditForm({
      title: event.title,
      description: event.description ?? '',
      date: peruDateInput(event.date),
      time: peruTimeInput(event.date),
      location: event.location ?? '',
      event_type: event.event_type,
      status: event.status,
    });
    setEditError(null);
    setShowEdit(true);
  }

  async function handleEdit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event || !userId) return;
    setIsEditing(true);
    setEditError(null);
    try {
      const datetime = `${editForm.date}T${editForm.time || '00:00'}:00-05:00`;
      const { error: err } = await supabase.from('events').update({
        title: editForm.title,
        description: editForm.description || null,
        date: datetime,
        location: editForm.location || null,
        event_type: editForm.event_type,
        status: editForm.status,
        updated_by: userId,
      }).eq('id', eventId);
      if (err) throw err;
      setShowEdit(false);
      await loadAll();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setIsEditing(false);
    }
  }

  // ── Copy share link ──────────────────────────────────────────────────────────

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  // ── Delete event (admin) ──────────────────────────────────────────────────────

  async function handleDeleteEvent() {
    if (!userId) return;
    setIsDeleting(true);
    try {
      const { error: err } = await supabase.rpc('admin_delete_event', { p_event_id: eventId });
      if (err) throw err;
      router.push('/dashboard/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  // ── Replacement request ───────────────────────────────────────────────────────

  async function openReplaceModal() {
    setSelectedReplacement(null);
    setReplaceSearch('');
    setShowReplaceModal(true);
    setReplaceMembersLoading(true);
    try {
      const rsvpUserIds = new Set(rsvps.map((r) => r.user_id));
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, mote, numero_roa, role')
        .order('full_name');
      setReplaceMembers(
        ((data as MemberOption[]) ?? []).filter((m) => !rsvpUserIds.has(m.id) && m.id !== userId)
      );
    } finally {
      setReplaceMembersLoading(false);
    }
  }

  async function handleRequestReplacement() {
    if (!selectedReplacement) return;
    setReplaceSubmitting(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc('request_rsvp_replacement', {
        p_event_id: eventId,
        p_replacement_id: selectedReplacement.id,
      });
      if (rpcErr) throw rpcErr;
      setShowReplaceModal(false);
      await loadAll();
      setSuccessMsg('Solicitud enviada. El miembro recibirá una notificación.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud');
    } finally {
      setReplaceSubmitting(false);
    }
  }

  async function handleRespondReplacement(accept: boolean) {
    if (!pendingReplaceIn) return;
    setRespondingReplace(true);
    try {
      const { error: rpcErr } = await supabase.rpc('respond_rsvp_replacement', {
        p_request_id: pendingReplaceIn.id,
        p_accept: accept,
      });
      if (rpcErr) throw rpcErr;
      await loadAll();
      setSuccessMsg(accept ? 'Aceptaste el reemplazo. ¡Ahora estás en la lista!' : 'Rechazaste la solicitud.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al responder');
    } finally {
      setRespondingReplace(false);
    }
  }

  // ── Register member (admin) ───────────────────────────────────────────────────

  async function openRegisterDialog() {
    setRegisterSearch('');
    setShowRegister(true);
    setRegisterLoading(true);
    try {
      const rsvpUserIds = new Set(rsvps.map((r) => r.user_id));
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, mote, numero_roa, role')
        .order('full_name');
      setAvailableMembers(
        ((data as MemberOption[]) ?? []).filter((m) => !rsvpUserIds.has(m.id))
      );
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleRegisterMember(targetId: string) {
    if (!userId) return;
    setRegisterLoadingId(targetId);
    try {
      const { error: rpcErr } = await supabase.rpc('admin_register_rsvp', {
        p_event_id: eventId,
        p_target_user_id: targetId,
      });
      if (rpcErr) throw rpcErr;

      // Fetch the new RSVP entry to add to local state
      const { data: newEntry } = await supabase
        .from('event_rsvps')
        .select('id, user_id, created_at, profile:user_id(full_name, mote, role, avatar_url, numero_roa)')
        .match({ event_id: eventId, user_id: targetId })
        .single();

      if (newEntry) setRsvps((prev) => [...prev, newEntry as unknown as RsvpEntry]);
      setAvailableMembers((prev) => prev.filter((m) => m.id !== targetId));
      setSuccessMsg('Miembro registrado correctamente');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setRegisterLoadingId(null);
    }
  }

  async function handleAdminRemoveRsvp(targetId: string) {
    if (!userId) return;
    try {
      await supabase.rpc('admin_remove_rsvp', {
        p_event_id: eventId,
        p_target_user_id: targetId,
      });
      setRsvps((prev) => prev.filter((r) => r.user_id !== targetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al quitar registro');
    }
  }

  // ── Comments ──────────────────────────────────────────────────────────────────

  async function handleAddComment(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      const { data } = await supabase.from('event_comments')
        .insert({ event_id: eventId, user_id: userId, content: newComment.trim() })
        .select('id, user_id, content, edited, created_at, updated_at, profile:user_id(full_name, mote, avatar_url)')
        .single();
      if (data) setComments((prev) => [...prev, data as unknown as CommentEntry]);
      setNewComment('');
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editCommentText.trim()) return;
    const { error: err } = await supabase.from('event_comments')
      .update({ content: editCommentText.trim(), edited: true })
      .eq('id', commentId);
    if (!err) {
      setComments((prev) => prev.map((c) =>
        c.id === commentId ? { ...c, content: editCommentText.trim(), edited: true } : c
      ));
      setEditingCommentId(null);
    }
  }

  async function handleDeleteComment(commentId: string) {
    const { error: err } = await supabase.from('event_comments').delete().eq('id', commentId);
    if (!err) setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  // ── Attendance ────────────────────────────────────────────────────────────────

  async function handleSaveAttendance() {
    if (!userId) return;
    setAttendanceSaving(true);
    try {
      const upserts = rsvps.map((r) => {
        const status = attendanceMap[r.user_id] ?? 'absent';
        return {
          event_id: eventId,
          user_id: r.user_id,
          attended: status !== 'absent',
          is_late: status === 'late',
          marked_by: userId,
        };
      });
      const { error: err } = await supabase
        .from('event_attendance')
        .upsert(upserts, { onConflict: 'event_id,user_id' });
      if (err) throw err;
      setSuccessMsg('Asistencia guardada');
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar asistencia');
    } finally {
      setAttendanceSaving(false);
    }
  }

  // ── Status change ─────────────────────────────────────────────────────────────

  async function handleStatusChange(newStatus: string) {
    if (!userId || !event) return;
    setStatusChanging(true);
    try {
      const { error: err } = await supabase.from('events')
        .update({ status: newStatus, updated_by: userId })
        .eq('id', eventId);
      if (err) throw err;
      setEvent((prev) => prev ? { ...prev, status: newStatus } : prev);
    } finally {
      setStatusChanging(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const isAdmin    = userRole === 'super_admin' || userRole === 'tuno_admin';
  const isCompleted = event?.status === 'completed';
  const isUpcoming  = event?.status === 'upcoming';
  const attendedCount = attendance.filter((a) => a.attended).length;

  const filteredMembers = availableMembers.filter((m) => {
    const q = registerSearch.toLowerCase();
    return !q
      || m.full_name?.toLowerCase().includes(q)
      || m.mote?.toLowerCase().includes(q)
      || m.numero_roa?.toString().includes(q);
  });

  // ── Render ────────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Cargando...</div>
  );
  if (error || !event) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-destructive mb-4">{error ?? 'Evento no encontrado'}</p>
      <Button variant="outline" onClick={() => router.back()}>Volver</Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>← Volver</Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex items-center gap-1.5">
            {linkCopied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                <span className="text-green-600">¡Copiado!</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Compartir
              </>
            )}
          </Button>
        </div>

        {successMsg && (
          <div className="bg-primary/10 border border-primary rounded-lg p-3 text-sm text-primary">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Incoming replacement request banner */}
        {pendingReplaceIn && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">Solicitud de reemplazo</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground">
                  {(pendingReplaceIn.requester as any)?.full_name ?? '—'}
                </span>{' '}
                te pide que lo reemplaces en este evento.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => handleRespondReplacement(true)}
                disabled={respondingReplace}
              >
                {respondingReplace ? '...' : 'Aceptar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => handleRespondReplacement(false)}
                disabled={respondingReplace}
              >
                Rechazar
              </Button>
            </div>
          </div>
        )}

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

            <div className="flex flex-col gap-2 sm:items-end">
              {isUpcoming && !hasRsvp && (
                <Button onClick={handleRsvp} disabled={rsvpLoading}>
                  {rsvpLoading ? '...' : 'Confirmar asistencia'}
                </Button>
              )}
              {isUpcoming && hasRsvp && !pendingReplaceOut && (
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={openReplaceModal}
                  disabled={rsvpLoading}
                >
                  Cancelar asistencia
                </Button>
              )}
              {isUpcoming && pendingReplaceOut && (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    ⏳ Reemplazo pendiente
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Esperando a {(pendingReplaceOut.replacement as any)?.full_name ?? '—'}
                  </span>
                </div>
              )}
              {isAdmin && isUpcoming && (
                <Button size="sm" variant="outline" disabled={statusChanging}
                  onClick={() => handleStatusChange('completed')}>
                  Marcar como finalizado
                </Button>
              )}
              {isAdmin && isUpcoming && (
                <Button size="sm" variant="outline" disabled={statusChanging}
                  onClick={() => handleStatusChange('cancelled')}
                  className="text-destructive border-destructive hover:bg-destructive/10">
                  Cancelar evento
                </Button>
              )}
              {isAdmin && (
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant="outline" onClick={handleOpenEdit}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteConfirm(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {event.description && (
            <div className="mt-4 pt-4 border-t text-sm leading-relaxed">{event.description}</div>
          )}
        </Card>

        {/* RSVPs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-xl font-bold">
              Asistentes confirmados
              <span className="ml-2 text-sm font-normal text-muted-foreground">({rsvps.length})</span>
            </h2>
            {isAdmin && isUpcoming && (
              <Button size="sm" variant="outline" onClick={openRegisterDialog}>
                + Registrar miembro
              </Button>
            )}
          </div>

          {rsvps.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nadie ha confirmado asistencia aún.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {rsvps.map((r) => {
                const att = attendance.find((a) => a.user_id === r.user_id);
                const status = att ? attendStatusFromRecord(att) : null;
                const cfg = status ? ATTEND_CONFIG[status] : null;
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Avatar profile={r.profile} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{r.profile?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.profile?.mote ? `"${r.profile.mote}" · ` : ''}
                        {ROLE_LABELS[r.profile?.role ?? ''] ?? r.profile?.role ?? ''}
                        {r.profile?.numero_roa ? ` · ROA #${r.profile.numero_roa}` : ''}
                      </p>
                    </div>
                    {isCompleted && cfg && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.badgeClass}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    )}
                    {isAdmin && isUpcoming && r.user_id !== userId && (
                      <button
                        onClick={() => handleAdminRemoveRsvp(r.user_id)}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive transition shrink-0"
                        title="Quitar registro"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Attendance (admin only, when completed) */}
        {isAdmin && isCompleted && rsvps.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-1">Tomar Asistencia</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Marca el estado de cada participante confirmado.
            </p>
            <div className="space-y-2 mb-5">
              {rsvps.map((r) => {
                const current = attendanceMap[r.user_id] ?? 'absent';
                return (
                  <div key={r.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/10 transition">
                    <Avatar profile={r.profile} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{r.profile?.full_name ?? '—'}</p>
                      {r.profile?.mote && <p className="text-xs text-muted-foreground">"{r.profile.mote}"</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {(['present', 'late', 'absent'] as AttendStatus[]).map((s) => {
                        const cfg = ATTEND_CONFIG[s];
                        const active = current === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [r.user_id]: s }))}
                            className={`text-xs px-2 py-1 rounded border font-medium transition ${
                              active ? cfg.activeClass : 'border-border text-muted-foreground hover:border-foreground'
                            }`}
                          >
                            {cfg.icon} {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {Object.values(attendanceMap).filter((s) => s === 'present').length} asistieron ·{' '}
                {Object.values(attendanceMap).filter((s) => s === 'late').length} tardanza ·{' '}
                {Object.values(attendanceMap).filter((s) => s === 'absent').length} faltaron
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

      {/* Edit event dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
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
                <label className="text-sm font-medium">Tipo</label>
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
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>
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
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar evento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta acción es permanente. Se eliminarán también todos los registros de asistencia y confirmaciones asociados.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDeleteEvent}>
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register member dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar miembro en evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Buscar por nombre, mote o ROA..."
              value={registerSearch}
              onChange={(e) => setRegisterSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-72 overflow-y-auto divide-y rounded-lg border">
              {registerLoading ? (
                <p className="px-4 py-6 text-sm text-center text-muted-foreground">Cargando miembros...</p>
              ) : filteredMembers.length === 0 ? (
                <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                  {registerSearch ? 'Sin resultados' : 'Todos los miembros ya están registrados'}
                </p>
              ) : (
                filteredMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{m.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.mote ? `"${m.mote}" · ` : ''}
                        {ROLE_LABELS[m.role] ?? m.role}
                        {m.numero_roa ? ` · ROA #${m.numero_roa}` : ''}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={registerLoadingId === m.id}
                      onClick={() => handleRegisterMember(m.id)}
                    >
                      {registerLoadingId === m.id ? '...' : 'Registrar'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegister(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replacement selection modal */}
      <Dialog open={showReplaceModal} onOpenChange={(o) => { if (!replaceSubmitting) setShowReplaceModal(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar reemplazo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-1">
            Elige quién te reemplazará. Si acepta, saldrás de la lista y esa persona entrará en tu lugar.
          </p>
          <div className="space-y-3">
            <Input
              placeholder="Buscar por nombre o mote..."
              value={replaceSearch}
              onChange={(e) => setReplaceSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-64 overflow-y-auto divide-y rounded-lg border">
              {replaceMembersLoading ? (
                <p className="px-4 py-6 text-sm text-center text-muted-foreground">Cargando miembros...</p>
              ) : replaceMembers.filter((m) => {
                  const q = replaceSearch.toLowerCase();
                  return !q || m.full_name?.toLowerCase().includes(q) || m.mote?.toLowerCase().includes(q);
                }).length === 0 ? (
                <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                  {replaceSearch ? 'Sin resultados' : 'No hay miembros disponibles'}
                </p>
              ) : (
                replaceMembers
                  .filter((m) => {
                    const q = replaceSearch.toLowerCase();
                    return !q || m.full_name?.toLowerCase().includes(q) || m.mote?.toLowerCase().includes(q);
                  })
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedReplacement(selectedReplacement?.id === m.id ? null : m)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                        selectedReplacement?.id === m.id
                          ? 'bg-primary/10 border-l-2 border-primary'
                          : 'hover:bg-secondary/30'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{m.full_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.mote ? `"${m.mote}" · ` : ''}{ROLE_LABELS[m.role] ?? m.role}
                          {m.numero_roa ? ` · ROA #${m.numero_roa}` : ''}
                        </p>
                      </div>
                      {selectedReplacement?.id === m.id && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      )}
                    </button>
                  ))
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReplaceModal(false)} disabled={replaceSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleRequestReplacement}
              disabled={!selectedReplacement || replaceSubmitting}
            >
              {replaceSubmitting ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
