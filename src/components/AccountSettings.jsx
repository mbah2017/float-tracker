import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  User, 
  Mail, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  KeyRound
} from 'lucide-react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Card, Button, Input, Badge } from './common';

export const AccountSettings = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const firebaseUser = auth.currentUser;
      
      // 1. Re-authenticate the user first (security requirement for sensitive ops)
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // 2. Update password
      await updatePassword(firebaseUser, newPassword);
      
      setSuccess("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Password update error:", err);
      if (err.code === 'auth/wrong-password') {
        setError("Current password is incorrect.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Account Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="p-6 md:col-span-1 space-y-6 border-slate-100 shadow-sm">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl mx-auto mb-4 shadow-inner">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{user.username}</h3>
            <Badge color={user.role === 'owner' ? 'red' : 'blue'}>
              {user.role === 'owner' ? 'Platform Owner' : 'Master Agent'}
            </Badge>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-slate-700 truncate">{user.email || 'No email set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name</p>
                <p className="text-slate-700 truncate">{user.businessName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                <p className="text-emerald-600 font-bold">Verified & Active</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Password Update Card */}
        <Card className="p-6 md:col-span-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Security & Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4">
              <p className="text-xs text-blue-700 leading-relaxed">
                For security reasons, you must provide your current password before you can set a new one.
              </p>
            </div>

            <Input 
              label="Current Password" 
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input 
                label="New Password" 
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 chars"
                required
                disabled={loading}
              />
              <Input 
                label="Confirm New Password" 
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100"
                disabled={loading}
                icon={loading ? Loader2 : Lock}
              >
                Update Security Credentials
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
