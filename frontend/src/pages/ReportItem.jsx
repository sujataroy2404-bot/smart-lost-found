import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CATEGORIES } from '../constants.js';

export default function ReportItem({ type }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    location: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Active'
  });
  const [image, setImage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('type', type);
      if (image) data.append('image', image);
      const res = await api.post('/items', data);
      navigate(`/items/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h1>Report {type} Item</h1>
      <form className="form" onSubmit={submit}>
        {error && <div className="alert">{error}</div>}
        <label className="field">
          Item name / title
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label className="field">
          Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Description
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </label>
        <label className="field">
          {type === 'Lost' ? 'Location lost' : 'Location found'}
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        </label>
        <label className="field">
          {type === 'Lost' ? 'Date lost' : 'Date found'}
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </label>
        <label className="field">
          Status
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Active</option>
            <option>Closed</option>
          </select>
        </label>
        <label className="field">
          Optional image
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? 'Saving...' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
