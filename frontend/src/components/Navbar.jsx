import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <NavLink to="/" className="brand">
        Smart Lost & Found
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/items">Search</NavLink>
        <NavLink to="/report-lost">Report Lost</NavLink>
        <NavLink to="/report-found">Report Found</NavLink>
        <NavLink to="/my-reports">My Reports</NavLink>
        <span className="muted">{user?.name}</span>
        <button
          className="btn small secondary"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
