'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateMemberPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    joinDate: '',
    role: 'aspirante',
    instruments: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would save to Supabase
      console.log('Creating member:', formData);
      setTimeout(() => {
        router.push('/admin/members');
      }, 500);
    } catch (err) {
      setError('Failed to create member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Member</h1>
        <p className="text-muted-foreground">
          Add a new member to the system with all their information
        </p>
      </div>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Join Date</label>
              <Input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="aspirante">Aspirante</option>
                <option value="pardillo">Pardillo</option>
                <option value="tuno">Tuno</option>
                <option value="tuno_admin">Tuno Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Primary Instrument</label>
              <Input
                type="text"
                name="instruments"
                value={formData.instruments}
                onChange={handleChange}
                placeholder="e.g., Guitar, Voice, etc."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding Member...' : 'Add Member'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
