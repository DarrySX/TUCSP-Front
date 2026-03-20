'use client';

import React from "react"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    role: 'tuno',
    joinDate: '2024-01-15',
    instruments: 'Guitar, Voice',
    bio: 'Music lover and passionate guitarist',
  });

  const [editData, setEditData] = useState(formData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setFormData(editData);
    setIsEditing(false);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      tuno_admin: 'Admin',
      tuno: 'Full Member',
      pardillo: 'Senior Member',
      aspirante: 'Aspirant',
    };
    return labels[role] || role;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your UCSP Tuna account
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-4xl">
                {formData.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{formData.fullName}</h2>
                <p className="text-muted-foreground">{getRoleLabel(formData.role)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Joined {new Date(formData.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  name="fullName"
                  value={editData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleChange}
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Instruments</label>
                <Input
                  type="text"
                  name="instruments"
                  value={editData.instruments}
                  onChange={handleChange}
                  placeholder="e.g., Guitar, Voice"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Bio</label>
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditData(formData);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{getRoleLabel(formData.role)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Musical Profile</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Instruments</p>
                    <p className="font-medium">{formData.instruments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="font-medium">{formData.bio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(formData.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Account Settings */}
        <Card className="p-8">
          <h3 className="text-xl font-bold mb-6">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50">
              <div>
                <p className="font-medium">Download Data</p>
                <p className="text-sm text-muted-foreground">Export your account data</p>
              </div>
              <Button variant="outline">Download</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently remove your account</p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
