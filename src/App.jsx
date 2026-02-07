import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, deleteDoc, query, where, orderBy 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, Users, History, Plus, 
  Search, AlertCircle, CheckCircle2, Download, Trash2, Menu, X, 
  Banknote, Smartphone, Wifi, Globe, Calculator, AlertTriangle, 
  Clock, LogOut, RefreshCw, Scale, FileSpreadsheet, Upload, 
  MessageCircle, User, Lock, Building2, ChevronRight, UserCog,
  ShieldCheck, Calendar
} from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'gambia-float-tracker-default';

let db, auth;
let IS_DEMO_MODE = false;

try {
  if (firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY" || !firebaseConfig.apiKey) {
    throw new Error("Using Demo Mode");
  }
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.log("Switching to Local Storage Demo Mode.");
  IS_DEMO_MODE = true;
}

// --- CONSTANTS ---

const PROVIDERS = [
  { id: 'cash', label: 'Physical Cash', icon: Banknote, colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'wave', label: 'Wave', icon: Smartphone, colorClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'orange', label: 'Orange Money', icon: Smartphone, colorClass: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'aps', label: 'APS Transfer', icon: Globe, colorClass: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'wu', label: 'Western Union', icon: Globe, colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
];

// --- DATA SERVICE (Hybrid) ---

const DataService = {
  useCollection: (collectionName, rootId, filterField = 'masterId') => {
    const [data, setData] = useState([]);
    useEffect(() => {
      if (!rootId) return;
      if (IS_DEMO_MODE) {
        const key = `float_${collectionName}_${rootId}`;
        const load = () => JSON.parse(localStorage.getItem(key) || '[]');
        setData(load());
        const interval = setInterval(() => {
           const current = load();
           if (JSON.stringify(current) !== JSON.stringify(data)) setData(current);
        }, 1000);
        return () => clearInterval(interval);
      } else {
        // Ensure auth is ready before query? 
        // Component logic handles auth wait, but we add error logging.
        const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', collectionName), where(filterField, "==", rootId));
        return onSnapshot(q, 
          (snap) => setData(snap.docs.map(d => ({ uid: d.id, ...d.data() }))),
          (err) => console.error(`Error fetching ${collectionName}:`, err)
        );
      }
    }, [rootId, collectionName, filterField, data]);
    return data;
  },

  add: async (collectionName, item, rootId) => {
    if (IS_DEMO_MODE) {
      const key = `float_${collectionName}_${rootId}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const newItem = { ...item, uid: Date.now().toString() };
      localStorage.setItem(key, JSON.stringify([...current, newItem]));
      return newItem;
    } else {
      return addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', collectionName), item);
    }
  },

  delete: async (collectionName, id, rootId) => {
    if (IS_DEMO_MODE) {
      const key = `float_${collectionName}_${rootId}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = current.filter(item => item.uid !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
    } else {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', collectionName, id));
    }
  }
};

// --- UI COMPONENTS ---

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

const Input = ({ label, value, onChange, type = "text", placeholder, name }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
    />
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
  return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${colors[color]}`}>{children}</span>;
};

// --- VIEWS ---

const DashboardView = ({ stats, formatCurrency, selectedDate }) => (
  <div className="space-y-6 pb-20">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-blue-100 text-sm font-medium mb-1">Total Issued ({selectedDate})</p><h2 className="text-3xl font-bold">{formatCurrency(stats.issuedToday)}</h2></div>
            <div className="p-2 bg-white/20 rounded-lg"><ArrowUpCircle className="w-6 h-6 text-white" /></div>
          </div>
        </div>
      </Card>
      <Card className="bg-white">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-slate-500 text-sm font-medium mb-1">Repaid ({selectedDate})</p><h2 className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.returnedToday)}</h2></div>
            <div className="p-2 bg-emerald-100 rounded-lg"><ArrowDownCircle className="w-6 h-6 text-emerald-600" /></div>
          </div>
           <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${stats.issuedToday > 0 ? (stats.returnedToday / stats.issuedToday) * 100 : 0}%` }}></div>
          </div>
        </div>
      </Card>
      <Card className="bg-slate-900 text-white border-none">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-slate-300 text-sm font-medium mb-1">Closing Balance</p><h2 className={`text-3xl font-bold ${stats.totalOutstanding > 0 ? 'text-amber-400' : 'text-white'}`}>{formatCurrency(stats.totalOutstanding)}</h2></div>
            <div className="p-2 bg-slate-800 rounded-lg"><Wallet className="w-6 h-6 text-amber-400" /></div>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

const AgentsView = ({ agents, agentBalances, openModal, fileInputRef, handleFileUpload, downloadTemplate, formatCurrency, selectedDate }) => (
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
        const bal = agentBalances[agent.uid] || { issuedToday: 0, returnedToday: 0, prevDebt: 0, totalDue: 0 };
        const isToday = selectedDate === new Date().toISOString().split('T')[0];
        return (
          <Card key={agent.uid} className="p-4 relative group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">{agent.name.charAt(0)}</div>
              <div><h3 className="font-bold text-slate-800">{agent.name}</h3><p className="text-sm text-slate-500">{agent.location}</p></div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-3 gap-2 text-xs border border-slate-100 mb-4">
                <div className="text-slate-500"><span className="block opacity-70 mb-0.5">Opening</span><span className={`font-semibold ${bal.prevDebt > 0 ? 'text-red-600' : 'text-slate-700'}`}>{formatCurrency(bal.prevDebt)}</span></div>
                 <div className="text-slate-500 text-center border-l border-slate-200"><span className="block opacity-70 mb-0.5">Net Daily</span><span className="font-semibold text-blue-600">{bal.issuedToday - bal.returnedToday >= 0 ? '+' : ''}{formatCurrency(bal.issuedToday - bal.returnedToday)}</span></div>
                 <div className="text-slate-500 text-right border-l border-slate-200"><span className="block opacity-70 mb-0.5">Closing</span><span className={`font-bold ${bal.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(bal.totalDue)}</span></div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                 {isToday ? (
                   <>
                     <Button variant="primary" className="py-1.5 px-3 text-xs" onClick={() => openModal('issue', agent.uid)}>Issue</Button>
                     <Button variant="success" className="py-1.5 px-3 text-xs" onClick={() => openModal('return', agent.uid)}>Return</Button>
                   </>
                 ) : (
                   <span className="text-xs text-slate-400 italic py-2">Viewing History</span>
                 )}
            </div>
          </Card>
        );
      })}
    </div>
  </div>
);

const OperatorsView = ({ newOpName, setNewOpName, newOpPass, setNewOpPass, handleAddOperator, operators, handleDeleteOperator }) => (
  <div className="space-y-6 pb-20">
    <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Manage Operators</h2></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4"><div className="bg-blue-100 p-2 rounded-full text-blue-600"><UserCog className="w-6 h-6" /></div><div><h3 className="text-lg font-bold text-slate-800">Create Operator</h3><p className="text-xs text-slate-500">Add staff to help manage float</p></div></div>
        <div className="space-y-3">
          <Input label="Username" value={newOpName} onChange={e => setNewOpName(e.target.value)} placeholder="e.g. fatou_staff" />
          <Input label="Password" type="password" value={newOpPass} onChange={e => setNewOpPass(e.target.value)} placeholder="Secret123" />
          <Button onClick={handleAddOperator} className="w-full">Create Operator</Button>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Existing Operators</h3>
        {operators.length === 0 ? <p className="text-slate-500 italic text-sm">No operators created yet.</p> : (
          <div className="space-y-3">
            {operators.map(op => (
              <div key={op.uid} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">{op.username.charAt(0).toUpperCase()}</div>
                  <div><p className="font-semibold text-sm text-slate-800">{op.username}</p><p className="text-xs text-slate-400">Staff Access</p></div>
                </div>
                <button onClick={() => handleDeleteOperator(op.uid)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  </div>
);

const ReportView = ({ agents, agentBalances, todaysTransactions, formatCurrency, selectedDate, PROVIDERS }) => (
  <div className="space-y-6 pb-20">
    <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Reconciliation: {selectedDate}</h2><Button variant="outline" icon={Download} onClick={() => window.print()}>Print / PDF</Button></div>
    <Card className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
          <tr><th className="px-6 py-3">Agent</th><th className="px-6 py-3 text-right text-red-600">Opening</th><th className="px-6 py-3 text-right">Issued</th><th className="px-6 py-3 text-right text-emerald-600">Repaid</th><th className="px-6 py-3 text-right font-bold">Closing</th><th className="px-6 py-3 text-center">Status</th></tr>
        </thead>
        <tbody>
          {agents.map(agent => {
             const bal = agentBalances[agent.uid] || { issuedToday: 0, returnedToday: 0, prevDebt: 0, totalDue: 0 };
             return (
               <tr key={agent.uid} className="bg-white border-b hover:bg-slate-50">
                 <td className="px-6 py-4 font-medium text-slate-900">{agent.name}</td>
                 <td className="px-6 py-4 text-right text-red-500">{formatCurrency(bal.prevDebt)}</td>
                 <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(bal.issuedToday)}</td>
                 <td className="px-6 py-4 text-right text-emerald-600 font-bold">{formatCurrency(bal.returnedToday)}</td>
                 <td className={`px-6 py-4 text-right font-bold ${bal.totalDue > 0 ? 'text-red-700' : 'text-slate-400'}`}>{formatCurrency(bal.totalDue)}</td>
                 <td className="px-6 py-4 text-center">{bal.totalDue === 0 ? <Badge color="green">Cleared</Badge> : <Badge color="red">Owing</Badge>}</td>
               </tr>
             )
          })}
        </tbody>
      </table>
    </Card>
    <h3 className="text-lg font-bold text-slate-800 mt-8">Transactions ({selectedDate})</h3>
    <div className="space-y-2">
      {todaysTransactions.length === 0 && <p className="text-slate-500 italic">No transactions found.</p>}
      {todaysTransactions.slice().reverse().map(t => (
          <div key={t.id || t.uid} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 text-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${t.type === 'issue' ? 'bg-blue-100 text-blue-600' : t.category === 'checkout' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {t.type === 'issue' ? <ArrowUpCircle className="w-4 h-4"/> : t.category === 'checkout' ? <LogOut className="w-4 h-4"/> : <RefreshCw className="w-4 h-4"/>}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-700">{agents.find(a => a.uid === t.agentId)?.name || 'Unknown'}</p>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${PROVIDERS.find(p => p.id === t.method)?.colorClass || 'border-slate-200'}`}>
                    {PROVIDERS.find(p => p.id === t.method)?.label || t.method}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span><span>•</span><span className="flex items-center gap-1"><User className="w-3 h-3" /> {t.performedBy || 'Unknown'}</span>{t.note && <span>• {t.note}</span>}
                </div>
              </div>
            </div>
            <span className={`font-bold ${t.type === 'issue' ? 'text-slate-700' : 'text-emerald-600'}`}>{t.type === 'issue' ? '-' : '+'}{formatCurrency(t.amount)}</span>
          </div>
      ))}
    </div>
  </div>
);

