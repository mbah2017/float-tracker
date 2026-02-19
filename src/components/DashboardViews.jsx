import { useState } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Users, 
  Plus, 
  FileSpreadsheet, 
  Upload, 
  Download,
  LogOut,
  RefreshCw,
  User, 
  Trash2, 
  UserCog, 
  History, 
  Banknote, 
  Building2, 
  Smartphone, 
  Globe, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Scale, 
  CheckCircle2, 
  Edit2, 
  MessageCircle 
} from 'lucide-react';
import { Card, Button, Badge, Input } from './common';
import { ChannelReconciliationTable } from './ChannelReconciliationTable';
import { PassiveBalanceCard } from './PassiveBalanceCard';
import { DayEndFinalizationCard } from './DayEndFinalizationCard';

import { hasPermission, PERMISSIONS } from '../constants/permissions';

export const LiquidityView = ({ 
  currentLiquidity, 
  updateLiquidity, 
  stats, 
  formatCurrency, 
  closeDay, 
  isMaster, 
  isPassiveUnlockOverride, 
  togglePassiveUnlockOverride, 
  createAdjustment 
}) => {
  // Calculate activeBalance directly from currentLiquidity.actualBalances
  const activeBalance = Object.values(currentLiquidity.actualBalances || {}).reduce((sum, val) => sum + (val || 0), 0);
  const totalOperationalLiquidity = activeBalance + (stats.totalOutstanding || 0);
  
  // Calculations for the UI
  const openingTotal = Object.values(currentLiquidity.openingBalances || {}).reduce((sum, val) => sum + (val || 0), 0);
  const expectedClosingTotal = openingTotal + (stats.returnedToday || 0) - (stats.issuedToday || 0);
  const overallDiscrepancy = activeBalance - expectedClosingTotal;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Liquidity Tracking</h2>
        <Badge color="blue">Daily Snapshot</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChannelReconciliationTable 
          currentLiquidity={currentLiquidity}
          updateLiquidity={updateLiquidity}
          stats={stats}
          formatCurrency={formatCurrency}
          createAdjustment={createAdjustment}
          openingTotal={openingTotal}
          expectedClosingTotal={expectedClosingTotal}
          activeBalance={activeBalance}
          overallDiscrepancy={overallDiscrepancy}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <PassiveBalanceCard
              currentLiquidity={currentLiquidity}
              updateLiquidity={updateLiquidity}
              isMaster={isMaster}
              isPassiveUnlockOverride={isPassiveUnlockOverride}
              togglePassiveUnlockOverride={togglePassiveUnlockOverride}
            />

            <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-xl shadow-blue-100">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.1em] mb-1">Total Operational Liquidity</p>
              <h2 className="text-3xl font-black">{formatCurrency(totalOperationalLiquidity)}</h2>
              <p className="text-[10px] text-blue-200/80 mt-3 leading-relaxed">Sum of all active wallet balances and outstanding debt from your agent network.</p>
            </Card>
          </div>

          <div className="space-y-6">
            <DayEndFinalizationCard
              currentLiquidity={currentLiquidity}
              formatCurrency={formatCurrency}
              closeDay={closeDay}
              overallDiscrepancy={overallDiscrepancy}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardView = ({ stats, formatCurrency, activeBalance, openingBalance }) => (
  <div className="space-y-6 pb-20">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card className="bg-slate-800 text-white border-none shadow-indigo-100/50 shadow-lg">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Day Opening</p>
              <h2 className="text-2xl font-bold text-blue-300">{formatCurrency(openingBalance)}</h2>
            </div>
            <div className="p-2 bg-slate-700/50 rounded-xl">
              <RefreshCw className="w-5 h-5 text-blue-300" />
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-blue-200 shadow-lg">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Issued Today</p>
              <h2 className="text-2xl font-bold">{formatCurrency(stats.issuedToday)}</h2>
            </div>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <ArrowUpCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white border-emerald-100 shadow-emerald-50 shadow-lg">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Repaid Today</p>
              <h2 className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.returnedToday)}</h2>
            </div>
            <div className="p-2 bg-emerald-100 rounded-xl">
              <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white border-blue-100 shadow-blue-50 shadow-lg">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Actual Balance</p>
              <h2 className="text-2xl font-bold text-blue-600">{formatCurrency(activeBalance)}</h2>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl">
              <Banknote className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white border-amber-100 shadow-amber-50 shadow-lg">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Team Debt</p>
              <h2 className={`text-2xl font-bold ${stats.totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formatCurrency(stats.totalOutstanding)}
              </h2>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl">
              <Wallet className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Card className="bg-blue-900 text-white border-none p-6 md:p-8 shadow-2xl shadow-blue-200 overflow-hidden relative group">
       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Scale className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
       </div>
       <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="text-center md:text-left">
             <p className="text-blue-300 text-sm font-bold uppercase tracking-[0.2em] mb-2">Total Operational Liquidity</p>
             <h2 className="text-4xl md:text-5xl font-black">{formatCurrency(activeBalance + stats.totalOutstanding)}</h2>
          </div>
          <div className="text-center md:text-right">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <p className="text-sm font-bold tracking-tight">System Reconciled</p>
             </div>
             <p className="text-blue-200/60 text-xs italic">Combined Capital: Active Balance + Outstanding Debt</p>
          </div>
       </div>
    </Card>
  </div>
);

export const AgentsView = ({ agents, agentBalances, openModal, fileInputRef, handleFileUpload, downloadTemplate, formatCurrency }) => (
  <div className="space-y-6 pb-20">
     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 className="text-2xl font-bold text-slate-800">My Agents</h2>
      <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            accept=".csv,text/csv" 
            ref={fileInputRef} 
            className="opacity-0 absolute pointer-events-none w-0 h-0" 
            onChange={handleFileUpload} 
          />
          <Button variant="secondary" onClick={downloadTemplate} icon={FileSpreadsheet} className="text-xs py-2 px-3">Template</Button>
          <Button variant="outline" onClick={() => fileInputRef.current.click()} icon={Upload} className="text-xs py-2 px-3">Import</Button>
          <Button onClick={() => openModal('add_agent')} icon={Plus} className="text-xs py-2 px-3">Add Agent</Button>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...agents].sort((a, b) => a.name.localeCompare(b.name)).map(agent => {
        const bal = agentBalances[agent.id] || { issuedToday: 0, returnedToday: 0, prevDebt: 0, totalDue: 0 };

        return (
          <Card key={agent.id} className="p-5 hover:shadow-md transition-all group border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {agent.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-800 truncate text-base">{agent.name}</h3>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1"><Globe className="w-3 h-3" />{agent.location}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono tracking-tighter">{agent.phone}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-end">
               <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Current Balance</p>
                 <p className={`text-xl font-black ${bal.totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(bal.totalDue)}</p>
               </div>
               <div className="flex gap-2">
                 {bal.totalDue === 0 ? (
                    <Button variant="primary" className="py-1.5 px-4 text-xs font-bold rounded-xl" onClick={() => openModal('issue', agent.id)}>Issue</Button>
                  ) : (
                    <Button variant="success" className="py-1.5 px-4 text-xs font-bold rounded-xl" onClick={() => openModal('return', agent.id)}>Return</Button>
                  )}
               </div>
            </div>
          </Card>
        );
      })}
      {agents.length === 0 && (
        <div className="col-span-full text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">You haven't added any agents yet.</p>
          <button onClick={() => openModal('add_agent')} className="text-blue-600 font-bold text-sm mt-3 hover:underline underline-offset-4 decoration-2">Add your first agent</button>
        </div>
      )}
    </div>
  </div>
);

