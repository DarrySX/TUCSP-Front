'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r">
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">♪</span>
          </div>
          <span className="font-bold text-lg">UCSP Tuna</span>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className="block px-4 py-2 rounded-lg hover:bg-secondary text-sidebar-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/members"
            className="block px-4 py-2 rounded-lg hover:bg-secondary text-sidebar-foreground"
          >
            Members
          </Link>
          <Link
            href="/admin/events"
            className="block px-4 py-2 rounded-lg hover:bg-secondary text-sidebar-foreground"
          >
            Events
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4 w-64">
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full bg-transparent"
            variant="outline"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
