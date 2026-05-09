import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

// ─── Seed accounts (stored in localStorage on first run) ───
const SEED_USERS = [
  {
    id: 'u1',
    name: 'Dr. Amal Samir',
    email: 'admin@university.edu',
    password: 'Admin@123',
    role: 'admin',
    avatar: 'AS',
    department: 'Administration',
    createdAt: Date.now() - 864e5 * 30,
  },
  {
    id: 'u2',
    name: 'Dr. Khaled Nour',
    email: 'doctor@university.edu',
    password: 'Doctor@123',
    role: 'doctor',
    avatar: 'DK',
    department: 'Mathematics',
    createdAt: Date.now() - 864e5 * 20,
  },
  {
    id: 'u3',
    name: 'Eng. Rania Hassan',
    email: 'engineer@university.edu',
    password: 'Engineer@123',
    role: 'engineer',
    avatar: 'ER',
    department: 'Science',
    createdAt: Date.now() - 864e5 * 10,
  },
];

// ─── Role permissions ───
export const PERMISSIONS = {
  admin: {
    canAddStudent: true,
    canEditStudent: true,
    canDeleteStudent: true,
    canViewStats: true,
    canViewActivity: true,
    canManageUsers: true,
    canExportImport: true,
    canBulkDelete: true,
    canCompare: true,
    label: 'Administrator',
    color: '#ef4444',
    bg: '#fee2e2',
    badge: 'Admin',
  },
  doctor: {
    canAddStudent: true,
    canEditStudent: true,
    canDeleteStudent: false,
    canViewStats: true,
    canViewActivity: true,
    canManageUsers: false,
    canExportImport: true,
    canBulkDelete: false,
    canCompare: true,
    label: 'Doctor',
    color: '#10b981',
    bg: '#d1fae5',
    badge: 'Doctor',
  },
  engineer: {
    canAddStudent: false,
    canEditStudent: false,
    canDeleteStudent: false,
    canViewStats: true,
    canViewActivity: false,
    canManageUsers: false,
    canExportImport: false,
    canBulkDelete: false,
    canCompare: true,
    label: 'Engineer',
    color: '#6366f1',
    bg: '#ede9fe',
    icon: '👁️',
    badge: 'Engineer',
  },
};

// Bump this version whenever you change SEED_USERS names/emails/roles
const SEED_VERSION = 'v4';

function loadUsers() {
  try {
    const stored    = localStorage.getItem('sms_users');
    const storedVer = localStorage.getItem('sms_users_version');
    // No data yet, or seed version changed → reset to latest SEED_USERS
    if (!stored || storedVer !== SEED_VERSION) {
      localStorage.setItem('sms_users', JSON.stringify(SEED_USERS));
      localStorage.setItem('sms_users_version', SEED_VERSION);
      return SEED_USERS;
    }
    return JSON.parse(stored);
  } catch { return SEED_USERS; }
}

function saveUsers(users) {
  localStorage.setItem('sms_users', JSON.stringify(users));
}

function loadSession() {
  try {
    const s = sessionStorage.getItem('sms_session') || localStorage.getItem('sms_session');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [users,       setUsers]       = useState(loadUsers);
  const [currentUser, setCurrentUser] = useState(loadSession);
  const [authError,   setAuthError]   = useState('');
  const [isLoading,   setIsLoading]   = useState(false);

  const permissions = currentUser ? PERMISSIONS[currentUser.role] : null;

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError('');
    await new Promise(r => setTimeout(r, 700)); // simulate network
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    setIsLoading(false);
    if (!user) {
      setAuthError('Invalid email or password. Please try again.');
      return false;
    }
    const session = { ...user, loginAt: Date.now() };
    delete session.password;
    setCurrentUser(session);
    sessionStorage.setItem('sms_session', JSON.stringify(session));
    return true;
  }, [users]);

  const signup = useCallback(async (data) => {
    setIsLoading(true);
    setAuthError('');
    await new Promise(r => setTimeout(r, 800));
    const exists = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      setIsLoading(false);
      setAuthError('An account with this email already exists.');
      return false;
    }
    const newUser = {
      id: 'u' + Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'viewer', // new signups are viewers by default
      avatar: data.name.split(' ').slice(0,2).map(w=>w[0].toUpperCase()).join(''),
      department: data.department || 'General',
      createdAt: Date.now(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    setIsLoading(false);

    // Auto-login
    const session = { ...newUser, loginAt: Date.now() };
    delete session.password;
    setCurrentUser(session);
    sessionStorage.setItem('sms_session', JSON.stringify(session));
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('sms_session'); localStorage.removeItem('sms_session');
    localStorage.removeItem('sms_recentlyViewed');
  }, []);

  const updateUserRole = useCallback((userId, newRole) => {
    const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(updated);
    saveUsers(updated);
  }, [users]);

  const clearError = useCallback(() => setAuthError(''), []);

  return (
    <AuthContext.Provider value={{
      currentUser, permissions,
      users, login, signup, logout,
      authError, clearError, isLoading,
      updateUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
