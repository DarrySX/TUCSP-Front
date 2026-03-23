'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function CreateMemberForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'aspirante',
    mote: '',
    carrera: '',
    telefono: '',
    personaEmergencia: '',
    telefonoEmergencia: '',
    direccion: '',
    tipoSangre: '',
    dni: '',
    fechaNacimiento: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/create-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el usuario');
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'aspirante',
        mote: '',
        carrera: '',
        telefono: '',
        personaEmergencia: '',
        telefonoEmergencia: '',
        direccion: '',
        tipoSangre: '',
        dni: '',
        fechaNacimiento: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Crear Nuevo Miembro</h2>

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6 text-sm text-primary">
          Miembro creado exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 pb-6 border-b">
          <h3 className="font-semibold">Información Requerida</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre *</label>
              <Input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Juan" disabled={isLoading} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Apellido *</label>
              <Input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Pérez" disabled={isLoading} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico *</label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="usuario@ejemplo.com" disabled={isLoading} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rol *</label>
              <select name="role" value={formData.role} onChange={handleChange} disabled={isLoading} className="w-full px-3 py-2 border rounded-md bg-background">
                <option value="aspirante">Aspirante</option>
                <option value="pardillo">Pardillo</option>
                <option value="tuno">Tuno</option>
                <option value="tuno_admin">Admin Tuna</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña *</label>
              <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" disabled={isLoading} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Contraseña *</label>
              <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" disabled={isLoading} required />
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-6 border-b">
          <h3 className="font-semibold">Información Adicional</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mote</label>
              <Input type="text" name="mote" value={formData.mote} onChange={handleChange} placeholder="Tu mote" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Carrera</label>
              <Input type="text" name="carrera" value={formData.carrera} onChange={handleChange} placeholder="Ingeniería" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+51 XXX XXX XXX" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de Nacimiento</label>
              <Input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">DNI</label>
              <Input type="text" name="dni" value={formData.dni} onChange={handleChange} placeholder="12345678" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Sangre</label>
              <Input type="text" name="tipoSangre" value={formData.tipoSangre} onChange={handleChange} placeholder="O+" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección</label>
              <Input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle Principal 123" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Persona de Emergencia</label>
              <Input type="text" name="personaEmergencia" value={formData.personaEmergencia} onChange={handleChange} placeholder="Nombre" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono Emergencia</label>
              <Input type="tel" name="telefonoEmergencia" value={formData.telefonoEmergencia} onChange={handleChange} placeholder="+51 XXX XXX XXX" disabled={isLoading} />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Creando...' : 'Crear Miembro'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
