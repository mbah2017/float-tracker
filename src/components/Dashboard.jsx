import React, { useState, useRef } from 'react';
import { 
  Wallet, 
  History, 
  Users, 
  UserCog, 
  Banknote, 
  User, 
  LogOut, 
  Menu, 
  X,
  Plus,
  ArrowUpCircle,
  RefreshCw,
  Scale,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import { Button, Badge, Input } from './common';
import { DashboardView, AgentsView, ReportView, OperatorsView, LiquidityView } from './DashboardViews';
import { TrainingManualView } from './TrainingManualView';
import { useFloatData } from '../hooks/useFloatData';
import { formatCurrency } from '../utils/formatters';
import { PROVIDERS } from '../constants';
import { hashPassword, generateId } from '../utils/crypto';
import { hasPermission, PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions';

export const Dashboard = ({ user, onLogout }) => {
  const isMaster = user.role === 'master' || !user.role;
  const rootId = isMaster ? user.id : user.masterId;

  const canManageOperators = hasPermission(user, PERMISSIONS.MANAGE_OPERATORS);
  const canViewLiquidity = hasPermission(user, PERMISSIONS.VIEW_LIQUIDITY) || hasPermission(user, PERMISSIONS.MANAGE_LIQUIDITY);
  const canResetSystem = hasPermission(user, PERMISSIONS.RESET_SYSTEM);
  const canViewDashboard = hasPermission(user, PERMISSIONS.VIEW_DASHBOARD);

  const {
    agents,
    setAgents,
    todaysTransactions,
    reportTransactions,
    agentBalances,
    reportBalances,
    stats,
    // eslint-disable-next-line no-unused-vars
    today,
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

  const [activeTab, setActiveTab] = useState(canViewDashboard ? 'dashboard' : 'agents');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [operators, setOperators] = useState(() => {
    if (!canManageOperators) return [];
    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    return allUsers.filter(u => u.masterId === rootId);
  });
  const [newOpName, setNewOpName] = useState('');
  const [newOpPass, setNewOpPass] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(ROLE_PERMISSIONS.operator);
  const [editingOperatorId, setEditingOperatorId] = useState(null);

  const fileInputRef = useRef(null);

  const handleResetSystem = () => {
    if (!confirm('⚠️ CRITICAL WARNING: This will permanently delete ALL data including agents, transactions, and operator accounts. Are you absolutely sure?')) return;
    if (!confirm('FINAL CONFIRMATION: Type "DELETE" in the browser console if you want to proceed. Just kidding, click OK to wipe everything.')) return;
    
    localStorage.clear();
    window.location.reload();
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
    
    // Reset agent form
    setAgentName('');
    setAgentLocation('');
    setAgentPhone('');

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleTransaction = () => {
    if (!amount || !selectedAgentId || selectedAgentId === '') return;
    const parsedAmount = parseFloat(amount);

    if (modalType === 'edit_transaction' && editingTransactionId) {
      updateTransaction(editingTransactionId, {
        amount: parsedAmount,
        method: method,
        note: note
      });
      closeModal();
      return;
    }

    const txData = {
      agentId: String(selectedAgentId),
      type: modalType,
      category: modalType === 'return' ? returnCategory : 'issue',
      amount: parsedAmount,
      method: method,
      note,
      performedBy: user.username
    };

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

        let message = '';
        if (modalType === 'issue') {
          message = `*FLOAT ISSUANCE CONFIRMATION* 📤

Hello ${agent.name},

You have been issued a float loan of *${formatCurrency(parsedAmount)}* via ${methodLabel}.
📅 ${dateStr} at ${timeStr}

*Total Due: ${formatCurrency(newBalance)}*

Please confirm receipt. Repayment is due by 6:00 PM today.

Served by: ${user.username}`;
        } else {
          const typeLabel = returnCategory === 'checkout' ? 'End-of-Day Checkout' : 'Loan Repayment';
          message = `*${typeLabel.toUpperCase()} CONFIRMATION* 📥

Hello ${agent.name},

We received *${formatCurrency(parsedAmount)}* via ${methodLabel}.
📅 ${dateStr} at ${timeStr}

*Remaining Balance: ${formatCurrency(newBalance)}*

${newBalance <= 0.01 ? '✅ All Clear' : '⚠️ Outstanding Balance'}

Served by: ${user.username}`;
        }
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    }

    addTransaction(txData);
    closeModal();
  };

  const handleAddAgent = () => {
    if (!agentName) return;
    addAgent(agentName, agentLocation, agentPhone);
    closeModal();
  };

  const handleAddOperator = async () => {
    if (!newOpName || !newOpPass) return;
    if (!canManageOperators) return;

    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');

    if (allUsers.find(u => u.username === newOpName)) {
      alert('Username already taken');
      return;
    }

    const hashedPass = await hashPassword(newOpPass);
    const newOp = {
      id: generateId(),
      username: newOpName,
      password: hashedPass,
      businessName: user.businessName,
      role: 'operator',
      masterId: rootId,
      permissions: selectedPermissions
    };

    const updatedUsers = [...allUsers, newOp];
    localStorage.setItem('float_app_users', JSON.stringify(updatedUsers));
    setOperators(updatedUsers.filter(u => u.masterId === rootId));
    setNewOpName('');
    setNewOpPass('');
    setSelectedPermissions(ROLE_PERMISSIONS.operator);
    alert('Operator added successfully!');
  };

  const handleEditOperator = (op) => {
    setEditingOperatorId(op.id);
    setNewOpName(op.username);
    setNewOpPass(''); // Don't show old hash
    setSelectedPermissions(op.permissions || ROLE_PERMISSIONS.operator);
    // Scroll to top of form if needed or just let the UI change
  };

  const handleUpdateOperator = async () => {
    if (!editingOperatorId) return;

    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    const opIndex = allUsers.findIndex(u => u.id === editingOperatorId);
    
    if (opIndex === -1) return;

    const updatedOp = { ...allUsers[opIndex] };
    updatedOp.permissions = selectedPermissions;
    
    // Update password only if provided
    if (newOpPass.trim().length >= 6) {
      updatedOp.password = await hashPassword(newOpPass);
    } else if (newOpPass.trim().length > 0) {
      alert('Password must be at least 6 characters');
      return;
    }

    allUsers[opIndex] = updatedOp;
    localStorage.setItem('float_app_users', JSON.stringify(allUsers));
    setOperators(allUsers.filter(u => u.masterId === rootId));
    
    // Reset form
    setEditingOperatorId(null);
    setNewOpName('');
    setNewOpPass('');
    setSelectedPermissions(ROLE_PERMISSIONS.operator);
    alert('Operator updated successfully!');
  };

  const handleDeleteOperator = (opId) => {
    if (!canManageOperators) return;
    if (!confirm('Are you sure you want to remove this operator?')) return;
    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    const updatedUsers = allUsers.filter(u => u.id !== opId);
    localStorage.setItem('float_app_users', JSON.stringify(updatedUsers));
    setOperators(updatedUsers.filter(u => u.masterId === rootId));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      alert("Please select a valid CSV file.");
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        // Split by any newline character sequence (\n, \r\n, \r)
        const lines = text.split(/\r?\n|\r/);
        const newAgents = [];
        
        if (lines.length === 0) {
          alert("The file appears to be empty.");
          return;
        }

        // Determine if first line is a header
        const startIndex = (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('location')) ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Basic CSV parsing (handles simple cases, for complex ones use a library)
          // This split handles commas, but we could make it smarter
          const parts = line.split(',');
          if (parts.length >= 1) {
            const name = parts[0]?.trim();
            if (name) {
              newAgents.push({
                id: generateId(),
                name: name,
                location: parts[1]?.trim() || 'General',
                phone: parts[2]?.trim() || ''
              });
            }
          }
        }

        if (newAgents.length > 0) {
          setAgents(prev => [...prev, ...newAgents]);
          alert(`Successfully imported ${newAgents.length} agents.`);
        } else {
          alert("No valid agents found in the file. Ensure the format matches the template.");
        }
      } catch (err) {
        console.error("Import error:", err);
        alert("An error occurred while reading the file.");
      }
    };

    reader.onerror = () => {
      alert("Failed to read the file.");
    };

    reader.readAsText(file);
    // Reset value so same file can be re-selected if needed
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = "Full Name,Location,Phone Number\nModou Lamin,Serrekunda Market,3344556\nFatou Jallow,Bakau,7766554";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "agent_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
             {canResetSystem && (
               <button 
                 onClick={handleResetSystem} 
                 className="hidden md:flex items-center gap-2 text-red-300 hover:text-red-100 transition-colors text-sm font-bold bg-red-900/50 px-3 py-1.5 rounded-lg border border-red-800"
               >
                 <AlertTriangle className="w-4 h-4" /> Reset System
               </button>
             )}
             <button onClick={onLogout} className="hidden md:flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-medium">
               <LogOut className="w-4 h-4" /> Logout
             </button>
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-blue-800 rounded"><Menu className="w-6 h-6" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:flex md:gap-6 lg:gap-8 mt-4">
        <aside className={`fixed inset-y-0 left-0 bg-white w-72 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 md:sticky md:top-24 md:transform-none md:shadow-none md:bg-transparent md:w-56 lg:w-64 h-fit self-start ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 md:hidden flex justify-between items-center border-b border-slate-100 mb-2">
            <span className="font-bold text-blue-900">Menu</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
          </div>
          <div className="space-y-1.5 p-2 md:p-0">
            {[
              ...(canViewDashboard ? [{ id: 'dashboard', label: 'Dashboard', icon: Wallet }] : []),
              { id: 'reports', label: 'Reports', icon: History },
              ...(canViewLiquidity ? [{ id: 'liquidity', label: 'Liquidity', icon: Banknote }] : []),
              { id: 'agents', label: 'Manage Agents', icon: Users },
              ...(canManageOperators ? [{ id: 'operators', label: 'Operators', icon: UserCog }] : []),
              { id: 'training', label: 'Training Manual', icon: BookOpen },
            ].map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 md:py-3 rounded-xl font-semibold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'}`}>
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} /> {item.label}
              </button>
            ))}
          </div>
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 mx-2 md:mx-0 shadow-sm">
            <h4 className="font-bold text-blue-900 text-sm mb-1">Quick Action</h4>
            <p className="text-xs text-blue-700/70 mb-4 leading-relaxed">Instantly issue new float to any active sub-agent.</p>
            <Button variant="primary" className="w-full text-sm py-2.5 shadow-sm" onClick={() => { setSidebarOpen(false); openModal('issue'); }}>Issue Float</Button>
          </div>
          <div className="mt-8 md:hidden px-2 space-y-2">
             {canResetSystem && (
               <button 
                 onClick={() => { setSidebarOpen(false); handleResetSystem(); }} 
                 className="flex items-center justify-center gap-2 text-red-600 font-bold w-full p-3 bg-red-50 hover:bg-red-100 transition-colors rounded-xl border border-red-100"
               >
                 <AlertTriangle className="w-5 h-5" /> Reset System
               </button>
             )}
             <button onClick={onLogout} className="flex items-center justify-center gap-2 text-red-600 font-bold w-full p-3 bg-red-50 hover:bg-red-100 transition-colors rounded-xl border border-red-100">
               <LogOut className="w-5 h-5" /> Logout
             </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && canViewDashboard && <DashboardView stats={stats} formatCurrency={formatCurrency} activeBalance={activeBalance} openingBalance={currentLiquidity.openingBalance} user={user} />}
          {activeTab === 'reports' && (
                        <ReportView
                          agents={agents}
                          agentBalances={reportBalances}
                          todaysTransactions={reportTransactions}
                          formatCurrency={formatCurrency}
                          today={reportDate}
                          setReportDate={setReportDate}
                          PROVIDERS={PROVIDERS}
                          settings={settings}
                          setSettings={setSettings}
                          currentLiquidity={currentLiquidity}
                          stats={stats}
                          activeBalance={activeBalance}
                          openModal={openModal}
                          deleteTransaction={deleteTransaction}
                          user={user}
                        />          )}
          {activeTab === 'liquidity' && (
            <LiquidityView 
                                          currentLiquidity={currentLiquidity}
                                          updateLiquidity={updateLiquidity}
                                          activeBalance={activeBalance}
                                          stats={stats}
                                          formatCurrency={formatCurrency}
                                          closeDay={closeDay}
                                          isMaster={isMaster}
                                                        isPassiveUnlockOverride={currentLiquidity.isPassiveUnlockOverride}
                                                        togglePassiveUnlockOverride={togglePassiveUnlockOverride}
                                                        createAdjustment={createAdjustment}
                                                        user={user}
                                                      />          )}
          {activeTab === 'agents' && <AgentsView agents={agents} agentBalances={agentBalances} openModal={openModal} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} downloadTemplate={downloadTemplate} formatCurrency={formatCurrency} />}
          {activeTab === 'operators' && canManageOperators && (
            <OperatorsView
              newOpName={newOpName}
              setNewOpName={setNewOpName}
              newOpPass={newOpPass}
              setNewOpPass={setNewOpPass}
              handleAddOperator={handleAddOperator}
              handleUpdateOperator={handleUpdateOperator}
              operators={operators}
              handleDeleteOperator={handleDeleteOperator}
              handleEditOperator={handleEditOperator}
              selectedPermissions={selectedPermissions}
              setSelectedPermissions={setSelectedPermissions}
              PERMISSIONS={PERMISSIONS}
              editingOperatorId={editingOperatorId}
              setEditingOperatorId={setEditingOperatorId}
              user={user}
            />
          )}
          {activeTab === 'training' && <TrainingManualView user={user} rootId={rootId} />}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {modalType === 'add_agent' ? 'Add New Sub-Agent' : modalType === 'edit_transaction' ? 'Edit Transaction' : modalType === 'issue' ? 'Issue Float' : 'Return Funds'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {modalType === 'add_agent' ? (
                <>
                  <Input label="Full Name" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g. Modou Sowe" />
                  <Input label="Location" value={agentLocation} onChange={e => setAgentLocation(e.target.value)} placeholder="e.g. Westfield Junction" />
                  <Input label="Phone Number" value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="e.g. 7700000" />
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Select Agent</label>
                    <select 
                      className="w-full p-3 border rounded-lg bg-white" 
                      value={selectedAgentId} 
                      onChange={e => setSelectedAgentId(e.target.value)}
                    >
                      <option value="">Select Agent...</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  {selectedAgentId && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2 border border-slate-100">
                      <div className="flex justify-between items-center">
                         <p className="font-bold text-lg text-slate-800">{agents.find(a => String(a.id) === String(selectedAgentId))?.name}</p>
                         <Badge color={(agentBalances[selectedAgentId]?.totalDue || 0) > 0 ? 'red' : 'green'}>{(agentBalances[selectedAgentId]?.totalDue || 0) > 0 ? 'Owing' : 'Cleared'}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-200 pt-3">
                        <div><span className="block text-slate-500 mb-1">Prev. Debt</span><span className="font-semibold text-red-600">{formatCurrency(agentBalances[selectedAgentId]?.prevDebt || 0)}</span></div>
                        <div className="text-center border-l border-slate-200"><span className="block text-slate-500 mb-1">Today's Float</span><span className="font-semibold text-slate-800">{formatCurrency(agentBalances[selectedAgentId]?.issuedToday || 0)}</span></div>
                         <div className="text-right border-l border-slate-200 pl-2"><span className="block text-slate-500 mb-1">Total Due</span><span className="font-bold text-red-600 text-sm">{formatCurrency(agentBalances[selectedAgentId]?.totalDue || 0)}</span></div>
                      </div>
                    </div>
                  )}

                  {modalType === 'return' && (
                      <div className="mb-4">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction Type</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => setReturnCategory('payment')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${returnCategory === 'payment' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><RefreshCw className="w-6 h-6 mb-1"/><span className="font-bold text-sm">Pay Back Loan</span><span className="text-[10px] opacity-75">Partial or full repayment</span></button>
                              <button onClick={() => setReturnCategory('checkout')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${returnCategory === 'checkout' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><LogOut className="w-6 h-6 mb-1"/><span className="font-bold text-sm">Return Float</span><span className="text-[10px] opacity-75">End of day closing</span></button>
                          </div>
                      </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{modalType === 'issue' ? 'Source of Funds' : 'Repayment Via'}</label>
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

                  {modalType !== 'issue' && selectedAgentId && amount && (
                     <div className={`p-3 rounded text-sm mb-4 flex items-start gap-2 ${parseFloat(amount) < (agentBalances[selectedAgentId]?.totalDue || 0) ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-700'}`}>
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div><span className="font-bold">{parseFloat(amount) < (agentBalances[selectedAgentId]?.totalDue || 0) ? 'Partial Payment:' : 'Full Clearance:'}</span><p>{parseFloat(amount) < (agentBalances[selectedAgentId]?.totalDue || 0) ? `Remaining debt: ${formatCurrency(agentBalances[selectedAgentId].totalDue - amount)}` : 'This payment clears all outstanding debts.'}</p></div>
                     </div>
                  )}

                  <Input label="Notes (Optional)" value={note} onChange={e => setNote(e.target.value)} placeholder={modalType === 'issue' ? "e.g. Morning Float" : "e.g. Closing Balance"} />

                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg mb-2">
                      <div className="flex items-center gap-2 text-green-800"><MessageCircle className="w-4 h-4" /><span className="text-sm font-medium">Send WhatsApp Confirmation</span></div>
                      <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${sendWhatsapp ? 'bg-green-500' : 'bg-slate-300'}`} onClick={() => setSendWhatsapp(!sendWhatsapp)}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${sendWhatsapp ? 'translate-x-4' : 'translate-x-0'}`} /></div>
                  </div>

                  {modalType === 'issue' && amount > 0 && selectedAgentId && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                      <div className="flex items-center gap-2 mb-2 font-bold text-slate-800"><Scale className="w-4 h-4" /> Legal Agreement</div>
                      <p className="mb-2 italic">"I, <strong>{agents.find(a => String(a.id) === String(selectedAgentId))?.name}</strong>, acknowledge receipt of <strong>{formatCurrency(amount)}</strong> on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} as a float loan from the Master Agent."</p>
                      <p className="font-semibold text-slate-800">"I agree to repay this full amount to the Master Agent by the end of today, before closing at 6:00 PM."</p>
                    </div>
                  )}

                  <div className={`flex items-start gap-3 mt-4 p-3 border rounded-lg text-sm transition-colors hover:bg-opacity-50 cursor-pointer ${modalType === 'issue' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-purple-50 border-purple-100 text-purple-800'}`} onClick={() => setConfirmed(!confirmed)}>
                      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${confirmed ? (modalType === 'issue' ? 'bg-blue-600 border-blue-600' : 'bg-purple-600 border-purple-600') + ' text-white' : 'bg-white border-slate-300'}`}>{confirmed && <CheckCircle2 className="w-3.5 h-3.5" />}</div>
                      <label className="font-medium select-none cursor-pointer">{modalType === 'issue' ? "I confirm the agent has agreed to these terms." : (returnCategory === 'checkout' ? "I confirm the final closing balance has been verified." : "I confirm receipt of these funds.")}</label>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button 
                variant={modalType === 'issue' || modalType === 'add_agent' ? 'primary' : 'success'} 
                onClick={modalType === 'add_agent' ? handleAddAgent : handleTransaction} 
                disabled={modalType === 'add_agent' ? !agentName : (!amount || !confirmed || !selectedAgentId)}
              >
                {modalType === 'add_agent' ? 'Save Agent' : modalType === 'issue' ? 'Confirm Issue' : 'Confirm Return'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
