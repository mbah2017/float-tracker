import React, { useState } from 'react';
import { Banknote, Building2, Lock, AlertCircle } from 'lucide-react';
import { Input, Button } from './common';
import { hashPassword, generateId } from '../utils/crypto';

export const AuthScreen = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', businessName: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    const hashedPass = await hashPassword(formData.password);

    if (isRegistering) {
      if (users.find(u => u.username === formData.username)) {
        setError('Username already exists');
        return;
      }
      const newUser = { 
        id: generateId(),
        username: formData.username, 
        password: hashedPass, 
        businessName: formData.businessName || 'My Business',
        role: 'master'
      };
      users.push(newUser);
      localStorage.setItem('float_app_users', JSON.stringify(users));
      onLogin(newUser);
    } else {
      const user = users.find(u => u.username === formData.username && u.password === hashedPass);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-900 p-8 text-center">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Banknote className="w-8 h-8 text-blue-200" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Float Manager</h1>
          <p className="text-blue-200 text-sm">Master Agent Control Center</p>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-6 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Register Business
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 mb-2">
                Creating a <strong>Master Agent</strong> account. You can create Operator accounts later from your dashboard.
              </div>
            )}
            {isRegistering && (
              <Input 
                name="businessName"
                label="Business Name" 
                placeholder="e.g. Ali's Transfer Shop" 
                value={formData.businessName}
                onChange={handleChange}
              />
            )}
            <Input 
              name="username"
              label="Username" 
              placeholder="Enter username" 
              value={formData.username}
              onChange={handleChange}
            />
            <Input 
              name="password"
              type="password"
              label="Password" 
              placeholder="Enter password" 
              value={formData.password}
              onChange={handleChange}
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-4" icon={isRegistering ? Building2 : Lock}>
              {isRegistering ? 'Create Master Account' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
