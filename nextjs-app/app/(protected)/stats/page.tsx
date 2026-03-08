'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';
import { statsApi } from '@/lib/api-client';

interface DailyStats {
  date: string;
  count: number;
}

interface WeeklyStats {
  week: string;
  count: number;
}

interface PersonalStats {
  daily: DailyStats[];
  weekly: WeeklyStats[];
}

export default function StatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        setError('');
        const response = await statsApi.getPersonal();
        setStats(response.data);
      } catch (err: any) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">💪 Push-Up Tracker</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">{session?.user?.name}</p>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Dashboard
            </Link>
            <span className="mx-2 text-gray-400">|</span>
            <Link href="/groups" className="text-blue-600 hover:text-blue-700">
              Groups
            </Link>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-gray-700 font-semibold">Statistics</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Push-Up Statistics</h2>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading statistics...</p>
        ) : stats ? (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Last 30 Days</h3>
              {stats.daily.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data available for the last 30 days</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      interval={Math.floor(stats.daily.length / 7)}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Push-ups"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>

            <section className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Last 12 Weeks</h3>
              {stats.weekly.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data available for the last 12 weeks</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.weekly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Push-ups" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>
        ) : null}

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-md bg-blue-600 py-2 px-4 text-white font-medium hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
