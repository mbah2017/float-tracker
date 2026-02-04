import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Users, 
  History, 
  Plus, 
  Search,
  AlertCircle,
  CheckCircle2,
  Download,
  Trash2,
  Menu,
  X,
  Banknote,
  Smartphone,
  Wifi,
  Globe,
  Calculator,
  AlertTriangle,
  Clock,
  LogOut,
  RefreshCw,
  Scale,
  FileSpreadsheet,
  Upload,
  MessageCircle,
  User,
  Lock,
  Building2,
  ChevronRight,
  UserCog,
  ShieldCheck
} from 'lucide-react';

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled = false, type = "button" }) => {
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

const Input = ({ label, value, onChange, type = "text", placeholder, error, name }) => (
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

const Badge = ({ children, color = "blue" }) => {
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

// --- Constants ---

const PROVIDERS = [
  { id: 'cash', label: 'Physical Cash', icon: Banknote, colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'wave', label: 'Wave', icon: Smartphone, colorClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'orange', label: 'Orange Money', icon: Smartphone, colorClass: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'aps', label: 'APS Transfer', icon: Globe, colorClass: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'wu', label: 'Western Union', icon: Globe, colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
];

// --- Standalone Views (Fixed Focus Issues) ---

const DashboardView = ({ stats, formatCurrency }) => (
  <div className="space-y-6 pb-20">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Issued Today</p>
              <h2 className="text-3xl font-bold">{formatCurrency(stats.issuedToday)}</h2>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowUpCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-blue-200 mt-4 opacity-80">Today, {new Date().toLocaleDateString()}</p>
        </div>
      </Card>
      <Card className="bg-white">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Repaid Today</p>
              <h2 className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.returnedToday)}</h2>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ArrowDownCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
           <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${stats.issuedToday > 0 ? (stats.returnedToday / stats.issuedToday) * 100 : 0}%` }}></div>
          </div>
        </div>
      </Card>
      <Card className="bg-slate-900 text-white border-none">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">Total Team Debt</p>
              <h2 className={`text-3xl font-bold ${stats.totalOutstanding > 0 ? 'text-amber-400' : 'text-white'}`}>
                {formatCurrency(stats.totalOutstanding)}
              </h2>
            </div>
            <div className="p-2 bg-slate-800 rounded-lg">
              <Wallet className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {stats.totalOutstanding === 0 ? "Zero Leakage. All Clear! ✅" : "Includes previous days' shortages"}
          </p>
        </div>
      </Card>
    </div>
  </div>
);

const AgentsView = ({ agents, agentBalances, openModal, fileInputRef, handleFileUpload, downloadTemplate, formatCurrency }) => (
  <div className="space-y-6 pb-20">
     <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h2 className="text-2xl font-bold text-slate-800">My Agents</h2>
      <div className="flex gap-2">
          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button variant="secondary" onClick={downloadTemplate} icon={FileSpreadsheet} className="text-xs">Template</Button>
          <Button variant="outline" onClick={() => fileInputRef.current.click()} icon={Upload} className="text-xs">Import CSV</Button>
          <Button onClick={() => openModal('add_agent')} icon={Plus} className="text-xs">Add Agent</Button>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {agents.map(agent => {
        const bal = agentBalances[agent.id] || { issuedToday: 0, returnedToday: 0, prevDebt: 0, totalDue: 0 };
        const hasFloat = bal.totalDue > 0;
        const hasArrears = bal.prevDebt > 0;

        return (
          <Card key={agent.id} className="p-4 relative group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                {agent.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{agent.name}</h3>
                <p className="text-sm text-slate-500">{agent.location}</p>
                <p className="text-xs text-slate-400 mt-1">{agent.phone}</p>
              </div>
            </div>

            {/* Agent Stats Summary in Card */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
               <div>
                 <p className="text-xs text-slate-400 uppercase">Balance</p>
                 <p className={`font-bold ${bal.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(bal.totalDue)}</p>
               </div>
               <div className="flex gap-2">
                 {bal.totalDue === 0 ? (
                    <Button variant="primary" className="py-1.5 px-3 text-xs" onClick={() => openModal('issue', agent.id)}>Issue</Button>
                  ) : (
                    <Button variant="success" className="py-1.5 px-3 text-xs" onClick={() => openModal('return', agent.id)}>Return</Button>
                  )}
               </div>
            </div>
          </Card>
        );
      })}
      {agents.length === 0 && (
        <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">You haven't added any agents yet.</p>
          <button onClick={() => openModal('add_agent')} className="text-blue-600 font-bold text-sm mt-2 hover:underline">Add your first agent</button>
        </div>
      )}
    </div>
  </div>
);

