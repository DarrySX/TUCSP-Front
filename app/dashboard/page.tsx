import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserDashboard() {
  const upcomingEvents = [
    {
      id: 1,
      name: 'Spring Concert',
      date: 'March 15, 2025',
      location: 'Main Auditorium',
      isAttending: true,
    },
    {
      id: 2,
      name: 'Weekly Rehearsal',
      date: 'March 11, 2025',
      location: 'Music Room 101',
      isAttending: true,
    },
    {
      id: 3,
      name: 'Social Gathering',
      date: 'March 22, 2025',
      location: 'Campus Café',
      isAttending: false,
    },
  ];

  const memberStats = [
    {
      label: 'Events Attended',
      value: '12',
      icon: '📅',
    },
    {
      label: 'Current Status',
      value: 'Active Member',
      icon: '✓',
    },
    {
      label: 'Joined',
      value: '6 months ago',
      icon: '📍',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold">Welcome to UCSP Tuna</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Stay connected with the community and never miss an event
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {memberStats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upcoming Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Button asChild>
              <Link href="/dashboard/events">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      📅 {event.date} • 📍 {event.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {event.isAttending ? (
                      <>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          Attending
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-auto"
                        >
                          Cancel Attendance
                        </Button>
                      </>
                    ) : (
                      <Button className="ml-auto">
                        RSVP Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Latest Updates</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
                <div className="text-2xl">🎵</div>
                <div>
                  <h4 className="font-semibold">Spring Concert Confirmed</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our Spring Concert is officially scheduled for March 15. Rehearsals start next week!
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">2 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
                <div className="text-2xl">👥</div>
                <div>
                  <h4 className="font-semibold">New Members Welcome</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    We have new members joining! Welcome to Sarah, Alex, and Emma.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">5 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
                <div className="text-2xl">📢</div>
                <div>
                  <h4 className="font-semibold">General Meeting Next Tuesday</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Join us for our monthly community meeting. Pizza and drinks will be served!
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">1 week ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
