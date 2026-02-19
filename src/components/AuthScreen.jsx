import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { Banknote, Building2, Lock, AlertCircle, Loader2, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { Input, Button } from './common';
import { auth, db } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';

export const AuthScreen = ({ onLogin }) => {
  const { t } = useLanguage();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ownerExists, setOwnerExists] = useState(true);

  // Safety check: ensure owner exists before allowing registration
  useEffect(() => {
    const checkOwner = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'owner'), limit(1));
      const snap = await getDocs(q);
      setOwnerExists(!snap.empty);
    };
    checkOwner();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setMessage("Password reset email sent! Check your inbox.");
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = formData.email.trim();
    const password = formData.password;
    const businessName = formData.businessName.trim();

    if (!email || (!isResettingPassword && !password) || (isRegistering && !businessName)) {
      setError(t('fields_required'));
      return;
    }

    if (!isResettingPassword && password.length < 6) {
      setError(t('password_too_short'));
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        if (!ownerExists) {
          setError("Platform setup incomplete. Contact Administrator.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        const newUser = { 
          id: firebaseUser.uid,
          username: email.split('@')[0],
          email: email,
          businessName: businessName || 'My Business',
          role: 'master',
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        alert(t('welcome_message').replace('{name}', businessName));
        onLogin(newUser);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          onLogin(userDoc.data());
        } else {
          setError("User data not found.");
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
            {isResettingPassword ? <KeyRound className="w-8 h-8 text-blue-200" /> : <Banknote className="w-8 h-8 text-blue-200" />}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 relative z-10 tracking-tight">
            {isResettingPassword ? 'Reset Password' : 'Float Manager'}
          </h1>
          <p className="text-blue-200 text-sm relative z-10">{isResettingPassword ? 'Recover your account access' : t('control_center')}</p>
        </div>

        <div className="p-8">
          {!isResettingPassword && (
            <div className="flex gap-4 mb-6 bg-slate-100 p-1 rounded-lg">
              <button 
                type="button"
                disabled={loading}
                onClick={() => { setIsRegistering(false); setError(''); setMessage(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('login')}
              </button>
              <button 
                type="button"
                disabled={loading || !ownerExists}
                onClick={() => { setIsRegistering(true); setError(''); setMessage(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!ownerExists ? 'opacity-50 cursor-not-allowed' : ''} ${isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t('register_business')}
              </button>
            </div>
          )}

          {!ownerExists && !isResettingPassword && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-xs text-red-700 font-medium">
                Platform is undergoing initialization. Registrations are currently disabled. Please contact the system owner.
              </p>
            </div>
          )}

          <form onSubmit={isResettingPassword ? handleForgotPassword : handleSubmit} className="space-y-4 text-left">
            {isRegistering && (
              <div className="p-3 bg-blue-50 text-blue-700 text-[11px] rounded-xl border border-blue-100 mb-2 leading-relaxed">
                {t('master_agent_desc')}
              </div>
            )}
            
            {isRegistering && (
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
            
            {!isResettingPassword && (
              <Input 
                name="password"
                type="password"
                label={t('password')} 
                placeholder={t('password_placeholder')} 
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-start gap-2 animate-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-100" 
              disabled={loading || (isRegistering && !ownerExists)}
              icon={loading ? Loader2 : (isResettingPassword ? KeyRound : (isRegistering ? Building2 : Lock))}
            >
              {loading ? t('processing') : (isResettingPassword ? "Send Reset Email" : (isRegistering ? t('create_master_account') : t('sign_in_dashboard')))}
            </Button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => {
                  setIsResettingPassword(!isResettingPassword);
                  setError('');
                  setMessage('');
                }}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                {isResettingPassword ? "Back to Login" : "Forgot Password?"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
