import React, { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';

export default function FloatTrackerApp() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('float_current_session');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u) => {
    localStorage.setItem('float_current_session', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('float_current_session');
    setUser(null);
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
