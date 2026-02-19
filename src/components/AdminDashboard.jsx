import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  UserPlus, 
  AlertCircle,
  Building2,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Button, Input, Badge } from './common';

export const AdminDashboard = ({ user, onViewMaster }) => {
  const [masters, setMasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasters = () => {
      setLoading(true);
      const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
      // Filter for users with 'master' role or no role (default)
      const masterUsers = allUsers.filter(u => u.role === 'master' || !u.role);
      setMasters(masterUsers);
      setLoading(false);
    };

    fetchMasters();
  }, []);

  const handleDeleteMaster = (id) => {
    if (!confirm('Are you sure you want to delete this Master Agent account? This will NOT delete their business data, only their access.')) return;
    
    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    const updatedUsers = allUsers.filter(u => u.id !== id);
    localStorage.setItem('float_app_users', JSON.stringify(updatedUsers));
    setMasters(updatedUsers.filter(u => u.role === 'master' || !u.role));
  };

  const filteredMasters = masters.filter(m => 
    m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.businessName && m.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Owner Administration
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all master agent accounts on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search masters..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Masters</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{masters.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Businesses</span>
          </div>
          <p className="text-3xl font-black text-slate-800">
            {new Set(masters.map(m => m.businessName)).size}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Today</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{masters.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-700">Master Agent Accounts</h3>
          <Badge color="blue">{filteredMasters.length} Users</Badge>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading master accounts...</div>
        ) : filteredMasters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Business & User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Platform Stats</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMasters.map(master => (
                  <tr key={master.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
                          {(master.businessName || master.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{master.businessName || 'Unnamed Business'}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3" /> @{master.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color="blue">Master Agent</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="text-center">
                          <span className="block font-bold text-slate-700">--</span>
                          <span>Agents</span>
                        </div>
                        <div className="text-center">
                          <span className="block font-bold text-slate-700">--</span>
                          <span>Ops</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex items-center gap-1 h-8 text-xs px-3 font-bold"
                          onClick={() => onViewMaster(master.id, master.businessName || master.username)}
                        >
                          <Eye className="w-3.5 h-3.5" /> View Dashboard
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="h-8 w-8 !p-0 flex items-center justify-center bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                          onClick={() => handleDeleteMaster(master.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold text-slate-300">No Master Agents Found</p>
            <p className="text-sm">Try searching for a different username or business name.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components if needed or they are already in common.jsx
const User = ({ className }) => <Users className={className} />;
const CalendarIcon = ({ className }) => <Calendar className={className} />;
