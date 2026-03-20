'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - in production this would come from Supabase
  const events = [
    {
      id: 1,
      name: 'Spring Concert',
      date: '2025-03-15',
      location: 'Main Auditorium',
      attendees: 45,
      status: 'upcoming',
      type: 'Performance',
    },
    {
      id: 2,
      name: 'Weekly Rehearsal',
      date: '2025-03-11',
      location: 'Music Room 101',
      attendees: 32,
      status: 'upcoming',
      type: 'Rehearsal',
    },
    {
      id: 3,
      name: 'Social Gathering',
      date: '2025-03-22',
      location: 'Campus Café',
      attendees: 28,
      status: 'upcoming',
      type: 'Social',
    },
    {
      id: 4,
      name: 'Winter Concert',
      date: '2024-12-10',
      location: 'Main Auditorium',
      attendees: 52,
      status: 'completed',
      type: 'Performance',
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Performance: 'bg-primary/10 text-primary',
      Rehearsal: 'bg-secondary/20 text-secondary-foreground',
      Social: 'bg-muted',
    };
    return colors[type] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Events Management</h2>
          <p className="text-muted-foreground mt-1">Create and manage group events</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">Create Event</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Search</label>
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full bg-transparent">
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Events Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-sm">Event Name</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Location</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Type</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Attendees</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-b hover:bg-secondary/50">
                  <td className="px-6 py-4 font-medium">{event.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{event.date}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{event.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{event.attendees} registered</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Attendance
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredEvents.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No events found. Try adjusting your filters or create a new event.</p>
        </Card>
      )}
    </div>
  );
}
