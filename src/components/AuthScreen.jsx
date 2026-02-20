import React, { useState } from 'react';
import { Banknote, Building2, Lock, AlertCircle, Loader2, ShieldCheck, Globe as GlobeIcon } from 'lucide-react';
import { Input, Button } from './common';
import { hashPassword, generateId } from '../utils/crypto';
import { useLanguage } from '../context/LanguageContext';

export const AuthScreen = ({ onLogin }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = formData.username.trim();
    const password = formData.password;
    const businessName = formData.businessName.trim();

    const users = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    const isFirstUser = users.length === 0;

    if (!username || !password || (isRegistering && !businessName && !isFirstUser)) {
      setError(t('fields_required'));
      return;
    }

    if (password.length < 6) {
      setError(t('password_too_short'));
      return;
    }

    setLoading(true);
    try {
      const hashedPass = await hashPassword(password);

      if (isRegistering) {
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
          setError(t('username_exists'));
          setLoading(false);
          return;
        }
        
        // First user is always OWNER. Others are MASTER.
        const userRole = isFirstUser ? 'owner' : 'master';

        const newUser = { 
          id: generateId(),
          username: username, 
          password: hashedPass, 
          businessName: isFirstUser ? 'Platform Administration' : (businessName || 'My Business'),
          role: userRole
        };
        users.push(newUser);
        localStorage.setItem('float_app_users', JSON.stringify(users));
        
        if (isFirstUser) {
           alert('Platform Owner Account Created Successfully!');
        } else {
           alert(t('welcome_message').replace('{name}', businessName));
        }
        
        onLogin(newUser);
      } else {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === hashedPass);
        if (user) {
          onLogin(user);
        } else {
          setError(t('invalid_credentials'));
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(t('unexpected_error'));
    } finally {
      setLoading(false);
    }
  };

  const usersCount = JSON.parse(localStorage.getItem('float_app_users') || '[]').length;
  const isFirstUser = usersCount === 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <button 
        onClick={toggleLanguage}
        className="absolute top-4 right-4 flex items-center gap-2 text-blue-900 hover:text-blue-700 transition-colors text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
      >
        <GlobeIcon className="w-4 h-4" /> {language.toUpperCase()}
      </button>
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
              name="username"
              label={t('username')} 
              placeholder={t('username_placeholder')} 
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
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
