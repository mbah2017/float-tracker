import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled = false, type = "button" }) => {
  const baseStyle = "flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-md shadow-green-100"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};

export const Input = ({ label, value, onChange, type = "text", placeholder, error, name }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-3 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'} outline-none transition-all`}
    />
    {error && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{error}</p>}
  </div>
);

export const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-amber-100 text-amber-800",
    slate: "bg-slate-100 text-slate-600",
    purple: "bg-purple-100 text-purple-700"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};
