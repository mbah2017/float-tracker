import React, { useState } from 'react';
import { Banknote, Building2, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Input, Button } from './common';
import { hashPassword, generateId } from '../utils/crypto';

export const AuthScreen = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = formData.username.trim();
    const password = formData.password;
    const businessName = formData.businessName.trim();

    if (!username || !password || (isRegistering && !businessName)) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('float_app_users') || '[]');
      const hashedPass = await hashPassword(password);

      if (isRegistering) {
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
          setError('Username already exists');
          setLoading(false);
          return;
        }
        const newUser = { 
          id: generateId(),
          username: username, 
          password: hashedPass, 
          businessName: businessName || 'My Business',
          role: 'master'
        };
        users.push(newUser);
        localStorage.setItem('float_app_users', JSON.stringify(users));
        alert(`Welcome to Float Manager, ${businessName}!`);
        onLogin(newUser);
      } else {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === hashedPass);
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid username or password');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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
            <Banknote className="w-8 h-8 text-blue-200" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 relative z-10 tracking-tight">Float Manager</h1>
          <p className="text-blue-200 text-sm relative z-10">Master Agent Control Center</p>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-6 bg-slate-100 p-1 rounded-lg">
            <button 
              type="button"
              disabled={loading}
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button 
              type="button"
              disabled={loading}
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Register Business
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isRegistering && (
              <div className="p-3 bg-blue-50 text-blue-700 text-[11px] rounded-xl border border-blue-100 mb-2 leading-relaxed">
                You are creating a <strong>Master Agent</strong> account. This account will have full control over agents and the ability to onboard staff (Operators).
              </div>
            )}
            
            {isRegistering && (
              <Input 
                name="businessName"
                label="Business Name" 
                placeholder="e.g. Ali's Transfer Shop" 
                value={formData.businessName}
                onChange={handleChange}
                disabled={loading}
              />
            )}
            
            <Input 
              name="username"
              label="Username" 
              placeholder="Enter username" 
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            
            <Input 
              name="password"
              type="password"
              label="Password" 
              placeholder="••••••••" 
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
              icon={loading ? Loader2 : (isRegistering ? Building2 : Lock)}
            >
              {loading ? 'Processing...' : (isRegistering ? 'Create Master Account' : 'Sign In to Dashboard')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
