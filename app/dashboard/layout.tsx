'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">♪</span>
            </div>
            <span className="font-bold text-lg">UCSP Tuna</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm text-foreground hover:text-primary transition">
              Home
            </Link>
            <Link href="/dashboard/events" className="text-sm text-foreground hover:text-primary transition">
              Events
            </Link>
            <Link href="/dashboard/profile" className="text-sm text-foreground hover:text-primary transition">
              Profile
            </Link>
          </nav>

          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
