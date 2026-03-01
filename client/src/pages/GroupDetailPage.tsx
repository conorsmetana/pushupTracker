import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { groupsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const groupId = parseInt(id || '0', 10);

  useEffect(() => {
    if (groupId) {
      loadGroup();
      loadLeaderboard();
    }
  }, [groupId, period]);

  const loadGroup = async () => {
    try {
      const response = await groupsApi.getOne(groupId);
      setGroup(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
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

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      await groupsApi.leave(groupId);
      navigate('/groups');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave group');
    }
  };

  const copyInviteCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentUserRole = group?.members.find(m => m.userId === user?.id)?.role;
  const isOwner = currentUserRole === 'owner';

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>💪 Push-Up Tracker</h1>
          <div className="user-info">
            <span>{user?.name}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="error">{error}</div>
          <Link to="/groups" className="back-link">← Back to Groups</Link>
        </main>
      </div>
    );
  }

  if (!group) return null;

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
        <Link to="/groups" className="back-link">← Back to Groups</Link>

        <section className="group-header-section">
          <div className="group-title">
            <h2>{group.name}</h2>
            {isOwner && <span className="owner-badge">Owner</span>}
          </div>
          <div className="group-actions">
            <button onClick={copyInviteCode} className="copy-btn">
              {copied ? '✓ Copied!' : `📋 Copy Invite Code: ${group.inviteCode}`}
            </button>
            <button onClick={handleLeaveGroup} className="leave-btn">Leave Group</button>
          </div>
        </section>

        <section className="leaderboard-section">
          <div className="leaderboard-header">
            <h2>Leaderboard</h2>
            <div className="period-selector">
              <button
                className={period === 'today' ? 'active' : ''}
                onClick={() => setPeriod('today')}
              >Today</button>
              <button
                className={period === 'week' ? 'active' : ''}
                onClick={() => setPeriod('week')}
              >This Week</button>
              <button
                className={period === 'month' ? 'active' : ''}
                onClick={() => setPeriod('month')}
              >This Month</button>
            </div>
          </div>

          {leaderboard && leaderboard.leaderboard.length > 0 ? (
            <div className="leaderboard-list">
              {leaderboard.leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={`leaderboard-entry ${entry.userId === user?.id ? 'current-user' : ''}`}
                >
                  <span className="rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="name">{entry.name}</span>
                  <span className="pushups">{entry.totalPushups} push-ups</span>
                  <span className="entries">({entry.entriesCount} entries)</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No push-ups logged for this period yet!</p>
          )}
        </section>

        <section className="members-section">
          <h2>Members ({group.members.length})</h2>
          <div className="members-list">
            {group.members.map((member) => (
              <div key={member.id} className="member-entry">
                <span className="member-name">
                  {member.user.name}
                  {member.userId === user?.id && ' (You)'}
                </span>
                <span className="member-role">{member.role}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
