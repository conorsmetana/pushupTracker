'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { groupsApi } from '@/lib/api-client';

interface GroupMember {
  id: number;
  role: string;
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

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadGroups = async () => {
    try {
      setError('');
      const response = await groupsApi.getAll();
      setGroups(response.data);
    } catch (err: any) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await groupsApi.create(newGroupName.trim());
      setNewGroupName('');
      setSuccess('Group created!');
      setTimeout(() => setSuccess(''), 3000);
      await loadGroups();
    } catch (err: any) {
      setError(err.data?.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await groupsApi.join(inviteCode.trim());
      setInviteCode('');
      setSuccess('Joined group!');
      setTimeout(() => setSuccess(''), 3000);
      await loadGroups();
    } catch (err: any) {
      setError(err.data?.message || 'Invalid invite code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                maxLength={50}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newGroupName.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Join a Group</h2>
            <form onSubmit={handleJoinGroup} className="space-y-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                maxLength={8}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="submit"
                disabled={isSubmitting || !inviteCode.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {isSubmitting ? 'Joining...' : 'Join Group'}
              </button>
            </form>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Groups</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : groups.length === 0 ? (
            <p className="text-gray-500">You're not in any groups yet. Create one or join with an invite code!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => {
                const userRole = group.members.find(m => m.user.id === Number(session?.user?.id))?.role;
                return (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      {group.members.find(m => m.user.id === Number(session?.user?.id))?.role === 'owner' && (
                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded">Owner</span>
                      )}
                      <span className="text-gray-400">Code: {group.inviteCode}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
    </>
  );
}
