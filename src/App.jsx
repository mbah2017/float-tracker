import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { SetupScreen } from './components/SetupScreen';
import { useLanguage } from './context/LanguageContext';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerExists, setOwnerExists] = useState(null); // null means checking
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let unsubscribeAuth = null;

    const init = async () => {
      // 1. Check if ANY owner exists in the system
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'owner'), limit(1));
        const querySnapshot = await getDocs(q);
        const exists = !querySnapshot.empty;
        setOwnerExists(exists);

        // Explicitly block access if no owner exists and not on setup
        if (!exists && location.pathname !== '/setup') {
          navigate('/setup', { replace: true });
        }
      } catch (error) {
        console.error("Error checking owner existence:", error);
        setOwnerExists(false); // Assume false on error to be safe
      }

      // 2. Listen for Firebase Auth state changes
      unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUser({ id: firebaseUser.uid, ...userDoc.data() });
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    };

    init();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [navigate, location.pathname]);

  // While checking for owner or auth session, show loader
  if (loading || ownerExists === null) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 font-medium">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      {t('securing_session')}...
    </div>
  );

  // STRICT ENFORCEMENT: If no owner exists, ONLY allow SetupScreen
  if (!ownerExists && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return (
    <Routes>
      <Route path="/setup" element={<SetupScreen />} />
      <Route 
        path="*" 
        element={!user ? <AuthScreen onLogin={setUser} /> : <Dashboard user={user} onLogout={() => setUser(null)} />} 
      />
    </Routes>
  );
}

export default function FloatTrackerApp() {
  return <AppContent />;
}
