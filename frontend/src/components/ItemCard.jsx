import { Link } from 'react-router-dom';
import { imageUrl } from '../api';

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item._id}`} className="card item-card">
      {item.image ? <img src={imageUrl(item.image)} alt={item.title} /> : <div className="placeholder">No image</div>}
      <div className="item-body">
        <div className="badges">
          <span className={`badge ${item.type}`}>{item.type}</span>
          <span className={`badge ${item.status}`}>{item.status}</span>
        </div>
        <h3 style={{ margin: '0 0 6px' }}>{item.title}</h3>
        <p className="muted" style={{ margin: 0 }}>
          {item.category} · {item.location}
        </p>
      </div>
    </Link>
  );
}