const ReportView = ({ agents, agentBalances, todaysTransactions, formatCurrency, today, PROVIDERS }) => (
  <div className="space-y-6 pb-20">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-800">Daily Reconciliation</h2>
      <Button variant="outline" icon={Download} onClick={() => window.print()}>Print / PDF</Button>
    </div>

    <Card className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-3">Agent</th>
            <th className="px-6 py-3 text-right text-red-600">Prev. Debt</th>
            <th className="px-6 py-3 text-right">Issued Today</th>
            <th className="px-6 py-3 text-right text-emerald-600">Repaid Today</th>
            <th className="px-6 py-3 text-right font-bold">Total Outstanding</th>
            <th className="px-6 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(agent => {
             const bal = agentBalances[agent.id] || { issuedToday: 0, returnedToday: 0, prevDebt: 0, totalDue: 0 };
             return (
               <tr key={agent.id} className="bg-white border-b hover:bg-slate-50">
                 <td className="px-6 py-4 font-medium text-slate-900">{agent.name}</td>
                 <td className="px-6 py-4 text-right text-red-500">{formatCurrency(bal.prevDebt)}</td>
                 <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(bal.issuedToday)}</td>
                 <td className="px-6 py-4 text-right text-emerald-600 font-bold">{formatCurrency(bal.returnedToday)}</td>
                 <td className={`px-6 py-4 text-right font-bold ${bal.totalDue > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                   {formatCurrency(bal.totalDue)}
                 </td>
                 <td className="px-6 py-4 text-center">
                   {bal.totalDue === 0 ? <Badge color="green">Cleared</Badge> : <Badge color="red">Owing</Badge>}
                 </td>
               </tr>
             )
          })}
        </tbody>
      </table>
    </Card>

    <h3 className="text-lg font-bold text-slate-800 mt-8">Today's Transactions ({today})</h3>
    <div className="space-y-2">
      {todaysTransactions.length === 0 && <p className="text-slate-500 italic">No transactions recorded today.</p>}
      {todaysTransactions.slice().reverse().map(t => {
        const provider = PROVIDERS.find(p => p.id === t.method) || PROVIDERS[0];
        const ProviderIcon = provider.icon;
        const isCheckout = t.category === 'checkout';

        return (
          <div key={t.id} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 text-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${t.type === 'issue' ? 'bg-blue-100 text-blue-600' : t.category === 'checkout' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {t.type === 'issue' ? <ArrowUpCircle className="w-4 h-4"/> : isCheckout ? <LogOut className="w-4 h-4"/> : <RefreshCw className="w-4 h-4"/>}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-700">
                    {agents.find(a => a.id === t.agentId)?.name || 'Unknown'}
                  </p>
                  {t.type === 'return' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${isCheckout ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {isCheckout ? 'Float Return' : 'Loan Repayment'}
                      </span>
                  )}
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${provider.colorClass}`}>
                    <ProviderIcon className="w-3 h-3"/>
                    {provider.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {t.performedBy || 'Unknown'}</span>
                  {t.note && <span>• {t.note}</span>}
                </div>
              </div>
            </div>
            <span className={`font-bold ${t.type === 'issue' ? 'text-slate-700' : 'text-emerald-600'}`}>
              {t.type === 'issue' ? '-' : '+'}{formatCurrency(t.amount)}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const OperatorsView = ({ 
  newOpName, 
  setNewOpName, 
  newOpPass, 
  setNewOpPass, 
  handleAddOperator, 
  operators, 
  handleDeleteOperator 
}) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Manage Operators</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600"><UserCog className="w-6 h-6" /></div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Create Operator</h3>
                <p className="text-xs text-slate-500">Add staff to help manage float</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input label="Username" value={newOpName} onChange={e => setNewOpName(e.target.value)} placeholder="e.g. fatou_staff" />
            <Input label="Password" type="password" value={newOpPass} onChange={e => setNewOpPass(e.target.value)} placeholder="Secret123" />
            <Button onClick={handleAddOperator} className="w-full">Create Operator</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Existing Operators</h3>
          {operators.length === 0 ? (
            <p className="text-slate-500 italic text-sm">No operators created yet.</p>
          ) : (
            <div className="space-y-3">
              {operators.map(op => (
                <div key={op.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {op.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{op.username}</p>
                      <p className="text-xs text-slate-400">Staff Access</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteOperator(op.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// --- Auth Component ---

const AuthScreen = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', businessName: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('float_app_users') || '[]');

    if (isRegistering) {
      if (users.find(u => u.username === formData.username)) {
        setError('Username already exists');
        return;
      }
      const newUser = { 
        id: Date.now().toString(),
        username: formData.username, 
        password: formData.password, 
        businessName: formData.businessName || 'My Business',
        role: 'master' // Registration always creates a Master account
      };
      users.push(newUser);
      localStorage.setItem('float_app_users', JSON.stringify(users));
      onLogin(newUser);
    } else {
      const user = users.find(u => u.username === formData.username && u.password === formData.password);
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

// --- Dashboard Component (Internal) ---

const Dashboard = ({ user, onLogout }) => {
  // Determine whose data we are looking at. 
  // If Master: use own ID. If Operator: use masterId.
  const isMaster = user.role === 'master' || !user.role; // Default to master if undefined (legacy)
  const rootId = isMaster ? user.id : user.masterId;

  // --- State ---
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load data based on Root ID (Master's ID)
  const [agents, setAgents] = useState(() => {
    const saved = localStorage.getItem(`float_agents_${rootId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(`float_tx_${rootId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Operators state (only strictly needed for Master view, but simple to keep here)
  const [operators, setOperators] = useState(() => {
    if (!isMaster) return [];
    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    return allUsers.filter(u => u.masterId === user.id);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('issue'); 
  const [returnCategory, setReturnCategory] = useState('payment'); 
  const [selectedAgent, setSelectedAgent] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash'); 
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false); 
  const [sendWhatsapp, setSendWhatsapp] = useState(true); 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Operator Creation State
  const [newOpName, setNewOpName] = useState('');
  const [newOpPass, setNewOpPass] = useState('');

  const fileInputRef = useRef(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(`float_agents_${rootId}`, JSON.stringify(agents));
  }, [agents, rootId]);

  useEffect(() => {
    localStorage.setItem(`float_tx_${rootId}`, JSON.stringify(transactions));
  }, [transactions, rootId]);

  // --- Derived Data ---
  const today = new Date().toISOString().split('T')[0];

  const todaysTransactions = useMemo(() => {
    return transactions.filter(t => t.date === today);
  }, [transactions, today]);

  // Robust calculation for rolling balances
  const agentBalances = useMemo(() => {
    const balances = {};
    agents.forEach(a => {
      balances[a.id] = { prevDebt: 0, issuedToday: 0, returnedToday: 0, totalDue: 0 };
    });

    transactions.forEach(t => {
      const agent = balances[t.agentId];
      if (!agent) return;

      if (t.date === today) {
        if (t.type === 'issue') agent.issuedToday += t.amount;
        if (t.type === 'return') agent.returnedToday += t.amount;
      } else {
        if (t.type === 'issue') agent.prevDebt += t.amount;
        if (t.type === 'return') agent.prevDebt -= t.amount;
      }
    });

    Object.values(balances).forEach(b => {
      b.prevDebt = Math.round(b.prevDebt * 100) / 100;
      b.totalDue = b.prevDebt + b.issuedToday - b.returnedToday;
    });

    return balances;
  }, [transactions, agents, today]);

  const stats = useMemo(() => {
    let issuedToday = 0;
    let returnedToday = 0;
    let totalOutstanding = 0;

    Object.values(agentBalances).forEach(b => {
      issuedToday += b.issuedToday;
      returnedToday += b.returnedToday;
      totalOutstanding += b.totalDue;
    });

    return { issuedToday, returnedToday, totalOutstanding };
  }, [agentBalances]);

  // --- Utils ---
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-GM', { style: 'currency', currency: 'GMD' }).format(val).replace('GMD', 'D');
  };

  // --- Handlers ---
  const handleTransaction = () => {
    if (!amount || !selectedAgent) return;
    const parsedAmount = parseFloat(amount);

    const newTx = {
      id: Date.now(),
      agentId: Number(selectedAgent), 
      type: modalType,
      category: modalType === 'return' ? returnCategory : 'issue',
      amount: parsedAmount,
      method: method, 
      date: today,
      timestamp: new Date().toISOString(),
      note,
      performedBy: user.username // Audit trail: who did this?
    };

    if (sendWhatsapp) {
        const agent = agents.find(a => a.id === Number(selectedAgent)); 
        if (agent && agent.phone) {
            const currentStats = agentBalances[agent.id] || { totalDue: 0 };
            let newBalance = currentStats.totalDue;

            if (modalType === 'issue') {
                newBalance += parsedAmount;
            } else {
                newBalance -= parsedAmount;
            }

            let phone = agent.phone.replace(/\D/g, '');
            if (phone.length === 7) phone = '220' + phone;

            let message = '';
            const dateStr = new Date().toLocaleDateString();
            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const methodLabel = PROVIDERS.find(p => p.id === method)?.label || method;

            if (modalType === 'issue') {
                message = `*FLOAT ISSUANCE CONFIRMATION* 📤\n\nHello ${agent.name},\n\nYou have been issued a float loan of *${formatCurrency(parsedAmount)}* via ${methodLabel}.\n📅 ${dateStr} at ${timeStr}\n\n*Total Due: ${formatCurrency(newBalance)}*\n\nPlease confirm receipt. Repayment is due by 6:00 PM today.\n\nServed by: ${user.username}`;
            } else {
                const typeLabel = returnCategory === 'checkout' ? 'End-of-Day Checkout' : 'Loan Repayment';
                message = `*${typeLabel.toUpperCase()} CONFIRMATION* 📥\n\nHello ${agent.name},\n\nWe received *${formatCurrency(parsedAmount)}* via ${methodLabel}.\n📅 ${dateStr} at ${timeStr}\n\n*Remaining Balance: ${formatCurrency(newBalance)}*\n\n${newBalance <= 0.01 ? '✅ All Clear' : '⚠️ Outstanding Balance'}\n\nServed by: ${user.username}`;
            }

            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    }

    setTransactions([newTx, ...transactions]);
    closeModal();
  };

  const handleAddAgent = () => {
    if (!selectedAgent || !amount) return; 
    const newAgent = {
      id: Date.now(),
      name: selectedAgent,
      location: amount,
      phone: note
    };
    setAgents([...agents, newAgent]);
    closeModal();
  };

  // --- Operator Management Handlers ---
  const handleAddOperator = () => {
    if (!newOpName || !newOpPass) return;
    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');

    if (allUsers.find(u => u.username === newOpName)) {
      alert('Username already taken');
      return;
    }

    const newOp = {
      id: Date.now().toString(),
      username: newOpName,
      password: newOpPass,
      businessName: user.businessName, // Inherit business name
      role: 'operator',
      masterId: user.id
    };

    const updatedUsers = [...allUsers, newOp];
    localStorage.setItem('float_app_users', JSON.stringify(updatedUsers));

    // Update local state
    setOperators(updatedUsers.filter(u => u.masterId === user.id));
    setNewOpName('');
    setNewOpPass('');
    alert('Operator added successfully!');
  };

  const handleDeleteOperator = (opId) => {
    if(!confirm('Are you sure you want to remove this operator? They will no longer be able to log in.')) return;

    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    const updatedUsers = allUsers.filter(u => u.id !== opId);
    localStorage.setItem('float_app_users', JSON.stringify(updatedUsers));

    setOperators(updatedUsers.filter(u => u.masterId === user.id));
  };

  const openModal = (type, agentId = '') => {
    setModalType(type);
    setSelectedAgent(agentId);
    setAmount('');
    setMethod('cash');
    setNote('');
    setConfirmed(false);
    setReturnCategory('payment'); 
    setSendWhatsapp(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAgent('');
    setAmount('');
    setNote('');
    setConfirmed(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const newAgents = [];
      const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;

      for(let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        const parts = line.split(',');
        if(parts.length >= 1) {
          const name = parts[0]?.trim();
          if (name) {
            newAgents.push({
              id: Date.now() + i, 
              name: name,
              location: parts[1]?.trim() || 'General',
              phone: parts[2]?.trim() || ''
            });
          }
        }
      }
      if(newAgents.length > 0) {
        setAgents(prev => [...prev, ...newAgents]);
        alert(`Successfully imported ${newAgents.length} agents.`);
      } else {
        alert("No valid agents found in file. Please check the format.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Full Name,Location,Phone Number\nModou Lamin,Serrekunda Market,3344556\nFatou Jallow,Bakau,7766554";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agent_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderModal = () => {
    if (!isModalOpen) return null;
    const isAddAgent = modalType === 'add_agent';
    const isIssue = modalType === 'issue';
    const activeAgentName = agents.find(a => a.id === Number(selectedAgent))?.name;
    const agentStats = selectedAgent ? agentBalances[selectedAgent] : { prevDebt: 0, issuedToday: 0, returnedToday: 0, totalDue: 0 };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-slate-800">
              {isAddAgent ? 'Add New Sub-Agent' : isIssue ? 'Issue Float' : 'Return Funds'}
            </h3>
            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="w-5 h-5"/></button>
          </div>
          <div className="p-6 space-y-4">
            {isAddAgent ? (
              <>
                <Input label="Full Name" value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} placeholder="e.g. Modou Sowe" />
                <Input label="Location" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. Westfield Junction" />
                <Input label="Phone Number" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. 7700000" />
              </>
            ) : (
              <>
                {!isIssue && (
                  <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2 border border-slate-100">
                    <div className="flex justify-between items-center">
                       <p className="font-bold text-lg text-slate-800">{activeAgentName}</p>
                       <Badge color={agentStats.totalDue > 0 ? 'red' : 'green'}>{agentStats.totalDue > 0 ? 'Owing' : 'Cleared'}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-200 pt-3">
                      <div><span className="block text-slate-500 mb-1">Prev. Debt</span><span className="font-semibold text-red-600">{formatCurrency(agentStats.prevDebt)}</span></div>
                      <div className="text-center border-l border-slate-200"><span className="block text-slate-500 mb-1">Today's Float</span><span className="font-semibold text-slate-800">{formatCurrency(agentStats.issuedToday)}</span></div>
                       <div className="text-right border-l border-slate-200 pl-2"><span className="block text-slate-500 mb-1">Total Due</span><span className="font-bold text-red-600 text-sm">{formatCurrency(agentStats.totalDue)}</span></div>
                    </div>
                  </div>
                )}

                {!isIssue && !isAddAgent && (
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setReturnCategory('payment')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${returnCategory === 'payment' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><RefreshCw className="w-6 h-6 mb-1"/><span className="font-bold text-sm">Pay Back Loan</span><span className="text-[10px] opacity-75">Partial or full repayment</span></button>
                            <button onClick={() => setReturnCategory('checkout')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${returnCategory === 'checkout' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><LogOut className="w-6 h-6 mb-1"/><span className="font-bold text-sm">Return Float</span><span className="text-[10px] opacity-75">End of day closing</span></button>
                        </div>
                    </div>
                )}

                {isIssue && (
                  <div className="bg-slate-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-slate-500 mb-1">Agent</p>
                    <p className="font-bold text-lg text-slate-800">{activeAgentName}</p>
                    {agentStats.prevDebt > 0 && (
                        <div className="mt-2 flex items-center text-xs text-red-600 bg-red-50 p-2 rounded">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Warning: Agent has arrears of {formatCurrency(agentStats.prevDebt)}
                        </div>
                    )}
                  </div>
                )}

                {!selectedAgent && (
                   <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Select Agent</label>
                    <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setSelectedAgent(e.target.value)}>
                      <option value="">Select...</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                   </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{isIssue ? 'Source of Funds' : 'Repayment Via'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROVIDERS.map(p => {
                       const Icon = p.icon;
                       const isSelected = method === p.id;
                       return (
                        <button key={p.id} onClick={() => setMethod(p.id)} className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all text-left ${isSelected ? `ring-2 ring-offset-1 ring-blue-500 ${p.colorClass}` : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          <Icon className="w-4 h-4 shrink-0" /><span className="truncate">{p.label}</span>
                        </button>
                       )
                    })}
                  </div>
                </div>

                <Input label="Amount (GMD)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />

                {!isIssue && agentStats.totalDue > 0 && amount && (
                   <div className={`p-3 rounded text-sm mb-4 flex items-start gap-2 ${parseFloat(amount) < agentStats.totalDue ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-700'}`}>
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div><span className="font-bold">{parseFloat(amount) < agentStats.totalDue ? 'Partial Payment:' : 'Full Clearance:'}</span><p>{parseFloat(amount) < agentStats.totalDue ? `Remaining debt: ${formatCurrency(agentStats.totalDue - amount)}` : 'This payment clears all outstanding debts.'}</p></div>
                   </div>
                )}

                <Input label="Notes (Optional)" value={note} onChange={e => setNote(e.target.value)} placeholder={isIssue ? "e.g. Morning Float" : "e.g. Closing Balance"} />

                {!isAddAgent && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg mb-2">
                        <div className="flex items-center gap-2 text-green-800"><MessageCircle className="w-4 h-4" /><span className="text-sm font-medium">Send WhatsApp Confirmation</span></div>
                        <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${sendWhatsapp ? 'bg-green-500' : 'bg-slate-300'}`} onClick={() => setSendWhatsapp(!sendWhatsapp)}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${sendWhatsapp ? 'translate-x-4' : 'translate-x-0'}`} /></div>
                    </div>
                )}

                {isIssue && amount > 0 && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-800"><Scale className="w-4 h-4" /> Legal Agreement</div>
                    <p className="mb-2 italic">"I, <strong>{activeAgentName}</strong>, acknowledge receipt of <strong>{formatCurrency(amount)}</strong> on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} as a float loan from the Master Agent."</p>
                    <p className="font-semibold text-slate-800">"I agree to repay this full amount to the Master Agent by the end of today, before closing at 6:00 PM."</p>
                  </div>
                )}

                {!isAddAgent && (
                   <div className={`flex items-start gap-3 mt-4 p-3 border rounded-lg text-sm transition-colors hover:bg-opacity-50 cursor-pointer ${isIssue ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-purple-50 border-purple-100 text-purple-800'}`} onClick={() => setConfirmed(!confirmed)}>
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${confirmed ? (isIssue ? 'bg-blue-600 border-blue-600' : 'bg-purple-600 border-purple-600') + ' text-white' : 'bg-white border-slate-300'}`}>{confirmed && <CheckCircle2 className="w-3.5 h-3.5" />}</div>
                        <label className="font-medium select-none cursor-pointer">{isIssue ? "I confirm the agent has agreed to these terms." : (returnCategory === 'checkout' ? "I confirm the final closing balance has been verified." : "I confirm receipt of these funds.")}</label>
                   </div>
                )}
              </>
            )}
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant={isIssue || isAddAgent ? 'primary' : 'success'} onClick={isAddAgent ? handleAddAgent : handleTransaction} disabled={!amount || (!isAddAgent && !confirmed)}>{isAddAgent ? 'Save Agent' : isIssue ? 'Confirm Issue' : 'Confirm Return'}</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-blue-900 text-white p-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-2 rounded-lg"><Banknote className="w-6 h-6 text-blue-200" /></div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{user.businessName}</h1>
              <div className="flex items-center gap-1 text-xs text-blue-300">
                <User className="w-3 h-3" />
                {user.role === 'master' ? 'Master Agent' : 'Operator'} ({user.username})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onLogout} className="hidden md:flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-medium">
               <LogOut className="w-4 h-4" /> Logout
             </button>
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-blue-800 rounded"><Menu className="w-6 h-6" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:flex md:gap-6 mt-4">
        <aside className={`fixed inset-y-0 left-0 bg-white w-64 shadow-2xl transform transition-transform duration-200 ease-in-out z-40 md:relative md:transform-none md:shadow-none md:bg-transparent md:w-48 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 md:hidden flex justify-end"><button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6 text-slate-400" /></button></div>
          <div className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Wallet },
              { id: 'reports', label: 'Reports', icon: History },
              { id: 'agents', label: 'Manage Agents', icon: Users },
              ...(isMaster ? [{ id: 'operators', label: 'Operators', icon: UserCog }] : []),
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === item.id ? 'bg-white text-blue-700 shadow-sm border border-slate-100 md:shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} /> {item.label}
              </button>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 mx-2 md:mx-0">
            <h4 className="font-bold text-blue-800 text-sm mb-1">Quick Action</h4>
            <p className="text-xs text-blue-600 mb-3">Start the day by issuing float to your team.</p>
            <Button variant="primary" className="w-full text-sm py-2" onClick={() => { setSidebarOpen(false); openModal('issue'); }}>Issue Float</Button>
          </div>
          <div className="mt-auto p-4 md:hidden border-t border-slate-100">
             <button onClick={onLogout} className="flex items-center gap-2 text-red-600 font-medium w-full p-2 hover:bg-red-50 rounded-lg">
               <LogOut className="w-5 h-5" /> Logout
             </button>
          </div>
        </aside>

        <main className="flex-1">
          {activeTab === 'dashboard' && <DashboardView stats={stats} formatCurrency={formatCurrency} />}
          {activeTab === 'reports' && <ReportView agents={agents} agentBalances={agentBalances} todaysTransactions={todaysTransactions} formatCurrency={formatCurrency} today={today} PROVIDERS={PROVIDERS} />}
          {activeTab === 'agents' && <AgentsView agents={agents} agentBalances={agentBalances} openModal={openModal} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} downloadTemplate={downloadTemplate} formatCurrency={formatCurrency} />}
          {activeTab === 'operators' && isMaster && (
            <OperatorsView
              newOpName={newOpName}
              setNewOpName={setNewOpName}
              newOpPass={newOpPass}
              setNewOpPass={setNewOpPass}
              handleAddOperator={handleAddOperator}
              operators={operators}
              handleDeleteOperator={handleDeleteOperator}
            />
          )}
        </main>
      </div>
      {renderModal()}
    </div>
  );
};

// --- Root App Component ---

export default function FloatTrackerApp() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('float_current_session');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u) => {
    localStorage.setItem('float_current_session', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('float_current_session');
    setUser(null);
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
