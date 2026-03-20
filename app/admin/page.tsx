import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Total Members',
      value: '156',
      icon: '👥',
      href: '/admin/members',
    },
    {
      label: 'Active Events',
      value: '8',
      icon: '📅',
      href: '/admin/events',
    },
    {
      label: 'Total Attendance',
      value: '342',
      icon: '✓',
      href: '/admin/attendance',
    },
    {
      label: 'Roles Overview',
      value: '5',
      icon: '🎭',
      href: '/admin/members',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your UCSP Tuna community, members, and events
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Button asChild className="h-12">
            <Link href="/admin/members/new">Add New Member</Link>
          </Button>
          <Button asChild className="h-12">
            <Link href="/admin/events/new">Create Event</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 bg-transparent">
            <Link href="/admin/attendance">View Attendance</Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Recent Activity</h3>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium">Spring Concert Created</p>
                <p className="text-sm text-muted-foreground">March 15, 2025</p>
              </div>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded">Event</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium">New Member Joined: Sarah Chen</p>
                <p className="text-sm text-muted-foreground">March 10, 2025</p>
              </div>
              <span className="text-sm bg-secondary/20 text-secondary-foreground px-3 py-1 rounded">Member</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium">Rehearsal Session Completed</p>
                <p className="text-sm text-muted-foreground">March 8, 2025</p>
              </div>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded">Attendance</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
