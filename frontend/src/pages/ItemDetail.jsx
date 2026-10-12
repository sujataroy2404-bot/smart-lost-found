import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { imageUrl } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const load = async () => {
    const [itemRes, claimRes] = await Promise.all([api.get(`/items/${id}`), api.get(`/claims/item/${id}`)]);
    setItem(itemRes.data);
    setClaims(claimRes.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load item'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!item) return <div className="page">{error || 'Loading...'}</div>;

  const ownerId = item.reportedBy?._id || item.reportedBy;
  const isOwner = ownerId === user.id || ownerId === user._id;
  const myClaim = claims.find((c) => (c.claimant?._id || c.claimant) === user.id);
  const canClaim = item.type === 'Found' && item.status === 'Active' && !isOwner && !myClaim;

  const submitClaim = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/claims', { itemId: item._id, message });
      setMessage('');
      setInfo('Claim request submitted.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Claim failed');
    }
  };

  const review = async (claimId, status) => {
    setError('');
    try {
      await api.patch(`/claims/${claimId}`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="page">
      {error && <div className="alert">{error}</div>}
      {info && <div className="alert" style={{ background: '#dcfce7', color: '#166534' }}>{info}</div>}
      <div className="detail">
        <div className="card">
          {item.image ? <img className="detail-img" src={imageUrl(item.image)} alt={item.title} /> : <div className="placeholder">No image</div>}
          <div className="card-body">
            <div className="badges">
              <span className={`badge ${item.type}`}>{item.type}</span>
              <span className={`badge ${item.status}`}>{item.status}</span>
              <span className="badge Active">{item.category}</span>
            </div>
            <h1>{item.title}</h1>
            <p>{item.description}</p>
            <p className="muted">Location: {item.location}</p>
            <p className="muted">Date: {new Date(item.date).toLocaleDateString()}</p>
            <p className="muted">Reported by: {item.reportedBy?.name}</p>
          </div>
        </div>
        <div className="card card-body">
          <h2>Claims</h2>
          {canClaim && (
            <form onSubmit={submitClaim}>
              <label className="field">
                Short message
                <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} required />
              </label>
              <button className="btn">Request claim</button>
            </form>
          )}
          {myClaim && !isOwner && (
            <p>
              Your claim status: <span className={`badge ${myClaim.status}`}>{myClaim.status}</span>
            </p>
          )}
          {claims.length === 0 && <p className="muted">No claim requests yet.</p>}
          {claims.map((claim) => (
            <div key={claim._id} className="claim">
              <p>
                <strong>{claim.claimant?.name || 'You'}</strong>{' '}
                <span className={`badge ${claim.status}`}>{claim.status}</span>
              </p>
              <p>{claim.message}</p>
              {isOwner && claim.status === 'Pending' && (
                <div className="row">
                  <button className="btn small" onClick={() => review(claim._id, 'Approved')}>
                    Approve
                  </button>
                  <button className="btn small danger" onClick={() => review(claim._id, 'Rejected')}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
