'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getCurrentUser, supabase } from '@/lib/auth';

// ── Types ──────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  mote: string | null;
  role: string;
  correo_electronico: string | null;
  numero_roa: number | null;
  carrera: string | null;
  telefono: string | null;
  telefono_emergencia: string | null;
  persona_emergencia: string | null;
  direccion: string | null;
  tipo_sangre: string | null;
  dni: string | null;
  fecha_nacimiento: string | null;
  fecha_bautizo: string | null;
  lugar_bautizo: string | null;
  tuna_origen: string | null;
  avatar_url: string | null;
  created_at: string;
}

type EditForm = Omit<UserRow, 'id' | 'created_at' | 'avatar_url'>;

type CreateFormType = {
  firstName: string; lastName: string; email: string; password: string; confirmPassword: string;
  role: string; mote: string; carrera: string; telefono: string;
  personaEmergencia: string; telefonoEmergencia: string; direccion: string;
  tipoSangre: string; dni: string; fechaNacimiento: string;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'aspirante',   label: 'Aspirante' },
  { value: 'pardillo',    label: 'Pardillo' },
  { value: 'tuno',        label: 'Tuno' },
  { value: 'tuno_admin',  label: 'Admin Tuna' },
  { value: 'super_admin', label: 'Super Admin' },
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700 border-red-200',
  tuno_admin:  'bg-orange-100 text-orange-700 border-orange-200',
  tuno:        'bg-primary/10 text-primary border-primary/20',
  pardillo:    'bg-blue-100 text-blue-700 border-blue-200',
  aspirante:   'bg-slate-100 text-slate-600 border-slate-200',
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  tuno_admin:  'Admin Tuna',
  tuno:        'Tuno',
  pardillo:    'Pardillo',
  aspirante:   'Aspirante',
};

