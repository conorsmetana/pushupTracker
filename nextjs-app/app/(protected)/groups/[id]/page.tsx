'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { groupsApi, statsApi } from '@/lib/api-client';

interface GroupMember {
  id: number;
  role: string;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Group {
  id: number;
  name: string;
  inviteCode: string;
  members: GroupMember[];
}

interface LeaderboardEntry {
  userId: number;
  name: string;
  email: string;
  totalPushups: number;
  entriesCount: number;
}

interface Leaderboard {
  period: string;
  startDate: string;
  leaderboard: LeaderboardEntry[];
}

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const groupId = parseInt(params.id as string, 10);

  const [group, setGroup] = useState<Group | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadGroup = async () => {
    try {
      setError('');
      const response = await groupsApi.getOne(groupId);
      setGroup(response.data);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to load group');
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await groupsApi.getLeaderboard(groupId, period);
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    }
  };

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      loadLeaderboard();
    }
  }, [groupId, period]);

  useEffect(() => {
    if (group) {
      setLoading(false);
    }
  }, [group]);

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      await groupsApi.leave(groupId);
      router.push('/groups');
    } catch (err: any) {
      setError(err.data?.message || 'Failed to leave group');
    }
  };

  const copyInviteCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">💪 Push-Up Tracker</h1>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-gray-500">Loading...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">💪 Push-Up Tracker</h1>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
            {error}
          </div>
          <Link href="/groups" className="text-blue-600 hover:text-blue-700">
            ← Back to Groups
          </Link>
        </main>
      </div>
    );
  }

  if (!group) return null;

  const currentUserRole = group.members.find(m => m.userId === Number(session?.user?.id))?.role;
  const isOwner = currentUserRole === 'owner';

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
            <span className="text-gray-700 font-semibold">{group.name}</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900">{group.name}</h2>
              {isOwner && (
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Owner
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyInviteCode}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                {copied ? '✓ Copied!' : `Copy Code: ${group.inviteCode}`}
              </button>
              <button
                onClick={handleLeaveGroup}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Leave Group
              </button>
            </div>
          </div>
          <p className="text-gray-600">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
        </div>

        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Leaderboard</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('today')}
                className={`px-4 py-2 rounded-md transition ${
                  period === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-md transition ${
                  period === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-md transition ${
                  period === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {leaderboard && leaderboard.leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={`p-4 rounded-md flex items-center justify-between ${
                    entry.userId === Number(session?.user?.id)
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold min-w-12">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{entry.name}</p>
                      <p className="text-sm text-gray-500">{entry.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{entry.totalPushups} push-ups</p>
                    <p className="text-sm text-gray-500">{entry.entriesCount} entries</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No push-up data for this period yet.</p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.members.map((member) => (
              <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-900">{member.user.name}</p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    member.role === 'owner'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role === 'owner' ? 'Owner' : 'Member'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
