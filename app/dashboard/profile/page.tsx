'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser, supabase } from '@/lib/auth';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  mote: string | null;
  role: string | null;
  numero_roa: number | null;
  fecha_bautizo: string | null;
  lugar_bautizo: string | null;
  fecha_nacimiento: string | null;
  carrera: string | null;
  telefono: string | null;
  telefono_emergencia: string | null;
  persona_emergencia: string | null;
  direccion: string | null;
  tipo_sangre: string | null;
  dni: string | null;
  correo_electronico: string | null;
  tuna_origen: string | null;
  absences_count: number | null;
  padrino: { full_name: string | null; mote: string | null } | null;
  testigo: { full_name: string | null; mote: string | null } | null;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  tuno_admin: 'Admin Tuna',
  tuno: 'Tuno',
  pardillo: 'Pardillo',
  aspirante: 'Aspirante',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    mote: '',
    carrera: '',
    telefono: '',
    telefono_emergencia: '',
    persona_emergencia: '',
    direccion: '',
    tipo_sangre: '',
    dni: '',
    fecha_nacimiento: '',
  });

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const user = await getCurrentUser();
        if (!user) {
          setError('No autenticado');
          return;
        }

        const { data, error: dbError } = await supabase
          .from('profiles')
          .select(`
            *,
            padrino:padrino_id(full_name, mote),
            testigo:testigo_id(full_name, mote)
          `)
          .eq('id', user.id)
          .single();

        if (dbError) throw dbError;

        setProfile(data);
        setEditData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          mote: data.mote || '',
          carrera: data.carrera || '',
          telefono: data.telefono || '',
          telefono_emergencia: data.telefono_emergencia || '',
          persona_emergencia: data.persona_emergencia || '',
          direccion: data.direccion || '',
          tipo_sangre: data.tipo_sangre || '',
          dni: data.dni || '',
          fecha_nacimiento: data.fecha_nacimiento || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: editData.first_name || null,
          last_name: editData.last_name || null,
          full_name: `${editData.first_name} ${editData.last_name}`.trim() || null,
          mote: editData.mote || null,
          carrera: editData.carrera || null,
          telefono: editData.telefono || null,
          telefono_emergencia: editData.telefono_emergencia || null,
          persona_emergencia: editData.persona_emergencia || null,
          direccion: editData.direccion || null,
          tipo_sangre: editData.tipo_sangre || null,
          dni: editData.dni || null,
          fecha_nacimiento: editData.fecha_nacimiento || null,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              ...editData,
              full_name: `${editData.first_name} ${editData.last_name}`.trim(),
            }
          : prev
      );
      setIsEditing(false);
      setSuccessMsg('Perfil actualizado correctamente');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const displayName = (person: { full_name: string | null; mote: string | null } | null) => {
    if (!person) return '—';
    const parts = [person.full_name, person.mote ? `"${person.mote}"` : null].filter(Boolean);
    return parts.join(' ') || '—';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Cargando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-destructive">
        {error || 'No se encontró el perfil'}
      </div>
    );
  }

  const initials = ((profile.first_name || '?').charAt(0) + (profile.last_name || '?').charAt(0)).toUpperCase();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Mi Perfil</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Gestiona tu información en UCSP Tuna
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-primary/10 border border-primary rounded-lg p-4 text-sm text-primary">
            {successMsg}
          </div>
        )}

        {/* Cabecera del perfil */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.full_name || '—'}</h2>
                {profile.mote && (
                  <p className="text-primary font-medium">"{profile.mote}"</p>
                )}
                <p className="text-muted-foreground">{ROLE_LABELS[profile.role || ''] || profile.role}</p>
                {profile.numero_roa && (
                  <p className="text-sm text-muted-foreground">ROA #{profile.numero_roa}</p>
                )}
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4 pb-2 border-b">Información Personal</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <Input name="first_name" value={editData.first_name} onChange={handleChange} placeholder="Juan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Apellido</label>
                    <Input name="last_name" value={editData.last_name} onChange={handleChange} placeholder="Pérez" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mote / Chaplin</label>
                    <Input name="mote" value={editData.mote} onChange={handleChange} placeholder="Tu mote" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha de Nacimiento</label>
                    <Input name="fecha_nacimiento" type="date" value={editData.fecha_nacimiento} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">DNI</label>
                    <Input name="dni" value={editData.dni} onChange={handleChange} placeholder="12345678" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Sangre</label>
                    <Input name="tipo_sangre" value={editData.tipo_sangre} onChange={handleChange} placeholder="O+" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Carrera</label>
                    <Input name="carrera" value={editData.carrera} onChange={handleChange} placeholder="Ingeniería" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dirección</label>
                    <Input name="direccion" value={editData.direccion} onChange={handleChange} placeholder="Calle Principal 123" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4 pb-2 border-b">Contacto</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Teléfono</label>
                    <Input name="telefono" type="tel" value={editData.telefono} onChange={handleChange} placeholder="+51 XXX XXX XXX" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4 pb-2 border-b">Contacto de Emergencia</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Persona de Emergencia</label>
                    <Input name="persona_emergencia" value={editData.persona_emergencia} onChange={handleChange} placeholder="Nombre" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Teléfono de Emergencia</label>
                    <Input name="telefono_emergencia" type="tel" value={editData.telefono_emergencia} onChange={handleChange} placeholder="+51 XXX XXX XXX" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Información de la Tuna */}
              <div>
                <h3 className="font-semibold text-lg mb-4 pb-2 border-b">Información de la Tuna</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  <InfoField label="Número ROA" value={profile.numero_roa?.toString()} />
                  <InfoField label="Rol" value={ROLE_LABELS[profile.role || ''] || profile.role} />
                  <InfoField label="Fecha de Bautizo" value={formatDate(profile.fecha_bautizo)} />
                  <InfoField label="Lugar de Bautizo" value={profile.lugar_bautizo} />
                  <InfoField label="Padrino" value={displayName(profile.padrino)} />
                  <InfoField label="Testigo" value={displayName(profile.testigo)} />
                  {profile.absences_count !== null && (
                    <InfoField label="Ausencias" value={profile.absences_count.toString()} />
                  )}
                </div>
              </div>

              {/* Información Personal */}
              <div>
                <h3 className="font-semibold text-lg mb-4 pb-2 border-b">Información Personal</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  <InfoField label="Nombre Completo" value={profile.full_name} />
                  <InfoField label="Mote / Chaplin" value={profile.mote} />
                  <InfoField label="Fecha de Nacimiento" value={formatDate(profile.fecha_nacimiento)} />
                  <InfoField label="DNI" value={profile.dni} />
                  <InfoField label="Tipo de Sangre" value={profile.tipo_sangre} />
                  <InfoField label="Carrera" value={profile.carrera} />
                  <InfoField label="Dirección" value={profile.direccion} />
                </div>
              </div>

              {/* Contacto */}
              <div>
                <h3 className="font-semibold text-lg mb-4 pb-2 border-b">Contacto</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  <InfoField label="Correo Electrónico" value={profile.correo_electronico} />
                  <InfoField label="Teléfono" value={profile.telefono} />
                </div>
              </div>

              {/* Emergencia */}
              <div>
                <h3 className="font-semibold text-lg mb-4 pb-2 border-b">Contacto de Emergencia</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  <InfoField label="Persona de Emergencia" value={profile.persona_emergencia} />
                  <InfoField label="Teléfono de Emergencia" value={profile.telefono_emergencia} />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}
