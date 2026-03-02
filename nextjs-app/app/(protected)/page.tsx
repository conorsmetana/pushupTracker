import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Push-Up Tracker</h1>
          <p className="text-gray-600">Welcome, {session?.user?.name}!</p>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Today</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">This Week</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">This Month</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/groups"
            className="inline-block rounded-md bg-blue-600 py-2 px-4 text-white font-medium hover:bg-blue-700"
          >
            Groups
          </Link>
          <Link
            href="/stats"
            className="inline-block rounded-md bg-green-600 py-2 px-4 text-white font-medium hover:bg-green-700"
          >
            Statistics
          </Link>
        </div>
      </main>
    </div>
  );
}
