import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';

export default function StatsPage() {
  const { user, logout } = useAuth();
  const [daily, setDaily] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/stats/personal')
      .then((res) => {
        setDaily(Object.entries(res.data.daily).map(([date, count]) => ({ date, count })));
        setWeekly(Object.entries(res.data.weekly).map(([week, count]) => ({ week, count })));
      })
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>💪 Push-Up Tracker</h1>
        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/groups">Groups</Link>
          <Link to="/stats" className="active">Stats</Link>
        </nav>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      <main className="dashboard-main">
        <h2>Push-Up Stats</h2>
        {error && <div className="error">{error}</div>}
        {loading ? <div className="loading">Loading...</div> : (
          <>
            <section className="stats-section">
              <h3>Last 30 Days</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={daily}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={4} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#4a90d9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </section>
            <section className="stats-section">
              <h3>Last 12 Weeks</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} interval={1} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4a90d9" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
