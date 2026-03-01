import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pushupsApi } from '../services/api';

interface PushupEntry {
  id: number;
  count: number;
  date: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [todayEntries, setTodayEntries] = useState<PushupEntry[]>([]);
  const [history, setHistory] = useState<PushupEntry[]>([]);
  const [newCount, setNewCount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        pushupsApi.getToday(),
        pushupsApi.getAll(10),
      ]);
      setTodayCount(todayRes.data.totalCount);
      setTodayEntries(todayRes.data.entries);
      setHistory(historyRes.data.entries);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const count = parseInt(newCount, 10);
    if (isNaN(count) || count <= 0) {
      setError('Please enter a valid number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await pushupsApi.create(count);
      setNewCount('');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log push-ups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await pushupsApi.delete(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>💪 Push-Up Tracker</h1>
        <nav className="nav-links">
          <Link to="/" className="active">Dashboard</Link>
          <Link to="/groups">Groups</Link>
        </nav>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="today-section">
          <h2>Today's Push-ups</h2>
          <div className="today-count">{todayCount}</div>

          <form onSubmit={handleSubmit} className="add-form">
            {error && <div className="error">{error}</div>}
            <input
              type="number"
              value={newCount}
              onChange={(e) => setNewCount(e.target.value)}
              placeholder="Enter push-ups"
              min="1"
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Push-ups'}
            </button>
          </form>

          {todayEntries.length > 0 && (
            <div className="today-entries">
              <h3>Today's Entries</h3>
              <ul>
                {todayEntries.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.count} push-ups</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="delete-btn"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="history-section">
          <h2>Recent History</h2>
          {history.length === 0 ? (
            <p className="no-data">No push-ups logged yet. Start tracking!</p>
          ) : (
            <ul className="history-list">
              {history.map((entry) => (
                <li key={entry.id}>
                  <span className="entry-count">{entry.count}</span>
                  <span className="entry-date">{formatDate(entry.date)}</span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
