import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary">
      <header className="border-b border-border/40 py-4 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">♪</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">UCSP Tuna</span>
              <span className="text-xs text-muted-foreground">Tuna Universitaria</span>
            </div>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-border/40 backdrop-blur-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
