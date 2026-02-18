import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { verifySessionToken, createSessionToken } from './utils/crypto';

export default function FloatTrackerApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('float_current_session_token');
      if (token) {
        const verifiedUser = await verifySessionToken(token);
        if (verifiedUser) {
          setUser(verifiedUser);
        } else {
          localStorage.removeItem('float_current_session_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = async (u) => {
    const token = await createSessionToken(u);
    localStorage.setItem('float_current_session_token', token);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('float_current_session_token');
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">Securing session...</div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
