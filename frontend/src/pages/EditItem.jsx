import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { CATEGORIES, STATUSES } from '../constants.js';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((res) => {
        const item = res.data;
        setForm({
          title: item.title,
          category: item.category,
          description: item.description,
          type: item.type,
          location: item.location,
          date: item.date.slice(0, 10),
          status: item.status
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load item'));
  }, [id]);

  if (!form) return <div className="page">{error || 'Loading...'}</div>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await api.put(`/items/${id}`, data);
      navigate('/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h1>Edit report</h1>
      <form className="form" onSubmit={submit}>
        {error && <div className="alert">{error}</div>}
        <label className="field">
          Title
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label className="field">
          Type
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Lost</option>
            <option>Found</option>
          </select>
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
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </label>
        <label className="field">
          Location
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        </label>
        <label className="field">
          Date
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </label>
        <label className="field">
          Status
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Replace image (optional)
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0] || null)} />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
