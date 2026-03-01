import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { groupsApi } from '../services/api';
import { groupStatsApi } from '../services/groupStatsApi';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
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
  const [groupStats, setGroupStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const groupId = parseInt(id || '0', 10);

  useEffect(() => {
    if (groupId) {
      loadGroup();
      loadLeaderboard();
      loadGroupStats();
    }
    // eslint-disable-next-line
  }, [groupId, period]);

  const loadGroupStats = async () => {
    try {
      const response = await groupStatsApi.getGroupStats(groupId);
      setGroupStats(response.data);
    } catch (err) {
      // ignore
    }
  };

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

          {/* Group Stats Charts */}
          {groupStats.length > 0 && (
            <div className="stats-section">
              <h3>Group Daily Stats (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mergeStats(groupStats, 'daily', 'date')}>
                  <XAxis dataKey="date" type="category" tick={{ fontSize: 12 }} interval={4}
                    allowDuplicatedCategory={false}
                    domain={["dataMin", "dataMax"]} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {groupStats.map((member) => (
                    <Line
                      key={member.userId}
                      type="monotone"
                      dataKey={String(member.userId)}
                      name={member.name}
                      strokeWidth={2}
                      dot={false}
                      stroke={member.userId === user?.id ? '#4a90d9' : undefined}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <h3>Group Weekly Stats (Last 12 Weeks)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mergeStats(groupStats, 'weekly', 'week')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" type="category" tick={{ fontSize: 12 }} interval={1} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {groupStats.map((member) => (
                    <Bar
                      key={member.userId}
                      dataKey={String(member.userId)}
                      name={member.name}
                      fill={member.userId === user?.id ? '#4a90d9' : undefined}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
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

// Helper to merge member stats for chart
function mergeStats(stats: any[], key: 'daily' | 'weekly', xKey: 'date' | 'week') {
  if (!stats.length) return [];
  const length = stats[0][key].length;
  const merged: any[] = [];
  for (let i = 0; i < length; i++) {
    const row: any = { [xKey]: stats[0][key][i][xKey] };
    for (const member of stats) {
      row[member.userId] = member[key][i].count;
    }
    merged.push(row);
  }
  return merged;
}
