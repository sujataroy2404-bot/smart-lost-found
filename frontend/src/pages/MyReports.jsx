import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { STATUSES } from '../constants.js';

export default function MyReports() {
  const [items, setItems] = useState([]);
  const [claimsByItem, setClaimsByItem] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get('/items', { params: { mine: true } });
    setItems(res.data);
    const pairs = await Promise.all(
      res.data.map(async (item) => {
        const claims = await api.get(`/claims/item/${item._id}`);
        return [item._id, claims.data];
      })
    );
    setClaimsByItem(Object.fromEntries(pairs));
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load reports'));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/items/${id}/status`, { status });
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    await api.delete(`/items/${id}`);
    await load();
  };

  return (
    <div className="page">
      <h1>My Reports</h1>
      <p className="muted">Edit, delete, update status, and review claim requests.</p>
      {error && <div className="alert">{error}</div>}
      {items.length === 0 && <div className="empty">You have not reported any items yet.</div>}
      {items.map((item) => (
        <div key={item._id} className="card card-body" style={{ marginBottom: 14 }}>
          <div className="badges">
            <span className={`badge ${item.type}`}>{item.type}</span>
            <span className={`badge ${item.status}`}>{item.status}</span>
          </div>
          <h3 style={{ margin: '8px 0' }}>{item.title}</h3>
          <p className="muted">
            {item.category} · {item.location}
          </p>
          <div className="row">
            <Link className="btn small" to={`/items/${item._id}`}>
              View
            </Link>
            <Link className="btn small secondary" to={`/my-reports/${item._id}/edit`}>
              Edit
            </Link>
            <select value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="btn small danger" onClick={() => remove(item._id)}>
              Delete
            </button>
          </div>
          <div className="claim">
            <strong>Claim requests</strong>
            {(claimsByItem[item._id] || []).length === 0 && <p className="muted">None</p>}
            {(claimsByItem[item._id] || []).map((c) => (
              <p key={c._id}>
                {c.claimant?.name}: {c.message} — <span className={`badge ${c.status}`}>{c.status}</span>
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
