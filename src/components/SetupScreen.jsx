import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  where,
  limit 
} from 'firebase/firestore';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { Button, Input } from './common';

export const SetupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkOwnerExists = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'owner'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Owner already exists, redirect to login
          navigate('/');
        }
      } catch (err) {
        console.error("Error checking owner:", err);
      }
    };
    checkOwnerExists();
  }, [navigate]);

  const handleSetup = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError('');

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create User Document in Firestore with OWNER role
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        username: email.split('@')[0],
        businessName: 'Platform Administration',
        role: 'owner',
        createdAt: new Date().toISOString(),
      });

      // 3. Success! App component's listener will pick up the user state
      navigate('/');
    } catch (error) {
      console.error('Error creating owner:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already in use.");
      } else {
        setError(error.message || "Failed to create owner account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-400 rounded-full blur-2xl"></div>
          </div>
          <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg relative z-10">
            <ShieldCheck className="w-8 h-8 text-blue-200" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 relative z-10 tracking-tight">Platform Initialization</h1>
          <p className="text-blue-200 text-sm relative z-10">Create the primary Owner/Administrator account</p>
        </div>

        <div className="p-8">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>System Setup:</strong> You are seeing this because no Platform Owner has been defined. The account created here will have absolute authority over all Master Agents and business data.
            </p>
          </div>

          <form onSubmit={handleSetup} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              icon={Mail}
              required
              disabled={loading}
            />
            <Input
              label="Admin Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              icon={Lock}
              required
              disabled={loading}
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-100"
              disabled={loading}
              icon={loading ? Loader2 : ShieldCheck}
            >
              {loading ? "Initializing..." : "Create Owner Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
