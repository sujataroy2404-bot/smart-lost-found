import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ItemCard from '../components/ItemCard.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/items')])
      .then(([s, items]) => {
        setStats(s.data);
        setRecent(items.data.slice(0, 6));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  return (
    <div className="page">
      <div className="hero">
        <h1>Dashboard</h1>
        <p className="muted">Overview of lost and found activity.</p>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="stats">
        <div className="stat-card">
          Total Lost Items
          <strong>{stats?.totalLost ?? '—'}</strong>
        </div>
        <div className="stat-card">
          Total Found Items
          <strong>{stats?.totalFound ?? '—'}</strong>
        </div>
        <div className="stat-card">
          Resolved / Claimed
          <strong>{stats?.resolvedOrClaimed ?? '—'}</strong>
        </div>
        <div className="stat-card">
          Active Reports
          <strong>{stats?.active ?? '—'}</strong>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 18 }}>
        <Link className="btn" to="/report-lost">
          Report Lost Item
        </Link>
        <Link className="btn secondary" to="/report-found">
          Report Found Item
        </Link>
        <Link className="btn secondary" to="/items">
          Search Items
        </Link>
      </div>
      <h2>Recent reports</h2>
      {recent.length === 0 ? (
        <div className="empty">No items yet. Be the first to report one.</div>
      ) : (
        <div className="item-grid">
          {recent.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