export const ReportView = ({ agents, agentBalances, todaysTransactions, formatCurrency, today, setReportDate, PROVIDERS, settings, setSettings, currentLiquidity, stats, activeBalance, openModal, deleteTransaction, user }) => {
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'cashbook'
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const canDeleteTransaction = hasPermission(user, PERMISSIONS.DELETE_TRANSACTION);

  const filteredTransactions = selectedAgentId
    ? todaysTransactions.filter(t => String(t.agentId) === String(selectedAgentId))
    : todaysTransactions;

  const cashbookTotals = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'issue') {
      acc.totalDebit += t.amount;
    } else {
      acc.totalCredit += t.amount;
    }
    return acc;
  }, { totalDebit: 0, totalCredit: 0 });

  const netBalance = cashbookTotals.totalCredit - cashbookTotals.totalDebit;

  // Calculations for the UI
  const openingTotal = (currentLiquidity.openingBalance || 0);
  const expectedClosingTotal = openingTotal + (stats.returnedToday || 0) - (stats.issuedToday || 0);
  const calculatedActiveBalance = Object.values(currentLiquidity.actualBalances || {}).reduce((sum, val) => sum + (val || 0), 0);
  const overallDiscrepancy = calculatedActiveBalance - expectedClosingTotal;

  const selectedAgent = agents.find(a => String(a.id) === String(selectedAgentId));
  const reportTitle = selectedAgent
    ? `${selectedAgent.name}'s Report`
    : (viewMode === 'summary' ? 'Reconciliation' : 'Cashbook');

  const handleWhatsAppReport = () => {
    if (!selectedAgent || !selectedAgent.phone) {
      alert("Selected agent has no phone number or no agent selected.");
      return;
    }

    const bal = agentBalances[selectedAgentId] || { issuedToday: 0, returnedToday: 0, prevDebt: 0, totalDue: 0 };
    const dateStr = new Date(today).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    let message = `*TRANSACTION REPORT: ${selectedAgent.name.toUpperCase()}* 📊\n`;
    message += `Date: ${dateStr}\n\n`;
    
    message += `*SUMMARY*\n`;
    message += `Opening Debt: ${formatCurrency(bal.prevDebt)}\n`;
    message += `Float Issued: ${formatCurrency(bal.issuedToday)}\n`;
    message += `Total Repaid: ${formatCurrency(bal.returnedToday)}\n`;
    message += `*CURRENT BALANCE: ${formatCurrency(bal.totalDue)}*\n\n`;

    if (filteredTransactions.length > 0) {
      message += `*TRANSACTION DETAILS*\n`;
      filteredTransactions.forEach(t => {
        const timeStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const typeLabel = t.type === 'issue' ? 'OUT' : 'IN';
        const methodLabel = PROVIDERS.find(p => p.id === t.method)?.label || t.method;
        message += `• ${timeStr} | ${typeLabel}: ${formatCurrency(t.amount)} (${methodLabel})\n`;
      });
      message += `\n`;
    }

    message += `Report generated by ${settings.reportName || 'Float Cashbook'}`;

    let phone = selectedAgent.phone.replace(/\D/g, '');
    if (phone.length === 7) phone = '220' + phone;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <h2 className="text-2xl font-bold text-slate-800">
          {reportTitle}
        </h2>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <input
            type="date"
            className="flex-1 lg:flex-none px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-bold text-slate-700"
            value={today}
            onChange={(e) => setReportDate(e.target.value)}
          />
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="flex-1 lg:flex-none px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-bold text-slate-700"
          >
            <option value="">All Agents</option>
            {[...agents].sort((a, b) => a.name.localeCompare(b.name)).map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
          <div className="flex bg-slate-200 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'summary' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode('cashbook')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'cashbook' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Details
            </button>
          </div>
          {selectedAgentId && selectedAgent?.phone && (
            <Button 
              variant="outline" 
              icon={MessageCircle} 
              onClick={handleWhatsAppReport} 
              className="py-2 text-xs font-bold rounded-xl border-green-200 bg-green-50 text-green-700 shadow-sm hover:bg-green-100 transition-colors"
            >
              WhatsApp
            </Button>
          )}
          <Button variant="outline" icon={Download} onClick={() => window.print()} className="py-2 text-xs font-bold rounded-xl border-slate-200 bg-white shadow-sm">Print</Button>
        </div>
      </div>

      {viewMode === 'summary' ? (
        <>
          {!selectedAgentId && (
            <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 print:border-none print:shadow-none mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 print:text-xl">
                <RefreshCw className="w-5 h-5 text-blue-600 print:hidden" /> Reconciliation Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-slate-600 font-medium text-sm">Opening Balance</span>
                  <span className="font-bold text-slate-800">{formatCurrency(openingTotal)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-slate-600 font-medium text-sm">Expected Closing</span>
                  <span className="font-bold text-slate-900">{formatCurrency(expectedClosingTotal)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-slate-600 font-medium text-sm">Total Repayments</span>
                  <span className="font-bold text-emerald-600">+{formatCurrency(stats.returnedToday).replace('GMD', '')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-slate-600 font-medium text-sm">Total Actual Balance</span>
                  <span className="font-bold text-slate-800">{formatCurrency(calculatedActiveBalance)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-slate-600 font-medium text-sm">Total Issuance</span>
                  <span className="font-bold text-red-600">-{formatCurrency(stats.issuedToday).replace('GMD', '')}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-white/60 px-3 rounded-xl border border-blue-200 mt-2 shadow-sm">
                  <span className="font-black text-slate-800 text-sm italic">Discrepancy</span>
                  <span className={`text-lg font-black ${Math.abs(overallDiscrepancy) > 0.01 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {formatCurrency(overallDiscrepancy)}
                  </span>
                </div>
              </div>
              {currentLiquidity.reconciliationNotes && (
                <div className="mt-6 py-3 bg-blue-100/30 border border-blue-100 px-4 rounded-xl text-xs text-slate-700 leading-relaxed italic shadow-inner">
                  <span className="font-black not-italic uppercase text-[10px] text-blue-600 mr-2">Note:</span> {currentLiquidity.reconciliationNotes}
                </div>
              )}
            </Card>
          )}

          <Card className="overflow-hidden border-slate-100 shadow-sm rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] sm:text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 sm:px-6 py-4">Agent</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">Prev Debt</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">Issued</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">Repaid</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap font-bold">Total Due</th>
                    <th className="px-4 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(selectedAgent ? [selectedAgent] : [...agents].sort((a, b) => a.name.localeCompare(b.name))).map(agent => {
                    const bal = agentBalances[agent.id] || { issuedToday: 0, returnedToday: 0, prevDebt: 0, totalDue: 0 };
                    return (
                      <tr key={agent.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">{agent.name}</td>
                        <td className="px-4 py-4 text-right text-red-500 font-medium font-mono text-xs">{formatCurrency(bal.prevDebt).replace('GMD', '')}</td>
                        <td className="px-4 py-4 text-right text-slate-600 font-medium font-mono text-xs">{formatCurrency(bal.issuedToday).replace('GMD', '')}</td>
                        <td className="px-4 py-4 text-right text-emerald-600 font-bold font-mono text-xs">{formatCurrency(bal.returnedToday).replace('GMD', '')}</td>
                        <td className={`px-4 py-4 text-right font-black font-mono text-sm ${bal.totalDue > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                          {formatCurrency(bal.totalDue).replace('GMD', '')}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {bal.totalDue === 0 ? <Badge color="green">Clear</Badge> : <Badge color="red">Due</Badge>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <h3 className="text-lg font-bold text-slate-800 mt-10 mb-4 print:hidden flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" /> Recent Transactions
          </h3>
          <div className="space-y-3 print:hidden">
            {filteredTransactions.length === 0 && <p className="text-slate-500 italic p-8 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">No transactions recorded for this selection.</p>}
            {filteredTransactions.slice().reverse().map(t => {
              const provider = PROVIDERS.find(p => p.id === t.method) || PROVIDERS[0];
              const ProviderIcon = provider.icon;
              const isCheckout = t.category === 'checkout';

              return (
                <div key={t.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${t.type === 'issue' ? 'bg-blue-50 text-blue-600' : t.category === 'checkout' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {t.type === 'issue' ? <ArrowUpCircle className="w-5 h-5"/> : isCheckout ? <LogOut className="w-5 h-5"/> : <RefreshCw className="w-5 h-5"/>}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-slate-800 text-sm sm:text-base uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">
                          {t.agentId === 'SYSTEM' ? 'SYSTEM (Adj)' : (agents.find(a => String(a.id) === String(t.agentId))?.name || 'Unknown')}
                        </p>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-black border ${provider.colorClass} shadow-sm`}>
                          {provider.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {t.performedBy || 'System'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                    <span className={`font-black text-lg font-mono ${t.type === 'issue' ? 'text-slate-700' : 'text-emerald-600'}`}>
                      {t.type === 'issue' ? '-' : '+'}{formatCurrency(t.amount).replace('GMD', '')}
                    </span>
                    <button
                      onClick={() => openModal('edit_transaction', t.id)}
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {canDeleteTransaction && (
                      <button
                        onClick={() => confirm('Delete this transaction?') && deleteTransaction(t.id)}
                        className="p-2 text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6 sm:gap-0">
              <div className="flex-1 w-full">
                {isEditingTitle ? (
                  <input
                    autoFocus
                    className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight border-b-4 border-blue-500 outline-none w-full max-w-2xl bg-transparent"
                    value={settings.reportName}
                    onChange={e => setSettings(prev => ({ ...prev, reportName: e.target.value }))}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)}
                  />
                ) : (
                  <div className="group flex items-center gap-4">
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">{settings.reportName || 'Float Cashbook'}</h1>
                    <button onClick={() => setIsEditingTitle(true)} className="p-2 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all print:hidden">
                      <Edit2 className="w-6 h-6" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-2 font-medium">{new Date(today).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Generated</p>
                <p className="text-sm font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-100 inline-block">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Total Debit</p>
                <p className="text-2xl font-black text-red-600 font-mono">{formatCurrency(cashbookTotals.totalDebit).replace('GMD', '')}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Total Credit</p>
                <p className="text-2xl font-black text-emerald-600 font-mono">{formatCurrency(cashbookTotals.totalCredit).replace('GMD', '')}</p>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl shadow-lg">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Net Balance</p>
                <p className={`text-2xl font-black font-mono ${netBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {formatCurrency(netBalance).replace('GMD', '')}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-50">
                  <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-tighter text-xs">Date/Time</th>
                  <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-tighter text-xs">Entity</th>
                  <th className="px-6 py-4 text-left font-black text-slate-900 uppercase tracking-tighter text-xs">Ref/Notes</th>
                  <th className="px-6 py-4 text-right font-black text-slate-900 uppercase tracking-tighter text-xs">Debit (-)</th>
                  <th className="px-6 py-4 text-right font-black text-slate-900 uppercase tracking-tighter text-xs">Credit (+)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic font-medium">No transactions recorded for this period.</td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const agentName = t.agentId === 'SYSTEM' ? 'SYSTEM (Adjustment)' : (agents.find(a => String(a.id) === String(t.agentId))?.name || 'Unknown Agent');
                  const providerLabel = PROVIDERS.find(p => p.id === t.method)?.label || t.method;
                  const dateStr = new Date(t.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' });
                  const timeStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 align-top whitespace-nowrap">
                        <span className="block font-bold text-slate-700 text-xs">{dateStr}</span>
                        <span className="block text-[10px] text-slate-400 font-bold">{timeStr}</span>
                      </td>
                      <td className="px-6 py-4 align-top font-black text-slate-800 uppercase text-xs tracking-tighter">
                        {agentName}
                      </td>
                      <td className="px-6 py-4 align-top text-slate-600 text-xs font-medium max-w-[200px]">
                         {t.note ? (
                           <>
                             <span className="text-slate-900">{t.note}</span>
                             <span className="block text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{providerLabel}</span>
                           </>
                         ) : (
                           <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">{providerLabel}</span>
                         )}
                      </td>
                      <td className="px-6 py-4 align-top text-right font-mono text-red-600 text-sm font-black">
                        <div className="flex items-center justify-end gap-2">
                          {t.type === 'issue' ? formatCurrency(t.amount).replace('GMD', '') : '—'}
                          {t.type === 'issue' && (
                            <div className="flex items-center">
                              <button onClick={() => openModal('edit_transaction', t.id)} className="p-1.5 text-slate-200 hover:text-blue-600 transition-colors print:hidden"><Edit2 className="w-3.5 h-3.5" /></button>
                              {canDeleteTransaction && (
                                <button onClick={() => confirm('Delete this transaction?') && deleteTransaction(t.id)} className="p-1.5 text-slate-100 hover:text-red-600 transition-colors print:hidden"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-right font-mono text-emerald-600 text-sm font-black">
                        <div className="flex items-center justify-end gap-2">
                          {t.type !== 'issue' ? formatCurrency(t.amount).replace('GMD', '') : '—'}
                          {t.type !== 'issue' && (
                            <div className="flex items-center">
                              <button onClick={() => openModal('edit_transaction', t.id)} className="p-1.5 text-slate-200 hover:text-blue-600 transition-colors print:hidden"><Edit2 className="w-3.5 h-3.5" /></button>
                              {canDeleteTransaction && (
                                <button onClick={() => confirm('Delete this transaction?') && deleteTransaction(t.id)} className="p-1.5 text-slate-100 hover:text-red-600 transition-colors print:hidden"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);
}

export const OperatorsView = ({ 
  newOpName, 
  setNewOpName, 
  newOpPass, 
  setNewOpPass, 
  handleAddOperator, 
  handleUpdateOperator,
  operators, 
  handleDeleteOperator,
  handleEditOperator,
  selectedPermissions,
  setSelectedPermissions,
  PERMISSIONS,
  editingOperatorId,
  setEditingOperatorId,
  user
}) => {
  const togglePermission = (perm) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm) 
        : [...prev, perm]
    );
  };

  const cancelEdit = () => {
    setEditingOperatorId(null);
    setNewOpName('');
    setNewOpPass('');
    setSelectedPermissions([]);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Manage Operators</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-100 shadow-sm rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl shadow-inner ${editingOperatorId ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              <UserCog className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingOperatorId ? 'Update Operator' : 'Create Operator'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingOperatorId ? 'Modify staff permissions' : 'Add staff and assign permissions'}
                </p>
            </div>
          </div>
          <div className="space-y-4">
            <Input 
              label="Username" 
              value={newOpName} 
              onChange={e => setNewOpName(e.target.value)} 
              placeholder="e.g. fatou_staff" 
              className="shadow-sm" 
              disabled={!!editingOperatorId}
            />
            <Input 
              label={editingOperatorId ? "New Password (leave blank to keep current)" : "Password"} 
              type="password" 
              value={newOpPass} 
              onChange={e => setNewOpPass(e.target.value)} 
              placeholder="Secret123" 
              className="shadow-sm" 
            />
            
            <div className="space-y-2 pt-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Permissions</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(PERMISSIONS)
                  .filter(([_, value]) => {
                    const isMaster = user.role === 'master' || !user.role;
                    // Specifically block RESET_SYSTEM for anyone who isn't a Master
                    if (value === PERMISSIONS.RESET_SYSTEM) return isMaster;
                    // Allow Managers to assign all other permissions
                    return true;
                  })
                  .map(([key, value]) => {
                    return (
                      <label key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100">
                        <input 
                          type="checkbox" 
                          checked={selectedPermissions.includes(value)}
                          onChange={() => togglePermission(value)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="block text-xs font-bold text-slate-700">{key.replace(/_/g, ' ')}</span>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="flex gap-2">
              {editingOperatorId && (
                <Button variant="secondary" onClick={cancelEdit} className="flex-1 py-4 font-black">Cancel</Button>
              )}
              <Button 
                onClick={editingOperatorId ? handleUpdateOperator : handleAddOperator} 
                className="flex-[2] py-4 font-black shadow-lg shadow-blue-100"
              >
                {editingOperatorId ? 'Save Changes' : 'Create Operator Account'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-100 shadow-sm rounded-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-purple-500" /> Existing Staff</h3>
          {operators.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">No operators created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {operators.map(op => {
                const isSelf = op.id === user.id;
                return (
                  <div key={op.id} className={`flex justify-between items-center p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all ${editingOperatorId === op.id ? 'border-amber-200 ring-2 ring-amber-50 ring-offset-0' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black text-sm">
                        {op.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-800 uppercase tracking-tight">{op.username}</p>
                          {isSelf && <Badge color="blue">You</Badge>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {op.permissions?.length || 0} permissions assigned
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!isSelf && (
                        <>
                          <button 
                            onClick={() => handleEditOperator(op)} 
                            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Permissions"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteOperator(op.id)} 
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Operator"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
