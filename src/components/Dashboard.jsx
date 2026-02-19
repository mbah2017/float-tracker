import React, { useState, useRef, useEffect } from 'react';
import { 
  Wallet, 
  History, 
  Users, 
  UserCog, 
  Banknote, 
  LogOut, 
  Menu, 
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  BookOpen,
  Globe as GlobeIcon,
  ShieldCheck,
  Eye,
  Settings
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Button, Badge, Input } from './common';
import { DashboardView, AgentsView, ReportView, OperatorsView, LiquidityView } from './DashboardViews';
import { TrainingManualView } from './TrainingManualView';
import { AdminDashboard } from './AdminDashboard';
import { AccountSettings } from './AccountSettings';
import { useFloatData } from '../hooks/useFloatData';
import { formatCurrency } from '../utils/formatters';
import { PROVIDERS } from '../constants';
import { hasPermission, PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions';
import { useLanguage } from '../context/LanguageContext';

const BusinessDashboard = ({ user, rootId, activeTab, setActiveTab, setSidebarOpen, onLogout, t, language, toggleLanguage, isOwner, viewingAsMasterName }) => {
  const {
    agents,
    todaysTransactions,
    reportTransactions,
    agentBalances,
    reportBalances,
    stats,
    reportDate,
    setReportDate,
    addAgent,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    currentLiquidity,
    activeBalance,
    updateLiquidity,
    settings,
    setSettings,
    closeDay,
    togglePassiveUnlockOverride,
    createAdjustment
  } = useFloatData(rootId);

  const isMaster = user.role === 'master' || !user.role;
  const canManageOperators = hasPermission(user, PERMISSIONS.MANAGE_OPERATORS);
  const canViewLiquidity = hasPermission(user, PERMISSIONS.VIEW_LIQUIDITY) || hasPermission(user, PERMISSIONS.MANAGE_LIQUIDITY);
  const canResetSystem = hasPermission(user, PERMISSIONS.RESET_SYSTEM);
  const canViewDashboard = hasPermission(user, PERMISSIONS.VIEW_DASHBOARD);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('issue');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  
  // Transaction Form State
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [returnCategory, setReturnCategory] = useState('payment');
  const [confirmed, setConfirmed] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  // Agent Form State
  const [agentName, setAgentName] = useState('');
  const [agentLocation, setAgentLocation] = useState('');
  const [agentPhone, setAgentPhone] = useState('');

  // Operator state
  const [operators, setOperators] = useState([]);
  const [newOpName, setNewOpName] = useState('');
  const [newOpPass, setNewOpPass] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(ROLE_PERMISSIONS.operator);
  const [editingOperatorId, setEditingOperatorId] = useState(null);

  const fileInputRef = useRef(null);

  // Sync Operators from Firestore
  useEffect(() => {
    if (canManageOperators || (isOwner && rootId !== user.id)) {
      const q = query(collection(db, 'users'), where('masterId', '==', rootId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setOperators(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [canManageOperators, isOwner, rootId, user.id]);

  const handleResetSystem = () => {
    if (!confirm('⚠️ CRITICAL WARNING: This will permanently delete ALL data. Are you absolutely sure?')) return;
    alert("Full wipe not implemented for security reasons.");
  };

  const openModal = (type, id = '') => {
    setModalType(type);
    setConfirmed(false);
    setSendWhatsapp(true);
    if (type === 'edit_transaction') {
      const tx = todaysTransactions.find(t => t.id === id);
      if (tx) {
        setEditingTransactionId(id);
        setSelectedAgentId(tx.agentId);
        setAmount(tx.amount.toString());
        setMethod(tx.method);
        setNote(tx.note || '');
        setReturnCategory(tx.category);
      }
    } else {
      setSelectedAgentId(id);
      setAmount('');
      setMethod('cash');
      setNote('');
      setReturnCategory('payment');
      setEditingTransactionId(null);
    }
    setAgentName('');
    setAgentLocation('');
    setAgentPhone('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleTransaction = async () => {
    if (!amount || !selectedAgentId || selectedAgentId === '') return;
    const parsedAmount = parseFloat(amount);
    if (modalType === 'edit_transaction' && editingTransactionId) {
      await updateTransaction(editingTransactionId, { amount: parsedAmount, method, note });
      closeModal();
      return;
    }
    const txData = { agentId: String(selectedAgentId), type: modalType, category: modalType === 'return' ? returnCategory : 'issue', amount: parsedAmount, method, note, performedBy: user.username };
    
    if (sendWhatsapp && modalType !== 'edit_transaction') {
      const agent = agents.find(a => String(a.id) === String(selectedAgentId));
      if (agent && agent.phone) {
        const currentStats = agentBalances[agent.id] || { totalDue: 0 };
        let newBalance = currentStats.totalDue;
        if (modalType === 'issue') newBalance += parsedAmount;
        else newBalance -= parsedAmount;
        let phone = agent.phone.replace(/\D/g, '');
        if (phone.length === 7) phone = '220' + phone;
        const dateStr = new Date().toLocaleDateString();
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const methodLabel = PROVIDERS.find(p => p.id === method)?.label || method;
        let message = modalType === 'issue' 
          ? `*FLOAT ISSUANCE CONFIRMATION* 📤\n\nHello ${agent.name},\n\nYou have been issued a float loan of *${formatCurrency(parsedAmount)}* via ${methodLabel}.\n📅 ${dateStr} at ${timeStr}\n\n*Total Due: ${formatCurrency(newBalance)}*\n\nPlease confirm receipt. Repayment is due by 6:00 PM today.\n\nServed by: ${user.username}`
          : `*${(returnCategory === 'checkout' ? 'End-of-Day Checkout' : 'Loan Repayment').toUpperCase()} CONFIRMATION* 📥\n\nHello ${agent.name},\n\nWe received *${formatCurrency(parsedAmount)}* via ${methodLabel}.\n📅 ${dateStr} at ${timeStr}\n\n*Remaining Balance: ${formatCurrency(newBalance)}*\n\n${newBalance <= 0.01 ? '✅ All Clear' : '⚠️ Outstanding Balance'}\n\nServed by: ${user.username}`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    }
    
    await addTransaction(txData);
    closeModal();
  };

  const handleAddAgent = async () => {
    if (!agentName) return;
    await addAgent(agentName, agentLocation, agentPhone);
    closeModal();
  };

  const handleAddOperator = async () => {
    alert("Operator creation must be done via Firebase Console or a dedicated admin function for security. Use 'Register' for now to create accounts.");
  };

  const handleUpdateOperator = async () => {
    if (!editingOperatorId) return;
    const docRef = doc(db, 'users', editingOperatorId);
    await setDoc(docRef, { permissions: selectedPermissions }, { merge: true });
    setEditingOperatorId(null);
    alert('Permissions updated successfully!');
  };

  const handleDeleteOperator = async (opId) => {
    if (!confirm('Are you sure you want to remove this operator?')) return;
    await deleteDoc(doc(db, 'users', opId));
  };

  const handleEditOperator = (op) => {
    setEditingOperatorId(op.id);
    setSelectedPermissions(op.permissions || ROLE_PERMISSIONS.operator);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n|\r/);
        const startIndex = (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('location')) ? 1 : 0;
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(',');
          if (parts.length >= 1 && parts[0]?.trim()) {
            await addAgent(parts[0].trim(), parts[1]?.trim() || 'General', parts[2]?.trim() || '');
          }
        }
        alert("Import completed.");
      } catch (err) { alert("An error occurred during import."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = "Full Name,Location,Phone Number\nModou Lamin,Westfield,3344556";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url); link.setAttribute("download", "agent_import_template.csv");
    link.style.visibility = 'hidden'; document.body.appendChild(link);
    link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  return (
    <>
      <nav className={`bg-blue-900 text-white p-4 sticky z-30 shadow-lg ${isOwner && rootId !== user.id ? 'top-10' : 'top-0'}`}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-2 rounded-lg"><Banknote className="w-6 h-6 text-blue-200" /></div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{isOwner && rootId !== user.id ? viewingAsMasterName : user.businessName}</h1>
              <div className="flex items-center gap-1 text-xs text-blue-300">
                <ShieldCheck className="w-3 h-3" />
                {isOwner ? 'Platform Owner' : (isMaster ? 'Master Agent' : 'Operator')} ({user.username})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={toggleLanguage} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-bold bg-blue-800/50 px-3 py-1.5 rounded-lg border border-blue-700">
               <GlobeIcon className="w-4 h-4" /> {language.toUpperCase()}
             </button>
             {canResetSystem && (
               <button onClick={handleResetSystem} className="hidden md:flex items-center gap-2 text-red-300 hover:text-red-100 transition-colors text-sm font-bold bg-red-900/50 px-3 py-1.5 rounded-lg border border-red-800">
                 <AlertTriangle className="w-4 h-4" /> {t('reset_system')}
               </button>
             )}
             <button onClick={onLogout} className="hidden md:flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-medium">
               <LogOut className="w-4 h-4" /> {t('logout')}
             </button>
             <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-blue-800 rounded"><Menu className="w-6 h-6" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:flex md:gap-6 lg:gap-8 mt-4">
        <aside className="hidden md:block sticky top-24 w-56 lg:w-64 h-fit self-start">
          <div className="space-y-1.5">
            {[
              ...(isOwner ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : []),
              ...((canViewDashboard || rootId !== user.id) ? [{ id: 'dashboard', label: t('dashboard'), icon: Wallet }] : []),
              { id: 'reports', label: t('reports'), icon: History },
              ...((canViewLiquidity || rootId !== user.id) ? [{ id: 'liquidity', label: t('liquidity'), icon: Banknote }] : []),
              { id: 'agents', label: t('manage_agents'), icon: Users },
              ...((canManageOperators || rootId !== user.id) ? [{ id: 'operators', label: t('operators'), icon: UserCog }] : []),
              { id: 'training', label: t('training_manual'), icon: BookOpen },
              ...(rootId === user.id ? [{ id: 'account', label: 'Account', icon: Settings }] : []),
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}>
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} /> {item.label}
              </button>
            ))}
          </div>
          {(isMaster || rootId !== user.id) && (
            <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
              <h4 className="font-bold text-blue-900 text-sm mb-1">{t('quick_action')}</h4>
              <p className="text-xs text-blue-700/70 mb-4 leading-relaxed">Instantly issue new float to any active sub-agent.</p>
              <Button variant="primary" className="w-full text-sm py-2.5 shadow-sm" onClick={() => openModal('issue')}>{t('issue_float')}</Button>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0">
          {activeTab === 'admin' && isOwner && <AdminDashboard onViewMaster={() => {}} />}
          {activeTab === 'dashboard' && (canViewDashboard || rootId !== user.id) && <DashboardView stats={stats} formatCurrency={formatCurrency} activeBalance={activeBalance} openingBalance={currentLiquidity.openingBalance} user={user} />}
          {activeTab === 'reports' && (
            <ReportView agents={agents} agentBalances={reportBalances} todaysTransactions={reportTransactions} formatCurrency={formatCurrency} today={reportDate} setReportDate={setReportDate} PROVIDERS={PROVIDERS} settings={settings} setSettings={setSettings} currentLiquidity={currentLiquidity} stats={stats} activeBalance={activeBalance} openModal={openModal} deleteTransaction={deleteTransaction} user={user} />
          )}
          {activeTab === 'liquidity' && (canViewLiquidity || rootId !== user.id) && (
            <LiquidityView currentLiquidity={currentLiquidity} updateLiquidity={updateLiquidity} activeBalance={activeBalance} stats={stats} formatCurrency={formatCurrency} closeDay={closeDay} isMaster={isMaster || (isOwner && rootId !== user.id)} isPassiveUnlockOverride={currentLiquidity.isPassiveUnlockOverride} togglePassiveUnlockOverride={togglePassiveUnlockOverride} createAdjustment={createAdjustment} user={user} />
          )}
          {activeTab === 'agents' && <AgentsView agents={agents} agentBalances={agentBalances} openModal={openModal} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} downloadTemplate={downloadTemplate} formatCurrency={formatCurrency} />}
          {activeTab === 'operators' && (canManageOperators || rootId !== user.id) && (
            <OperatorsView newOpName={newOpName} setNewOpName={setNewOpName} newOpPass={newOpPass} setNewOpPass={setNewOpPass} handleAddOperator={handleAddOperator} handleUpdateOperator={handleUpdateOperator} operators={operators} handleDeleteOperator={handleDeleteOperator} handleEditOperator={handleEditOperator} selectedPermissions={selectedPermissions} setSelectedPermissions={setSelectedPermissions} PERMISSIONS={PERMISSIONS} editingOperatorId={editingOperatorId} setEditingOperatorId={setEditingOperatorId} user={user} />
          )}
          {activeTab === 'training' && <TrainingManualView user={user} rootId={rootId} />}
          {activeTab === 'account' && <AccountSettings user={user} />}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {modalType === 'add_agent' ? t('add_new_agent') : modalType === 'edit_transaction' ? t('edit_transaction') : modalType === 'issue' ? t('issue_float') : t('return_funds')}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {modalType === 'add_agent' ? (
                <>
                  <Input label={t('full_name')} value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g. Modou Sowe" />
                  <Input label={t('location')} value={agentLocation} onChange={e => setAgentLocation(e.target.value)} placeholder="e.g. Westfield Junction" />
                  <Input label={t('phone_number')} value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="e.g. 7700000" />
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">{t('select_agent')}</label>
                    <select className="w-full p-3 border rounded-lg bg-white" value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)}>
                      <option value="">{t('select_agent')}...</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  {selectedAgentId && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2 border border-slate-100">
                      <div className="flex justify-between items-center">
                         <p className="font-bold text-lg text-slate-800">{agents.find(a => String(a.id) === String(selectedAgentId))?.name}</p>
                         <Badge color={(agentBalances[selectedAgentId]?.totalDue || 0) > 0 ? 'red' : 'green'}>{(agentBalances[selectedAgentId]?.totalDue || 0) > 0 ? t('owing') : t('cleared')}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-200 pt-3">
                        <div><span className="block text-slate-500 mb-1">{t('prev_debt')}</span><span className="font-semibold text-red-600">{formatCurrency(agentBalances[selectedAgentId]?.prevDebt || 0)}</span></div>
                        <div className="text-center border-l border-slate-200"><span className="block text-slate-500 mb-1">{t('todays_float')}</span><span className="font-semibold text-slate-800">{formatCurrency(agentBalances[selectedAgentId]?.issuedToday || 0)}</span></div>
                         <div className="text-right border-l border-slate-200 pl-2"><span className="block text-slate-500 mb-1">{t('total_due')}</span><span className="font-bold text-red-600 text-sm">{formatCurrency(agentBalances[selectedAgentId]?.totalDue || 0)}</span></div>
                      </div>
                    </div>
                  )}
                  {modalType === 'return' && (
                      <div className="mb-4">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">{t('transaction_type')}</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => setReturnCategory('payment')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${returnCategory === 'payment' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><RefreshCw className="w-6 h-6 mb-1"/><span className="font-bold text-sm">{t('pay_back_loan')}</span></button>
                              <button onClick={() => setReturnCategory('checkout')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${returnCategory === 'checkout' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><LogOut className="w-6 h-6 mb-1"/><span className="font-bold text-sm">{t('return_float')}</span></button>
                          </div>
                      </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{modalType === 'issue' ? t('source_of_funds') : t('repayment_via')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROVIDERS.map(p => {
                         const Icon = p.icon; const isSelected = method === p.id;
                         return (
                          <button key={p.id} onClick={() => setMethod(p.id)} className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all text-left ${isSelected ? `ring-2 ring-offset-1 ring-blue-500 ${p.colorClass}` : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <Icon className="w-4 h-4 shrink-0" /><span className="truncate">{p.label}</span>
                          </button>
                         )
                      })}
                    </div>
                  </div>
                  <Input label={t('amount_gmd')} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                  <Input label={t('notes_optional')} value={note} onChange={e => setNote(e.target.value)} placeholder={modalType === 'issue' ? "e.g. Morning Float" : "e.g. Closing Balance"} />
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg mb-2">
                      <div className="flex items-center gap-2 text-green-800"><MessageCircle className="w-4 h-4" /><span className="text-sm font-medium">{t('send_whatsapp')}</span></div>
                      <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${sendWhatsapp ? 'bg-green-500' : 'bg-slate-300'}`} onClick={() => setSendWhatsapp(!sendWhatsapp)}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${sendWhatsapp ? 'translate-x-4' : 'translate-x-0'}`} /></div>
                  </div>
                  <div className={`flex items-start gap-3 mt-4 p-3 border rounded-lg text-sm cursor-pointer ${confirmed ? (modalType === 'issue' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-purple-50 border-purple-100 text-purple-800') : 'bg-slate-50 border-slate-200 text-slate-600'}`} onClick={() => setConfirmed(!confirmed)}>
                      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${confirmed ? (modalType === 'issue' ? 'bg-blue-600 border-blue-600' : 'bg-purple-600 border-purple-600') + ' text-white' : 'bg-white border-slate-300'}`}>{confirmed && <CheckCircle2 className="w-3.5 h-3.5" />}</div>
                      <label className="font-medium select-none cursor-pointer">{modalType === 'issue' ? t('confirm_terms') : (returnCategory === 'checkout' ? t('confirm_verified') : t('confirm_receipt'))}</label>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
              <Button variant="secondary" onClick={closeModal}>{t('cancel')}</Button>
              <Button variant={modalType === 'issue' || modalType === 'add_agent' ? 'primary' : 'success'} onClick={modalType === 'add_agent' ? handleAddAgent : handleTransaction} disabled={modalType === 'add_agent' ? !agentName : (!amount || !confirmed || !selectedAgentId)}>{modalType === 'add_agent' ? t('save_agent') : modalType === 'issue' ? t('confirm_issue') : t('confirm_return')}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const Dashboard = ({ user, onLogout }) => {
  const { language, t } = useLanguage();
  const [viewingAsMasterId, setViewingAsMasterId] = useState(null);
  const [viewingAsMasterName, setViewingAsMasterName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isOwner = user.role === 'owner';
  const isMaster = user.role === 'master' || !user.role;
  const rootId = isOwner && viewingAsMasterId ? viewingAsMasterId : (isMaster ? user.id : user.masterId);
  const canViewAdmin = hasPermission(user, PERMISSIONS.VIEW_ADMIN_DASHBOARD);

  const [activeTab, setActiveTab] = useState(canViewAdmin ? 'admin' : 'dashboard');

  const toggleLanguage = () => {
    // Handled in LanguageContext
  };

  const handleViewAsMaster = (masterId, masterName) => {
    setViewingAsMasterId(masterId);
    setViewingAsMasterName(masterName);
    setActiveTab('dashboard');
  };

  const exitViewMode = () => {
    setViewingAsMasterId(null);
    setViewingAsMasterName('');
    setActiveTab('admin');
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  // Sync sidebar items for mobile
  const sidebarItems = [
    ...(isOwner ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : []),
    ...((rootId !== user.id || isMaster) ? [{ id: 'dashboard', label: t('dashboard'), icon: Wallet }] : []),
    { id: 'reports', label: t('reports'), icon: History },
    ...((rootId !== user.id || isMaster) ? [{ id: 'liquidity', label: t('liquidity'), icon: Banknote }] : []),
    { id: 'agents', label: t('manage_agents'), icon: Users },
    ...((rootId !== user.id || isMaster) ? [{ id: 'operators', label: t('operators'), icon: UserCog }] : []),
    { id: 'training', label: t('training_manual'), icon: BookOpen },
    ...(rootId === user.id ? [{ id: 'account', label: 'Account', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}>
        <aside className={`absolute left-0 top-0 bottom-0 bg-white w-72 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="p-4 flex justify-between items-center border-b">
            <span className="font-bold text-blue-900">Menu</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
          </div>
          <div className="p-4 space-y-2">
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-lg font-semibold ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                <item.icon className="w-5 h-5" /> {item.label}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {isOwner && viewingAsMasterId && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[60] shadow-md">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Eye className="w-4 h-4" />
            VIEW MODE: Viewing {viewingAsMasterName}'s Account
          </div>
          <button onClick={exitViewMode} className="bg-white text-amber-600 px-3 py-1 rounded-lg text-xs font-black shadow-sm">EXIT VIEW MODE</button>
        </div>
      )}

      {/* Admin Panel (Global for Owner) */}
      {activeTab === 'admin' && isOwner && !viewingAsMasterId ? (
        <>
          <nav className="bg-blue-900 text-white p-4 sticky top-0 z-30 shadow-lg">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-blue-200" />
                <h1 className="font-bold text-lg">Platform Administration</h1>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={handleLogout} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-medium"><LogOut className="w-4 h-4" /> {t('logout')}</button>
                 <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2"><Menu className="w-6 h-6" /></button>
              </div>
            </div>
          </nav>
          <div className="max-w-7xl mx-auto p-4 md:flex md:gap-8 mt-4">
             <aside className="hidden md:block w-64 shrink-0">
                <div className="space-y-1.5">
                  <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-white'}`}><ShieldCheck className="w-5 h-5" /> Admin</button>
                  <button onClick={() => setActiveTab('account')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'account' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-white'}`}><Settings className="w-5 h-5" /> Account</button>
                </div>
             </aside>
             <main className="flex-1">
                {activeTab === 'admin' && <AdminDashboard onViewMaster={handleViewAsMaster} />}
                {activeTab === 'account' && <AccountSettings user={user} />}
             </main>
          </div>
        </>
      ) : (
        /* Re-keyed sub-component forces a fresh state when rootId changes */
        <BusinessDashboard 
          key={rootId}
          user={user} 
          rootId={rootId} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setSidebarOpen={setSidebarOpen} 
          onLogout={handleLogout} 
          t={t} 
          language={language} 
          toggleLanguage={toggleLanguage}
          isOwner={isOwner}
          viewingAsMasterName={viewingAsMasterName}
        />
      )}
    </div>
  );
};
