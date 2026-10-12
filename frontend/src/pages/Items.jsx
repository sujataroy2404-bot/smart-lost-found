import { useEffect, useState } from 'react';
import api from '../api';
import ItemCard from '../components/ItemCard.jsx';
import { CATEGORIES, STATUSES } from '../constants.js';

const empty = { search: '', type: '', category: '', location: '', status: '' };

export default function Items() {
  const [filters, setFilters] = useState(empty);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = async (query = filters) => {
    setError('');
    try {
      const res = await api.get('/items', { params: query });
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load items');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <h1>Search & Filter</h1>
      <p className="muted">Find lost and found items by keyword, type, category, location, or status.</p>
      {error && <div className="alert">{error}</div>}
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input
          placeholder="Search by name or keyword"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">Lost / Found</option>
          <option value="Lost">Lost</option>
          <option value="Found">Found</option>
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">Category</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Status</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="row">
          <button className="btn">Search</button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setFilters(empty);
              load(empty);
            }}
          >
            Reset
          </button>
        </div>
      </form>
      {items.length === 0 ? (
        <div className="empty">No matching items.</div>
      ) : (
        <div className="item-grid">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
