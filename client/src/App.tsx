import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return token ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return token ? <Navigate to="/" /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <PrivateRoute>
            <GroupsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/groups/:id"
        element={
          <PrivateRoute>
            <GroupDetailPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
