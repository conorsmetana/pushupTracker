'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/groups', label: 'Groups' },
  { href: '/stats', label: 'Statistics' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">💪 Push-Up Tracker</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">Welcome, {session?.user?.name}!</p>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex gap-1">
          {navLinks.map((link, i) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

            return (
              <span key={link.href} className="flex items-center">
                {i > 0 && <span className="mx-2 text-gray-400">|</span>}
                {isActive ? (
                  <span className="text-gray-700 font-semibold">{link.label}</span>
                ) : (
                  <Link href={link.href} className="text-blue-600 hover:text-blue-700">
                    {link.label}
                  </Link>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
