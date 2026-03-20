'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const memberRoles = ['super_admin', 'tuno_admin', 'tuno', 'pardillo', 'aspirante'];

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Mock data - in production this would come from Supabase
  const members = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'tuno_admin',
      joinDate: '2024-01-15',
      status: 'active',
    },
    {
      id: 2,
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      role: 'tuno',
      joinDate: '2024-03-10',
      status: 'active',
    },
    {
      id: 3,
      name: 'Alex Martinez',
      email: 'alex@example.com',
      role: 'aspirante',
      joinDate: '2024-03-20',
      status: 'active',
    },
    {
      id: 4,
      name: 'Emma Wilson',
      email: 'emma@example.com',
      role: 'pardillo',
      joinDate: '2023-09-05',
      status: 'active',
    },
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-destructive/10 text-destructive',
      tuno_admin: 'bg-primary/10 text-primary',
      tuno: 'bg-secondary/20 text-secondary-foreground',
      pardillo: 'bg-muted',
      aspirante: 'bg-muted',
    };
    return colors[role] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Members Management</h2>
          <p className="text-muted-foreground mt-1">Manage group members and their roles</p>
        </div>
        <Button asChild>
          <Link href="/admin/members/new">Add Member</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Search</label>
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="all">All Roles</option>
              {memberRoles.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full bg-transparent">
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-sm">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Join Date</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-secondary/50">
                  <td className="px-6 py-4 font-medium">{member.name}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{member.joinDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredMembers.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No members found. Try adjusting your filters.</p>
        </Card>
      )}
    </div>
  );
}
