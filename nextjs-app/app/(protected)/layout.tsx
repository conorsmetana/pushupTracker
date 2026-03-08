import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import Navbar from './Navbar';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