// --- AUTH & MAIN ---

const AuthScreen = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', businessName: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) { setError('Please fill in all fields'); return; }
    
    // Simulate Login/Reg logic compatible with Hybrid Mode
    if (IS_DEMO_MODE) {
        const users = JSON.parse(localStorage.getItem('float_app_users') || '[]');
        if (isRegistering) {
            if (users.find(u => u.username === formData.username)) { setError('Username taken'); return; }
            const newUser = { uid: Date.now().toString(), username: formData.username, password: formData.password, businessName: formData.businessName, role: 'master', createdAt: new Date().toISOString() };
            localStorage.setItem('float_app_users', JSON.stringify([...users, newUser]));
            onLogin(newUser);
        } else {
            const user = users.find(u => u.username === formData.username && u.password === formData.password);
            if (user) onLogin(user); else setError('Invalid credentials');
        }
    } else {
        // In real cloud mode, perform firestore query to find user
        // We use a simple snapshot fetch for this demo structure
        try {
            const usersRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'app_users');
            // Simplified query logic for single file app - fetching all to filter in memory (Rule compliant for complex queries, but this is simple)
            // Ideally use query(usersRef, where('username', '==', formData.username))
            const q = query(usersRef, where('username', '==', formData.username));
            
            // We use a one-time get (via snapshot listener to be consistent with data service pattern or addDoc pattern)
            // But since we can't easily await a snapshot, we'll implement a helper
            const loginPromise = new Promise((resolve, reject) => {
               const unsub = onSnapshot(q, (snap) => {
                   unsub();
                   resolve(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
               }, reject);
            });
            
            const users = await loginPromise;
            
            if (isRegistering) {
                if (users.length > 0) { setError('Username taken'); return; }
                const newUser = { username: formData.username, password: formData.password, businessName: formData.businessName, role: 'master', createdAt: new Date().toISOString() };
                const ref = await addDoc(usersRef, newUser);
                onLogin({ uid: ref.id, ...newUser });
            } else {
                const user = users.find(u => u.password === formData.password);
                if (user) onLogin(user); else setError('Invalid credentials');
            }
        } catch (e) {
            console.error("Auth Error", e);
            setError("Login failed. Check console.");
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-900 p-8 text-center">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg"><Banknote className="w-8 h-8 text-blue-200" /></div>
          <h1 className="text-2xl font-bold text-white mb-1">Float Manager</h1>
          <p className="text-blue-200 text-sm">Master Agent Control Center</p>
        </div>
        <div className="p-8">
          <div className="flex gap-4 mb-6 bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setIsRegistering(false)} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Login</button>
            <button onClick={() => setIsRegistering(true)} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isRegistering ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Register Business</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && <Input name="businessName" label="Business Name" placeholder="e.g. Ali's Shop" value={formData.businessName} onChange={handleChange} />}
            <Input name="username" label="Username" placeholder="Enter username" value={formData.username} onChange={handleChange} />
            <Input name="password" type="password" label="Password" placeholder="Enter password" value={formData.password} onChange={handleChange} />
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
            <Button type="submit" className="w-full mt-4" icon={isRegistering ? Building2 : Lock}>{isRegistering ? 'Create Account' : 'Login'}</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout, dbUser }) => {
  const isMaster = dbUser.role === 'master';
  const rootId = isMaster ? (dbUser.uid || dbUser.id) : dbUser.masterId;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Data
  const agents = DataService.useCollection('agents', rootId, 'masterId');
  const transactions = DataService.useCollection('transactions', rootId, 'masterId');
  const operators = DataService.useCollection('app_users', rootId, 'masterId');

  // UI State
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
  const [newOpName, setNewOpName] = useState('');
  const [newOpPass, setNewOpPass] = useState('');
  const fileInputRef = useRef(null);

  // --- Calculations ---
  const todaysTransactions = useMemo(() => transactions.filter(t => t.date === selectedDate), [transactions, selectedDate]);

  const agentBalances = useMemo(() => {
    const balances = {};
    agents.forEach(a => { balances[a.uid] = { prevDebt: 0, issuedToday: 0, returnedToday: 0, totalDue: 0 }; });
    transactions.forEach(t => {
      const agent = balances[t.agentId];
      if (!agent) return;
      if (t.date === selectedDate) {
        if (t.type === 'issue') agent.issuedToday += t.amount;
        if (t.type === 'return') agent.returnedToday += t.amount;
      } else if (t.date < selectedDate) {
        if (t.type === 'issue') agent.prevDebt += t.amount;
        if (t.type === 'return') agent.prevDebt -= t.amount;
      }
    });
    Object.values(balances).forEach(b => {
      b.prevDebt = Math.round(b.prevDebt * 100) / 100;
      b.totalDue = b.prevDebt + b.issuedToday - b.returnedToday;
    });
    return balances;
  }, [transactions, agents, selectedDate]);

  const stats = useMemo(() => {
    let issuedToday = 0, returnedToday = 0, totalOutstanding = 0;
    Object.values(agentBalances).forEach(b => { issuedToday += b.issuedToday; returnedToday += b.returnedToday; totalOutstanding += b.totalDue; });
    return { issuedToday, returnedToday, totalOutstanding };
  }, [agentBalances]);

  // --- Helpers ---
  const formatCurrency = (val) => new Intl.NumberFormat('en-GM', { style: 'currency', currency: 'GMD' }).format(val).replace('GMD', 'D');

  const handleTransaction = async () => {
    if (!amount || !selectedAgent) return;
    const parsedAmount = parseFloat(amount);
    const newTx = {
      agentId: selectedAgent, masterId: rootId, type: modalType, category: modalType === 'return' ? returnCategory : 'issue',
      amount: parsedAmount, method: method, date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString(), note, performedBy: dbUser.username
    };
    await DataService.add('transactions', newTx, rootId);
    if (sendWhatsapp) {
        const agent = agents.find(a => a.uid === selectedAgent);
        if (agent && agent.phone) {
            let phone = agent.phone.replace(/\D/g, ''); if (phone.length === 7) phone = '220' + phone;
            const msg = `*FLOAT ${modalType === 'issue' ? 'ISSUED' : 'RECEIVED'}* 💸\nAgent: ${agent.name}\nAmount: ${formatCurrency(parsedAmount)}\nDate: ${new Date().toLocaleDateString()}\nBy: ${dbUser.username}`;
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
        }
    }
    closeModal();
  };

  const handleAddAgent = async () => {
    if (!selectedAgent || !amount) return; 
    await DataService.add('agents', { name: selectedAgent, location: amount, phone: note, masterId: rootId, createdAt: new Date().toISOString() }, rootId);
    closeModal();
  };

  const handleAddOperator = async () => {
    if (!newOpName || !newOpPass) return;
    await DataService.add('app_users', { username: newOpName, password: newOpPass, businessName: dbUser.businessName, role: 'operator', masterId: rootId, createdAt: new Date().toISOString() }, rootId);
    setNewOpName(''); setNewOpPass(''); alert('Operator created!');
  };

  const handleDeleteOperator = async (id) => {
    if(confirm('Remove operator?')) await DataService.delete('app_users', id, rootId);
  };

  const openModal = (type, agentId = '') => { setModalType(type); setSelectedAgent(agentId); setAmount(''); setMethod('cash'); setNote(''); setConfirmed(false); setReturnCategory('payment'); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedAgent(''); setAmount(''); setNote(''); setConfirmed(false); };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result; const lines = text.split('\n'); const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
      for(let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim(); if(!line) continue; const parts = line.split(',');
        if(parts.length >= 1 && parts[0]?.trim()) {
             await DataService.add('agents', { name: parts[0].trim(), location: parts[1]?.trim() || 'General', phone: parts[2]?.trim() || '', masterId: rootId, createdAt: new Date().toISOString() }, rootId);
        }
      }
      alert('Import complete');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-blue-900 text-white p-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-2 rounded-lg"><Banknote className="w-6 h-6 text-blue-200" /></div>
            <div><h1 className="font-bold text-lg leading-tight">{dbUser.businessName}</h1><div className="flex items-center gap-1 text-xs text-blue-300"><User className="w-3 h-3" /> {isMaster ? 'Master Agent' : 'Operator'} ({dbUser.username})</div></div>
          </div>
          <div className="flex items-center gap-4"><button onClick={onLogout} className="hidden md:flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-medium"><LogOut className="w-4 h-4" /> Logout</button><button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-blue-800 rounded"><Menu className="w-6 h-6" /></button></div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto p-4 md:flex md:gap-6 mt-4">
        <aside className={`fixed inset-y-0 left-0 bg-white w-64 shadow-2xl transform transition-transform duration-200 ease-in-out z-40 md:relative md:transform-none md:shadow-none md:bg-transparent md:w-48 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 md:hidden flex justify-end"><button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6 text-slate-400" /></button></div>
          <div className="space-y-2">
            {[{ id: 'dashboard', label: 'Dashboard', icon: Wallet }, { id: 'reports', label: 'Reports', icon: History }, { id: 'agents', label: 'Agents', icon: Users }, ...(isMaster ? [{ id: 'operators', label: 'Operators', icon: UserCog }] : [])].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === item.id ? 'bg-white text-blue-700 shadow-sm border border-slate-100 md:shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} /> {item.label}</button>
            ))}
          </div>
          <div className="mt-8 mx-2 md:mx-0">
             <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 mb-4"><label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Viewing Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full text-sm p-1 bg-white border rounded" /></div>
             <div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><Button variant="primary" className="w-full text-sm py-2" onClick={() => { setSidebarOpen(false); openModal('issue'); }}>Issue Float</Button></div>
          </div>
        </aside>
        <main className="flex-1">
          {activeTab === 'dashboard' && <DashboardView stats={stats} formatCurrency={formatCurrency} selectedDate={selectedDate} />}
          {activeTab === 'reports' && <ReportView agents={agents} agentBalances={agentBalances} todaysTransactions={todaysTransactions} formatCurrency={formatCurrency} today={selectedDate} PROVIDERS={PROVIDERS} />}
          {activeTab === 'agents' && <AgentsView agents={agents} agentBalances={agentBalances} openModal={openModal} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} downloadTemplate={downloadTemplate} formatCurrency={formatCurrency} selectedDate={selectedDate} />}
          {activeTab === 'operators' && isMaster && <OperatorsView newOpName={newOpName} setNewOpName={setNewOpName} newOpPass={newOpPass} setNewOpPass={setNewOpPass} handleAddOperator={handleAddOperator} operators={operators} handleDeleteOperator={handleDeleteOperator} />}
        </main>
      </div>
      {/* Modal Reused Logic */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">{modalType === 'add_agent' ? 'Add Agent' : modalType === 'issue' ? 'Issue Float' : 'Return Funds'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
               {modalType === 'add_agent' ? (
                 <>
                   <Input label="Name" value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} />
                   <Input label="Location" value={amount} onChange={e => setAmount(e.target.value)} />
                   <Input label="Phone" value={note} onChange={e => setNote(e.target.value)} />
                   <Button onClick={handleAddAgent}>Save Agent</Button>
                 </>
               ) : (
                 <>
                   {!selectedAgent && (
                     <div className="mb-4"><label className="block text-sm font-semibold mb-1">Select Agent</label><select className="w-full p-3 border rounded-lg bg-white" onChange={e => setSelectedAgent(e.target.value)}><option value="">Select...</option>{agents.map(a => <option key={a.uid} value={a.uid}>{a.name}</option>)}</select></div>
                   )}
                   <Input label="Amount (GMD)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                   <div className="mb-4 grid grid-cols-2 gap-2">{PROVIDERS.map(p => (<button key={p.id} onClick={() => setMethod(p.id)} className={`flex items-center gap-2 p-2 border rounded ${method === p.id ? 'bg-blue-50 border-blue-500' : ''}`}><p.icon className="w-4 h-4"/> {p.label}</button>))}</div>
                   <Input label="Notes" value={note} onChange={e => setNote(e.target.value)} />
                   {!selectedAgent && modalType === 'return' && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button onClick={() => setReturnCategory('payment')} className={`p-3 rounded border ${returnCategory === 'payment' ? 'bg-blue-50 border-blue-500' : ''}`}>Pay Back Loan</button>
                            <button onClick={() => setReturnCategory('checkout')} className={`p-3 rounded border ${returnCategory === 'checkout' ? 'bg-purple-50 border-purple-500' : ''}`}>Return Float</button>
                        </div>
                   )}
                   <div onClick={() => setConfirmed(!confirmed)} className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 border rounded"><div className={`w-4 h-4 border rounded ${confirmed ? 'bg-blue-600' : 'bg-white'}`}></div><span className="text-sm">I confirm this transaction.</span></div>
                   <Button onClick={handleTransaction} disabled={!confirmed || !amount || !selectedAgent}>Confirm</Button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function FloatTrackerApp() {
  const [dbUser, setDbUser] = useState(() => { const saved = localStorage.getItem('float_current_session'); return saved ? JSON.parse(saved) : null; });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!IS_DEMO_MODE) {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = (u) => { localStorage.setItem('float_current_session', JSON.stringify(u)); setDbUser(u); };
  const handleLogout = () => { localStorage.removeItem('float_current_session'); setDbUser(null); };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!dbUser) return <AuthScreen onLogin={handleLogin} />;
  return <Dashboard user={null} dbUser={dbUser} onLogout={handleLogout} />;
}