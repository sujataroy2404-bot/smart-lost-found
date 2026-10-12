import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Items from './pages/Items.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import ReportItem from './pages/ReportItem.jsx';
import MyReports from './pages/MyReports.jsx';
import EditItem from './pages/EditItem.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function Guest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Guest>
            <Login />
          </Guest>
        }
      />
      <Route
        path="/register"
        element={
          <Guest>
            <Register />
          </Guest>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/items"
        element={
          <Protected>
            <Items />
          </Protected>
        }
      />
      <Route
        path="/items/:id"
        element={
          <Protected>
            <ItemDetail />
          </Protected>
        }
      />
      <Route
        path="/report-lost"
        element={
          <Protected>
            <ReportItem type="Lost" />
          </Protected>
        }
      />
      <Route
        path="/report-found"
        element={
          <Protected>
            <ReportItem type="Found" />
          </Protected>
        }
      />
      <Route
        path="/my-reports"
        element={
          <Protected>
            <MyReports />
          </Protected>
        }
      />
      <Route
        path="/my-reports/:id/edit"
        element={
          <Protected>
            <EditItem />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