const EMPTY_FORM: EditForm = {
  first_name: '', last_name: '', full_name: '', mote: '', role: 'aspirante',
  correo_electronico: '', numero_roa: null, carrera: '', telefono: '',
  telefono_emergencia: '', persona_emergencia: '', direccion: '',
  tipo_sangre: '', dni: '', fecha_nacimiento: '', fecha_bautizo: '',
  lugar_bautizo: '', tuna_origen: '',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function UserAvatar({ user, size = 'md' }: { user: Pick<UserRow, 'full_name' | 'avatar_url'>; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const initials = user.full_name
    ? user.full_name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';
  if (user.avatar_url) {
    return (
      <div className={`${dim} rounded-full overflow-hidden relative shrink-0`}>
        <Image src={user.avatar_url} alt={user.full_name ?? ''} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLORS[role] ?? 'bg-muted'}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Messages
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit modal
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormType>({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    role: 'aspirante', mote: '', carrera: '', telefono: '',
    personaEmergencia: '', telefonoEmergencia: '', direccion: '',
    tipoSangre: '', dni: '', fechaNacimiento: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete dialog
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset password (per-user loading map)
  const [resetLoading, setResetLoading] = useState<Record<string, boolean>>({});

  // Verify email (per-user loading map)
  const [verifyLoading, setVerifyLoading] = useState<Record<string, boolean>>({});

  // Reset result dialog (temp password or recovery link)
  const [resetResult, setResetResult] = useState<{
    name: string;
    loginEmail: string;
    tempPassword?: string;
    recoveryLink?: string;
    emailSent?: boolean;
    recipientEmail?: string;
  } | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'super_admin') { router.push('/dashboard'); return; }

      setCurrentUserId(user.id);
      await loadUsers();
    }
    init();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .order('numero_roa', { ascending: true, nullsFirst: false })
      .order('last_name', { ascending: true, nullsFirst: false });
    if (!err) setUsers((data as UserRow[]) ?? []);
    setIsLoading(false);
  }

  // ── Filters ─────────────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.mote?.toLowerCase().includes(q) ||
      u.correo_electronico?.toLowerCase().includes(q) ||
      u.dni?.includes(q) ||
      u.numero_roa?.toString().includes(q);
    return matchesRole && matchesSearch;
  });

  // Counts per role for the stats bar
  const countByRole = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  // ── Auth token ───────────────────────────────────────────────────────────────

  async function getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  // ── Edit ────────────────────────────────────────────────────────────────────

  function openEdit(user: UserRow) {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      full_name: user.full_name ?? '',
      mote: user.mote ?? '',
      role: user.role,
      correo_electronico: user.correo_electronico ?? '',
      numero_roa: user.numero_roa,
      carrera: user.carrera ?? '',
      telefono: user.telefono ?? '',
      telefono_emergencia: user.telefono_emergencia ?? '',
      persona_emergencia: user.persona_emergencia ?? '',
      direccion: user.direccion ?? '',
      tipo_sangre: user.tipo_sangre ?? '',
      dni: user.dni ?? '',
      fecha_nacimiento: user.fecha_nacimiento ?? '',
      fecha_bautizo: user.fecha_bautizo ?? '',
      lugar_bautizo: user.lugar_bautizo ?? '',
      tuna_origen: user.tuna_origen ?? '',
    });
    setError(null);
  }

  function handleEditChange(field: keyof EditForm, value: string | number | null) {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSaveEdit() {
    if (!editingUser) return;
    setIsSaving(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) { setError('Sesión expirada. Recarga la página.'); return; }

      const fullName = `${editForm.first_name} ${editForm.last_name}`.trim() || editForm.full_name;
      const emailChanged = editForm.correo_electronico !== (editingUser.correo_electronico ?? '');

      const res = await fetch('/api/admin/update-member', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userId: editingUser.id,
          // Only send email to auth update if it actually changed
          email: emailChanged ? (editForm.correo_electronico || undefined) : undefined,
          profileUpdates: {
            first_name: editForm.first_name || null,
            last_name: editForm.last_name || null,
            full_name: fullName || null,
            mote: editForm.mote || null,
            role: editForm.role,
            correo_electronico: editForm.correo_electronico || null,
            numero_roa: editForm.numero_roa || null,
            carrera: editForm.carrera || null,
            telefono: editForm.telefono || null,
            telefono_emergencia: editForm.telefono_emergencia || null,
            persona_emergencia: editForm.persona_emergencia || null,
            direccion: editForm.direccion || null,
            tipo_sangre: editForm.tipo_sangre || null,
            dni: editForm.dni || null,
            fecha_nacimiento: editForm.fecha_nacimiento || null,
            fecha_bautizo: editForm.fecha_bautizo || null,
            lugar_bautizo: editForm.lugar_bautizo || null,
            tuna_origen: editForm.tuna_origen || null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      setUsers(prev => prev.map(u =>
        u.id === editingUser.id ? { ...u, ...editForm, full_name: fullName } : u
      ));
      setEditingUser(null);
      showSuccess(emailChanged
        ? 'Usuario actualizado — email cambiado en Auth y perfil'
        : 'Usuario actualizado correctamente'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendReset(user: UserRow) {
    setResetLoading(prev => ({ ...prev, [user.id]: true }));
    try {
      const token = await getToken();
      if (!token) { setError('Sesión expirada. Recarga la página.'); return; }
      const res = await fetch('/api/admin/send-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.tempPassword || data.recoveryLink) {
        setResetResult({
          name: user.full_name ?? user.correo_electronico ?? user.id,
          loginEmail: data.loginEmail ?? data.recipientEmail ?? user.correo_electronico ?? '',
          tempPassword: data.tempPassword,
          recoveryLink: data.recoveryLink,
          emailSent: data.emailSent,
          recipientEmail: data.recipientEmail,
        });
      } else {
        showSuccess(data.message ?? `Correo enviado a ${user.correo_electronico}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar correo');
    } finally {
      setResetLoading(prev => ({ ...prev, [user.id]: false }));
    }
  }

  // ── Create ───────────────────────────────────────────────────────────────────

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError('Las contraseñas no coinciden');
      return;
    }
    if (createForm.password.length < 6) {
      setCreateError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/admin/create-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
      setShowCreate(false);
      setCreateForm({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
        role: 'aspirante', mote: '', carrera: '', telefono: '',
        personaEmergencia: '', telefonoEmergencia: '', direccion: '',
        tipoSangre: '', dni: '', fechaNacimiento: '',
      });
      await loadUsers();
      showSuccess('Usuario creado correctamente');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsCreating(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) { setError('Sesión expirada. Recarga la página.'); return; }
      const res = await fetch('/api/admin/delete-member', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: deletingUser.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      setDeletingUser(null);
      showSuccess('Usuario eliminado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      setDeletingUser(null);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleVerifyEmail(user: UserRow) {
    setVerifyLoading(prev => ({ ...prev, [user.id]: true }));
    try {
      const token = await getToken();
      if (!token) { setError('Sesión expirada. Recarga la página.'); return; }
      const res = await fetch('/api/admin/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showSuccess(`Email verificado para ${user.full_name ?? user.correo_electronico}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar email');
    } finally {
      setVerifyLoading(prev => ({ ...prev, [user.id]: false }));
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Cargando usuarios...</div>;
  }

  return (
    <div className="w-full px-4 md:px-8 py-8">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-1">{users.length} usuarios registrados</p>
          </div>
          <Button onClick={() => { setShowCreate(true); setCreateError(null); }}>
            + Nuevo Usuario
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-sm text-destructive">{error}</div>
        )}
        {successMsg && (
          <div className="bg-primary/10 border border-primary rounded-lg p-3 text-sm text-primary">{successMsg}</div>
        )}

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3">
          {ROLES.map(({ value, label }) => (
            countByRole[value] ? (
              <button
                key={value}
                onClick={() => setRoleFilter(prev => prev === value ? 'all' : value)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                  roleFilter === value
                    ? ROLE_COLORS[value]
                    : 'bg-background hover:bg-secondary/50 border-border'
                }`}
              >
                <span>{label}</span>
                <span className={`font-bold ${roleFilter === value ? '' : 'text-muted-foreground'}`}>
                  {countByRole[value]}
                </span>
              </button>
            ) : null
          ))}
          {roleFilter !== 'all' && (
            <button
              onClick={() => setRoleFilter('all')}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground"
            >
              × Limpiar filtro
            </button>
          )}
        </div>

        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Buscar por nombre, mote, email, DNI o ROA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="all">Todos los roles</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <span className="text-sm text-muted-foreground self-center">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-lg border overflow-x-auto">
          <table className="w-full text-sm min-w-200">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Usuario</th>
                <th className="text-left px-4 py-3 font-semibold">Rol</th>
                <th className="text-left px-4 py-3 font-semibold w-16">ROA</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Carrera</th>
                <th className="text-right px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div>
                        <p className="font-medium">{user.full_name ?? '—'}</p>
                        {user.mote && <p className="text-xs text-muted-foreground">"{user.mote}"</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-center">{user.numero_roa ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-50 truncate">{user.correo_electronico ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.carrera ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!!resetLoading[user.id]}
                        onClick={() => handleSendReset(user)}
                        title="Enviar correo de restablecimiento"
                      >
                        {resetLoading[user.id] ? '...' : '🔑 Reset'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-50"
                        disabled={!!verifyLoading[user.id]}
                        onClick={() => handleVerifyEmail(user)}
                        title="Confirmar email en Supabase"
                      >
                        {verifyLoading[user.id] ? '...' : '✓ Verificar'}
                      </Button>
                      {user.id !== currentUserId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingUser(user)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No se encontraron usuarios con los filtros aplicados.
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No se encontraron usuarios.
            </Card>
          ) : (
            filtered.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start gap-3">
                  <UserAvatar user={user} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{user.full_name ?? '—'}</p>
                        {user.mote && <p className="text-xs text-muted-foreground">"{user.mote}"</p>}
                      </div>
                      <RoleBadge role={user.role} />
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                      {user.numero_roa && <p>ROA #{user.numero_roa}</p>}
                      {user.correo_electronico && <p>{user.correo_electronico}</p>}
                      {user.carrera && <p>{user.carrera}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => openEdit(user)}>Editar</Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!!resetLoading[user.id]}
                        onClick={() => handleSendReset(user)}
                      >
                        {resetLoading[user.id] ? '...' : '🔑 Reset'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-50"
                        disabled={!!verifyLoading[user.id]}
                        onClick={() => handleVerifyEmail(user)}
                      >
                        {verifyLoading[user.id] ? '...' : '✓ Verificar'}
                      </Button>
                      {user.id !== currentUserId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingUser(user)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              Editar Usuario — {editingUser?.full_name ?? editingUser?.correo_electronico}
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-5">
            {/* Rol (prominente) */}
            <div className="p-4 rounded-lg bg-muted/40 border">
              <label className="text-sm font-semibold block mb-2">Rol del Usuario</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleEditChange('role', value)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                      editForm.role === value ? ROLE_COLORS[value] : 'bg-background border-border hover:bg-secondary/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Información personal */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Información Personal</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Nombre" value={editForm.first_name ?? ''} onChange={(v) => handleEditChange('first_name', v)} placeholder="Juan" />
                <Field label="Apellido" value={editForm.last_name ?? ''} onChange={(v) => handleEditChange('last_name', v)} placeholder="Pérez" />
                <Field label="Mote / Chaplin" value={editForm.mote ?? ''} onChange={(v) => handleEditChange('mote', v)} placeholder="Tu mote" />
                <Field label="DNI" value={editForm.dni ?? ''} onChange={(v) => handleEditChange('dni', v)} placeholder="12345678" />
                <Field label="Tipo de Sangre" value={editForm.tipo_sangre ?? ''} onChange={(v) => handleEditChange('tipo_sangre', v)} placeholder="O+" />
                <Field label="Fecha de Nacimiento" value={editForm.fecha_nacimiento ?? ''} onChange={(v) => handleEditChange('fecha_nacimiento', v)} type="date" />
                <Field label="Carrera" value={editForm.carrera ?? ''} onChange={(v) => handleEditChange('carrera', v)} placeholder="Ingeniería" />
                <Field label="Dirección" value={editForm.direccion ?? ''} onChange={(v) => handleEditChange('direccion', v)} placeholder="Calle Principal 123" />
              </div>
            </div>

            {/* Tuna */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Información de la Tuna</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Número ROA</label>
                  <Input
                    type="number"
                    value={editForm.numero_roa ?? ''}
                    onChange={(e) => handleEditChange('numero_roa', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="44"
                  />
                </div>
                <Field label="Fecha de Bautizo" value={editForm.fecha_bautizo ?? ''} onChange={(v) => handleEditChange('fecha_bautizo', v)} type="date" />
                <Field label="Lugar de Bautizo" value={editForm.lugar_bautizo ?? ''} onChange={(v) => handleEditChange('lugar_bautizo', v)} placeholder="UCSP" />
                <Field label="Tuna de Origen" value={editForm.tuna_origen ?? ''} onChange={(v) => handleEditChange('tuna_origen', v)} placeholder="TUSMP" />
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Contacto</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Email" value={editForm.correo_electronico ?? ''} onChange={(v) => handleEditChange('correo_electronico', v)} placeholder="email@ejemplo.com" />
                <Field label="Teléfono" value={editForm.telefono ?? ''} onChange={(v) => handleEditChange('telefono', v)} placeholder="+51 XXX XXX XXX" />
              </div>
            </div>

            {/* Emergencia */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Contacto de Emergencia</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Persona de Emergencia" value={editForm.persona_emergencia ?? ''} onChange={(v) => handleEditChange('persona_emergencia', v)} placeholder="Nombre" />
                <Field label="Teléfono Emergencia" value={editForm.telefono_emergencia ?? ''} onChange={(v) => handleEditChange('telefono_emergencia', v)} placeholder="+51 XXX XXX XXX" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-5">
            {createError && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-sm text-destructive">{createError}</div>
            )}

            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Cuenta *</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <CreateField label="Nombre *" field="firstName" form={createForm} setForm={setCreateForm} placeholder="Juan" required />
                <CreateField label="Apellido *" field="lastName" form={createForm} setForm={setCreateForm} placeholder="Pérez" required />
                <CreateField label="Email *" field="email" form={createForm} setForm={setCreateForm} placeholder="juan@ejemplo.com" type="email" required />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Rol *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <CreateField label="Contraseña *" field="password" form={createForm} setForm={setCreateForm} placeholder="••••••••" type="password" required />
                <CreateField label="Confirmar Contraseña *" field="confirmPassword" form={createForm} setForm={setCreateForm} placeholder="••••••••" type="password" required />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Información Adicional</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <CreateField label="Mote / Chaplin" field="mote" form={createForm} setForm={setCreateForm} placeholder="Tu mote" />
                <CreateField label="Carrera" field="carrera" form={createForm} setForm={setCreateForm} placeholder="Ingeniería" />
                <CreateField label="Teléfono" field="telefono" form={createForm} setForm={setCreateForm} placeholder="+51 XXX XXX XXX" />
                <CreateField label="DNI" field="dni" form={createForm} setForm={setCreateForm} placeholder="12345678" />
                <CreateField label="Tipo de Sangre" field="tipoSangre" form={createForm} setForm={setCreateForm} placeholder="O+" />
                <CreateField label="Fecha de Nacimiento" field="fechaNacimiento" form={createForm} setForm={setCreateForm} type="date" />
                <CreateField label="Dirección" field="direccion" form={createForm} setForm={setCreateForm} placeholder="Calle Principal 123" />
                <CreateField label="Persona de Emergencia" field="personaEmergencia" form={createForm} setForm={setCreateForm} placeholder="Nombre" />
                <CreateField label="Teléfono Emergencia" field="telefonoEmergencia" form={createForm} setForm={setCreateForm} placeholder="+51 XXX XXX XXX" />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={isCreating}>Cancelar</Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Reset Result Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!resetResult} onOpenChange={(open) => !open && setResetResult(null)}>
        <DialogContent className="w-[95vw] max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {resetResult?.tempPassword ? 'Contraseña temporal' : 'Link de recuperación'}
            </DialogTitle>
          </DialogHeader>
          {resetResult && (
            <div className="space-y-4">
              {/* Email sent badge */}
              {resetResult.emailSent !== undefined && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                  resetResult.emailSent
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {resetResult.emailSent
                    ? `✓ Correo enviado a ${resetResult.recipientEmail}`
                    : `⚠ No se pudo enviar el correo. Comparte el link manualmente.`}
                </div>
              )}

              {/* Temp password */}
              {resetResult.tempPassword && (
                <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email de acceso</p>
                    <p className="font-mono text-sm break-all select-all">{resetResult.loginEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contraseña temporal</p>
                    <p className="font-mono text-2xl font-bold tracking-widest select-all">{resetResult.tempPassword}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">El miembro inicia sesión con estos datos y luego puede cambiar su contraseña.</p>
                </div>
              )}

              {/* Recovery link */}
              {resetResult.recoveryLink && (
                <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Link de recuperación (expira en 1h)</p>
                  <p className="font-mono text-xs break-all text-primary select-all">{resetResult.recoveryLink}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Comparte esta información con <strong>{resetResult.name}</strong> por WhatsApp o en persona.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                if (!resetResult) return;
                const lines = [];
                if (resetResult.tempPassword) {
                  lines.push(`Email: ${resetResult.loginEmail}`);
                  lines.push(`Contraseña temporal: ${resetResult.tempPassword}`);
                }
                if (resetResult.recoveryLink) {
                  lines.push(`Link de recuperación: ${resetResult.recoveryLink}`);
                }
                navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
                showSuccess('Copiado al portapapeles');
              }}
            >
              Copiar
            </Button>
            <Button onClick={() => setResetResult(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar a <strong>{deletingUser?.full_name ?? deletingUser?.correo_electronico}</strong>.
              Esta acción es <strong>irreversible</strong> y eliminará todos sus datos, eventos y comentarios asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function CreateField({
  label, field, form, setForm, placeholder, type = 'text', required,
}: {
  label: string;
  field: keyof CreateFormType;
  form: CreateFormType;
  setForm: React.Dispatch<React.SetStateAction<CreateFormType>>;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type={type}
        value={form[field]}
        onChange={(e) => setForm(p => ({ ...p, [field]: e.target.value }))}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
