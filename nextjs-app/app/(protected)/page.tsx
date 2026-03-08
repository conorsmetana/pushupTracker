'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { pushupsApi } from '@/lib/api-client';

interface PushupEntry {
  id: number;
  count: number;
  date: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [todayCount, setTodayCount] = useState(0);
  const [todayEntries, setTodayEntries] = useState<PushupEntry[]>([]);
  const [history, setHistory] = useState<PushupEntry[]>([]);
  const [newCount, setNewCount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [todayRes, historyRes] = await Promise.all([
        pushupsApi.getToday(),
        pushupsApi.getAll(10),
      ]);
      setTodayCount(todayRes.data.totalCount);
      setTodayEntries(todayRes.data.entries);
      setHistory(historyRes.data.entries);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const count = parseInt(newCount, 10);
    if (isNaN(count) || count <= 0) {
      setError('Please enter a valid number greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await pushupsApi.create(count);
      setNewCount('');
      await loadData();
    } catch (err: any) {
      setError(err.data?.message || 'Failed to log push-ups');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await pushupsApi.delete(id);
      await loadData();
    } catch (err: any) {
      setError(err.data?.message || 'Failed to delete entry');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Push-ups</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-5xl font-bold text-blue-600 text-center">{todayCount}</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Log Push-ups</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="flex gap-2">
              <input
                type="number"
                value={newCount}
                onChange={(e) => setNewCount(e.target.value)}
                placeholder="Enter number of push-ups"
                min="1"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </section>

        {todayEntries.length > 0 && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Entries</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y">
                {todayEntries.map((entry) => (
                  <li key={entry.id} className="p-4 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">{entry.count} push-ups</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent History</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">No push-ups logged yet. Start tracking!</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y">
                {history.map((entry) => (
                  <li key={entry.id} className="p-4 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-900">{entry.count} push-ups</span>
                      <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

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
    </>
  );
}
