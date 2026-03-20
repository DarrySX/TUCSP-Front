'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const [filter, setFilter] = useState('all');

  const allEvents = [
    {
      id: 1,
      name: 'Spring Concert',
      date: 'March 15, 2025',
      time: '7:00 PM',
      location: 'Main Auditorium',
      type: 'Performance',
      description: 'Our biggest concert of the season. Come celebrate with us!',
      isAttending: true,
      attendees: 45,
    },
    {
      id: 2,
      name: 'Weekly Rehearsal',
      date: 'March 11, 2025',
      time: '6:00 PM',
      location: 'Music Room 101',
      type: 'Rehearsal',
      description: 'Regular practice session for all members',
      isAttending: true,
      attendees: 32,
    },
    {
      id: 3,
      name: 'Social Gathering',
      date: 'March 22, 2025',
      time: '5:00 PM',
      location: 'Campus Café',
      type: 'Social',
      description: 'Casual hangout to bond with the community',
      isAttending: false,
      attendees: 28,
    },
    {
      id: 4,
      name: 'Voice Workshop',
      date: 'March 18, 2025',
      time: '3:00 PM',
      location: 'Music Room 102',
      type: 'Workshop',
      description: 'Improve your vocal techniques with our guest instructor',
      isAttending: false,
      attendees: 15,
    },
  ];

  const filteredEvents = allEvents.filter((event) => {
    if (filter === 'attending') return event.isAttending;
    if (filter === 'not-attending') return !event.isAttending;
    return true;
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Performance: 'bg-primary/10 text-primary',
      Rehearsal: 'bg-secondary/20 text-secondary-foreground',
      Social: 'bg-muted',
      Workshop: 'bg-blue-100 text-blue-700',
    };
    return colors[type] || 'bg-muted';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Events</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Browse and manage all group events
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filter === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('attending')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filter === 'attending'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Attending
          </button>
          <button
            onClick={() => setFilter('not-attending')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filter === 'not-attending'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Available
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{event.name}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📅 {event.date} at {event.time}</p>
                  <p>📍 {event.location}</p>
                  <p>👥 {event.attendees} registered</p>
                </div>

                {/* Description */}
                <p className="text-foreground">{event.description}</p>

                {/* Status and Action */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  {event.isAttending ? (
                    <>
                      <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        You're Attending
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-auto"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="ml-auto"
                    >
                      RSVP Now
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              No events found. Check back soon!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
