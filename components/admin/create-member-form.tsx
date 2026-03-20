'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/app/providers';

export function CreateMemberForm() {
  const { t, language } = useLanguage();
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

    // Validations
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError(
        language === 'es'
          ? 'Por favor completa todos los campos requeridos'
          : 'Please fill in all required fields'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(
        language === 'es'
          ? 'Las contraseñas no coinciden'
          : 'Passwords do not match'
      );
      return;
    }

    if (formData.password.length < 6) {
      setError(
        language === 'es'
          ? 'La contraseña debe tener al menos 6 caracteres'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Call API to create user and profile
      const response = await fetch('/api/admin/create-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error ||
            (language === 'es'
              ? 'Error al crear el usuario'
              : 'Error creating user')
        );
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
      setError(
        err instanceof Error
          ? err.message
          : language === 'es'
            ? 'Error desconocido'
            : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {language === 'es' ? 'Crear Nuevo Miembro' : 'Create New Member'}
      </h2>

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6 text-sm text-primary">
          {language === 'es'
            ? 'Miembro creado exitosamente'
            : 'Member created successfully'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields */}
        <div className="space-y-4 pb-6 border-b">
          <h3 className="font-semibold">
            {language === 'es' ? 'Información Requerida' : 'Required Information'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Nombre' : 'First Name'} *
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={
                  language === 'es' ? 'Juan' : 'John'
                }
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Apellido' : 'Last Name'} *
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={
                  language === 'es' ? 'Pérez' : 'Doe'
                }
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Correo Electrónico' : 'Email'} *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Rol' : 'Role'} *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="aspirante">
                  {language === 'es' ? 'Aspirante' : 'Aspirante'}
                </option>
                <option value="pardillo">
                  {language === 'es' ? 'Pardillo' : 'Pardillo'}
                </option>
                <option value="tuno">
                  {language === 'es' ? 'Tuño' : 'Tuno'}
                </option>
                <option value="tuno_admin">
                  {language === 'es' ? 'Admin Tuña' : 'Tuno Admin'}
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Contraseña' : 'Password'} *
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es'
                  ? 'Confirmar Contraseña'
                  : 'Confirm Password'}{' '}
                *
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="space-y-4 pb-6 border-b">
          <h3 className="font-semibold">
            {language === 'es' ? 'Información Adicional' : 'Additional Information'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Mote' : 'Nickname'}
              </label>
              <Input
                type="text"
                name="mote"
                value={formData.mote}
                onChange={handleChange}
                placeholder={language === 'es' ? 'Tu mote' : 'Your nickname'}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Carrera' : 'Career/Major'}
              </label>
              <Input
                type="text"
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                placeholder={language === 'es' ? 'Ingeniería' : 'Engineering'}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Teléfono' : 'Phone'}
              </label>
              <Input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+51 XXX XXX XXX"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Fecha de Nacimiento' : 'Birth Date'}
              </label>
              <Input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'DNI' : 'ID Number'}
              </label>
              <Input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                placeholder="12345678"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Tipo de Sangre' : 'Blood Type'}
              </label>
              <Input
                type="text"
                name="tipoSangre"
                value={formData.tipoSangre}
                onChange={handleChange}
                placeholder="O+"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es' ? 'Dirección' : 'Address'}
              </label>
              <Input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder={
                  language === 'es'
                    ? 'Calle Principal 123'
                    : 'Main St 123'
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es'
                  ? 'Persona de Emergencia'
                  : 'Emergency Contact'}
              </label>
              <Input
                type="text"
                name="personaEmergencia"
                value={formData.personaEmergencia}
                onChange={handleChange}
                placeholder={language === 'es' ? 'Nombre' : 'Name'}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'es'
                  ? 'Teléfono Emergencia'
                  : 'Emergency Phone'}
              </label>
              <Input
                type="tel"
                name="telefonoEmergencia"
                value={formData.telefonoEmergencia}
                onChange={handleChange}
                placeholder="+51 XXX XXX XXX"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading
              ? language === 'es'
                ? 'Creando...'
                : 'Creating...'
              : language === 'es'
                ? 'Crear Miembro'
                : 'Create Member'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
