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
  MessageCircle
} from 'lucide-react';
import { Button, Badge, Input } from './common';
import { DashboardView, AgentsView, ReportView, OperatorsView, LiquidityView } from './DashboardViews';
import { useFloatData } from '../hooks/useFloatData';
import { formatCurrency } from '../utils/formatters';
import { PROVIDERS } from '../constants';
import { hashPassword, generateId } from '../utils/crypto';

export const Dashboard = ({ user, onLogout }) => {
  const isMaster = user.role === 'master' || !user.role;
  const rootId = isMaster ? user.id : user.masterId;

  const {
    agents,
    setAgents,
    todaysTransactions,
    agentBalances,
    stats,
    today,
    addAgent,
    addTransaction,
    currentLiquidity,
    activeBalance,
    updateLiquidity
  } = useFloatData(rootId);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('issue');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  
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
    if (!isMaster) return [];
    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    return allUsers.filter(u => u.masterId === user.id);
  });
  const [newOpName, setNewOpName] = useState('');
  const [newOpPass, setNewOpPass] = useState('');

  const fileInputRef = useRef(null);

  const openModal = (type, agentId = '') => {
    setModalType(type);
    setSelectedAgentId(agentId);
    setAmount('');
    setMethod('cash');
    setNote('');
    setConfirmed(false);
    setReturnCategory('payment');
    setSendWhatsapp(true);
    
    // Reset agent form
    setAgentName('');
    setAgentLocation('');
    setAgentPhone('');

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleTransaction = () => {
    if (!amount || !selectedAgentId) return;
    const parsedAmount = parseFloat(amount);

    const txData = {
      agentId: selectedAgentId,
      type: modalType,
      category: modalType === 'return' ? returnCategory : 'issue',
      amount: parsedAmount,
      method: method,
      note,
      performedBy: user.username
    };

    if (sendWhatsapp) {
      const agent = agents.find(a => a.id === selectedAgentId);
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
      masterId: user.id
    };

    const updatedUsers = [...allUsers, newOp];
    localStorage.setItem('float_app_users', JSON.stringify(updatedUsers));
    setOperators(updatedUsers.filter(u => u.masterId === user.id));
    setNewOpName('');
    setNewOpPass('');
    alert('Operator added successfully!');
  };

  const handleDeleteOperator = (opId) => {
    if (!confirm('Are you sure you want to remove this operator?')) return;
    const allUsers = JSON.parse(localStorage.getItem('float_app_users') || '[]');
    const updatedUsers = allUsers.filter(u => u.id !== opId);
    localStorage.setItem('float_app_users', JSON.stringify(updatedUsers));
    setOperators(updatedUsers.filter(u => u.masterId === user.id));
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

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
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
        alert("No valid agents found in file.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Full Name,Location,Phone Number\nModou Lamin,Serrekunda Market,3344556\nFatou Jallow,Bakau,7766554";
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "agent_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <aside className={`fixed inset-y-0 left-0 bg-white w-64 shadow-2xl transform transition-transform duration-200 ease-in-out z-40 md:sticky md:top-24 md:transform-none md:shadow-none md:bg-transparent md:w-48 h-fit self-start ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 md:hidden flex justify-end"><button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6 text-slate-400" /></button></div>
          <div className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Wallet },
              { id: 'reports', label: 'Reports', icon: History },
              { id: 'liquidity', label: 'Liquidity', icon: Banknote },
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
          {activeTab === 'dashboard' && <DashboardView stats={stats} formatCurrency={formatCurrency} activeBalance={activeBalance} />}
          {activeTab === 'reports' && <ReportView agents={agents} agentBalances={agentBalances} todaysTransactions={todaysTransactions} formatCurrency={formatCurrency} today={today} PROVIDERS={PROVIDERS} />}
          {activeTab === 'liquidity' && (
            <LiquidityView 
              currentLiquidity={currentLiquidity} 
              updateLiquidity={updateLiquidity} 
              activeBalance={activeBalance}
              stats={stats}
              formatCurrency={formatCurrency}
            />
          )}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {modalType === 'add_agent' ? 'Add New Sub-Agent' : modalType === 'issue' ? 'Issue Float' : 'Return Funds'}
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
                  {modalType !== 'issue' && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2 border border-slate-100">
                      <div className="flex justify-between items-center">
                         <p className="font-bold text-lg text-slate-800">{agents.find(a => a.id === selectedAgentId)?.name}</p>
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

                  {modalType === 'issue' && selectedAgentId && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-slate-500 mb-1">Agent</p>
                      <p className="font-bold text-lg text-slate-800">{agents.find(a => a.id === selectedAgentId)?.name}</p>
                      {(agentBalances[selectedAgentId]?.prevDebt || 0) > 0 && (
                          <div className="mt-2 flex items-center text-xs text-red-600 bg-red-50 p-2 rounded">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Warning: Agent has arrears of {formatCurrency(agentBalances[selectedAgentId].prevDebt)}
                          </div>
                      )}
                    </div>
                  )}

                  {!selectedAgentId && (
                     <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Select Agent</label>
                      <select className="w-full p-3 border rounded-lg bg-white" value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)}>
                        <option value="">Select...</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
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
                      <p className="mb-2 italic">"I, <strong>{agents.find(a => a.id === selectedAgentId)?.name}</strong>, acknowledge receipt of <strong>{formatCurrency(amount)}</strong> on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} as a float loan from the Master Agent."</p>
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
                disabled={modalType === 'add_agent' ? !agentName : (!amount || !confirmed)}
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
