import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  _count: {
    members: number;
  };
}

export default function GroupsPage() {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await groupsApi.getAll();
      setGroups(response.data);
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setError('');
      await groupsApi.create(newGroupName.trim());
      setNewGroupName('');
      setSuccess('Group created!');
      setTimeout(() => setSuccess(''), 3000);
      loadGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setError('');
      await groupsApi.join(inviteCode.trim());
      setInviteCode('');
      setSuccess('Joined group!');
      setTimeout(() => setSuccess(''), 3000);
      loadGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid invite code');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>💪 Push-Up Tracker</h1>
        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/groups" className="active">Groups</Link>
        </nav>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="groups-actions">
          <div className="card">
            <h2>Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="inline-form">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                maxLength={50}
              />
              <button type="submit" disabled={!newGroupName.trim()}>Create</button>
            </form>
          </div>

          <div className="card">
            <h2>Join a Group</h2>
            <form onSubmit={handleJoinGroup} className="inline-form">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                maxLength={8}
              />
              <button type="submit" disabled={!inviteCode.trim()}>Join</button>
            </form>
          </div>
        </div>

        <section className="groups-section">
          <h2>Your Groups</h2>
          {groups.length === 0 ? (
            <p className="no-data">You're not in any groups yet. Create one or join with an invite code!</p>
          ) : (
            <div className="groups-list">
              {groups.map((group) => {
                const userRole = group.members.find(m => m.user.id === user?.id)?.role;
                return (
                  <Link to={`/groups/${group.id}`} key={group.id} className="group-card">
                    <div className="group-info">
                      <h3>{group.name}</h3>
                      <span className="member-count">{group._count.members} member{group._count.members !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="group-meta">
                      {userRole === 'owner' && <span className="owner-badge">Owner</span>}
                      <span className="invite-code">Code: {group.inviteCode}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
