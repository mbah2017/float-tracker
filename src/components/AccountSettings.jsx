import React from 'react';
import { User, Mail, Building2, ShieldCheck } from 'lucide-react';
import { Card, Badge } from './common';

export const AccountSettings = ({ user }) => {
  if (!user) return <div className="p-8 text-center text-slate-500">Loading user profile...</div>;

  const username = user.username || user.email?.split('@')[0] || 'User';
  const userRole = user.role === 'owner' ? 'Platform Owner' : 'Master Agent';

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center text-left">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Account Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1 space-y-6 border-slate-100 shadow-sm">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl mx-auto mb-4 shadow-inner">
              {username.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight truncate px-2">{username}</h3>
            <Badge color={user.role === 'owner' ? 'red' : 'blue'}>
              {userRole}
            </Badge>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50 text-left">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-slate-700 truncate">{user.email || 'No email set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name</p>
                <p className="text-slate-700 truncate">{user.businessName || 'No business set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                <p className="text-emerald-600 font-bold">Verified & Active</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
