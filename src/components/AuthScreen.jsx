import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { Banknote, Building2, Lock, AlertCircle, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { Input, Button } from './common';
import { auth, db } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';

export const AuthScreen = ({ onLogin }) => {
  const { t } = useLanguage();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);

  // Check if any users exist to determine if the next registration is the owner
  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(1));
        const querySnapshot = await getDocs(q);
        setIsFirstUser(querySnapshot.empty);
      } catch (err) {
        console.error("Error checking users:", err);
      }
    };
    checkFirstUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = formData.email.trim();
    const password = formData.password;
    const businessName = formData.businessName.trim();

    if (!email || !password || (isRegistering && !businessName && !isFirstUser)) {
      setError(t('fields_required'));
      return;
    }

    if (password.length < 6) {
      setError(t('password_too_short'));
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Determine role
        const userRole = isFirstUser ? 'owner' : 'master';
        const finalBusinessName = isFirstUser ? 'Platform Administration' : (businessName || 'My Business');

        const newUser = { 
          id: firebaseUser.uid,
          username: email.split('@')[0], // Use part of email as username
          email: email,
          businessName: finalBusinessName,
          role: userRole,
          createdAt: new Date().toISOString()
        };

        // Store in Firestore
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        if (isFirstUser) {
           alert('Platform Owner Account Created Successfully!');
        } else {
           alert(t('welcome_message').replace('{name}', finalBusinessName));
        }
        
        onLogin(newUser);
      } else {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Get metadata from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          onLogin(userDoc.data());
        } else {
          // This shouldn't happen if they registered through the app
          setError("User data not found in database.");
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError(t('username_exists'));
      } else if (err.code === 'auth/invalid-credential') {
        setError(t('invalid_credentials'));
      } else {
        setError(err.message || t('unexpected_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400 rounded-full blur-2xl"></div>
          </div>
          <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg relative z-10">
            {isFirstUser && isRegistering ? <ShieldCheck className="w-8 h-8 text-blue-200" /> : <Banknote className="w-8 h-8 text-blue-200" />}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 relative z-10 tracking-tight">
            {isFirstUser && isRegistering ? 'Owner Setup' : 'Float Manager'}
          </h1>
          <p className="text-blue-200 text-sm relative z-10">
            {isFirstUser && isRegistering ? 'Initialize Platform Administration' : t('control_center')}
          </p>
        </div>

        <div className="p-8">
          {!isFirstUser && (
            <div className="flex gap-4 mb-6 bg-slate-100 p-1 rounded-lg">
              <button 
                type="button"
                disabled={loading}
                onClick={() => { setIsRegistering(false); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('login')}
              </button>
              <button 
                type="button"
                disabled={loading}
                onClick={() => { setIsRegistering(true); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('register_business')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isRegistering && !isFirstUser && (
              <div className="p-3 bg-blue-50 text-blue-700 text-[11px] rounded-xl border border-blue-100 mb-2 leading-relaxed">
                {t('master_agent_desc')}
              </div>
            )}

            {isFirstUser && isRegistering && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  <strong>Initial Setup:</strong> No accounts exist. The first user created will be the <strong>Platform Owner</strong> with full administrative access to all master accounts.
                </p>
              </div>
            )}
            
            {isRegistering && !isFirstUser && (
              <Input 
                name="businessName"
                label={t('business_name')} 
                placeholder="e.g. Ali's Transfer Shop" 
                value={formData.businessName}
                onChange={handleChange}
                disabled={loading}
              />
            )}
            
            <Input 
              name="email"
              type="email"
              label="Email Address" 
              placeholder="user@example.com" 
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              icon={Mail}
            />
            
            <Input 
              name="password"
              type="password"
              label={t('password')} 
              placeholder={t('password_placeholder')} 
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-100" 
              disabled={loading}
              icon={loading ? Loader2 : (isRegistering ? (isFirstUser ? ShieldCheck : Building2) : Lock)}
            >
              {loading ? t('processing') : (isRegistering ? (isFirstUser ? 'Create Owner Account' : t('create_master_account')) : t('sign_in_dashboard'))}
            </Button>

            {isFirstUser && !isRegistering && (
                <button 
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="w-full text-center text-sm font-bold text-blue-600 mt-4 hover:underline"
                >
                  No owner account? Create one now.
                </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
