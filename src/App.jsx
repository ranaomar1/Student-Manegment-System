import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { StudentProvider }       from './context/StudentContext';
import { ToastProvider }         from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar       from './components/Sidebar';
import Footer        from './components/Footer';
import Dashboard     from './pages/Dashboard';
import Students      from './pages/Students';
import AddStudent    from './pages/AddStudent';
import EditStudent   from './pages/EditStudent';
import StudentDetail from './pages/StudentDetail';
import Stats         from './pages/Stats';
import Activity      from './pages/Activity';
import NotFound      from './pages/NotFound';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import UserManagement from './pages/UserManagement';
import Onboarding    from './components/Onboarding';
import ApiImport     from './pages/ApiImport';

function KeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (location.pathname !== '/students') navigate('/students');
        setTimeout(() => { const inp = document.querySelector('input[type="text"]'); if (inp) inp.focus(); }, 100);
      }
      if (e.key === 'Escape') window.dispatchEvent(new CustomEvent('sms:escape'));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [navigate, location]);
  return null;
}

function ProtectedRoute({ children, require: perm }) {
  const { currentUser, permissions } = useAuth();
  if (!currentUser)                     return <Navigate to="/login" replace />;
  if (perm && !permissions?.[perm])     return <Navigate to="/"      replace />;
  return children;
}

function AuthGate() {
  const [page, setPage] = useState('login');
  return page === 'login'
    ? <Login  onSwitch={() => setPage('signup')} />
    : <Signup onSwitch={() => setPage('login')}  />;
}

function AppShell() {
  const [showOnboarding, setShowOnboarding] = useState(() => !sessionStorage.getItem('sms_onboarded'));
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <div className="app-content">
        <main style={{ flex:1 }} id="main-content" role="main">
          <Routes>
            <Route path="/"               element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/students"       element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/student/:id"    element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
            <Route path="/stats"          element={<ProtectedRoute><Stats /></ProtectedRoute>} />
            <Route path="/activity"       element={<ProtectedRoute require="canViewActivity"><Activity /></ProtectedRoute>} />
            <Route path="/add-student"    element={<ProtectedRoute require="canAddStudent"><AddStudent /></ProtectedRoute>} />
            <Route path="/edit-student/:id" element={<ProtectedRoute require="canEditStudent"><EditStudent /></ProtectedRoute>} />
            <Route path="/users"          element={<ProtectedRoute require="canManageUsers"><UserManagement /></ProtectedRoute>} />
            <Route path="/api-import"     element={<ProtectedRoute require="canAddStudent"><ApiImport /></ProtectedRoute>} />
            <Route path="*"               element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        {showOnboarding && (
          <Onboarding onDone={() => { sessionStorage.setItem('sms_onboarded','true'); setShowOnboarding(false); }} />
        )}
      </div>
    </div>
  );
}

function RootRouter() {
  const { currentUser } = useAuth();
  return (
    <>
      <KeyboardShortcuts />
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <AuthGate />} />
        <Route path="/*"     element={
          currentUser
            ? (
              // key=currentUser.id forces full remount of StudentProvider on every login/logout
              // so recentlyViewed and all state starts fresh from localStorage
              <StudentProvider key={currentUser.id}>
                <AppShell />
              </StudentProvider>
            )
            : <Navigate to="/login" replace />
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <RootRouter />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
