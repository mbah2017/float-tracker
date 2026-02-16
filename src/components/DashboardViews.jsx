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
  Edit2
} from 'lucide-react';
import { Card, Button, Badge, Input } from './common';

export const LiquidityView = ({ currentLiquidity, updateLiquidity, activeBalance, stats, formatCurrency }) => {
  const isPassiveLocked = currentLiquidity.passiveBalanceLastUpdated && 
    (new Date() - new Date(currentLiquidity.passiveBalanceLastUpdated)) < (30 * 24 * 60 * 60 * 1000);

  const totalOperationalLiquidity = activeBalance + stats.totalOutstanding;
  
  // Correct Accounting Logic:
  // Expected Balance = Opening Balance + Repayments - Loans Issued
  const expectedBalance = currentLiquidity.openingBalance + stats.returnedToday - stats.issuedToday;
  const discrepancy = activeBalance - expectedBalance;

  const handleChange = (field, value) => {
    // If input is empty, set to 0 to avoid NaN, otherwise parse the float
    const parsed = value === '' ? 0 : parseFloat(value);
    updateLiquidity({ [field]: parsed });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Liquidity Tracking</h2>
        <Badge color="blue">Daily Snapshot</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6 border-blue-200 bg-blue-50/50">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" /> Day Opening
            </h3>
            <Input 
              label="Opening Balance (Cash + Digital)" 
              type="number" 
              value={currentLiquidity.openingBalance || ''} 
              onChange={e => handleChange('openingBalance', e.target.value)} 
              icon={Wallet} 
              placeholder="0.00" 
            />
            <p className="text-xs text-slate-500 italic">Enter the total liquidity carried over from yesterday.</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" /> Active Balance Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Cash on Hand" type="number" value={currentLiquidity.cash || ''} onChange={e => handleChange('cash', e.target.value)} icon={Banknote} placeholder="0.00" />
              <Input label="Bank Account" type="number" value={currentLiquidity.bank || ''} onChange={e => handleChange('bank', e.target.value)} icon={Building2} placeholder="0.00" />
              <Input label="Wave Wallet" type="number" value={currentLiquidity.wave || ''} onChange={e => handleChange('wave', e.target.value)} icon={Smartphone} placeholder="0.00" />
              <Input label="APS Wallet" type="number" value={currentLiquidity.aps || ''} onChange={e => handleChange('aps', e.target.value)} icon={Globe} placeholder="0.00" />
              <Input label="Orange Money" type="number" value={currentLiquidity.orange || ''} onChange={e => handleChange('orange', e.target.value)} icon={Smartphone} placeholder="0.00" />
              <Input label="NAFA Wallet" type="number" value={currentLiquidity.nafa || ''} onChange={e => handleChange('nafa', e.target.value)} icon={Globe} placeholder="0.00" />
            </div>
            <div className="mt-6 p-4 bg-slate-900 text-white rounded-xl">
              <p className="text-slate-400 text-sm font-medium">Actual Closing Balance</p>
              <h2 className="text-3xl font-bold text-white">{formatCurrency(activeBalance)}</h2>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-amber-100 bg-amber-50">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" /> Reconciliation
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-amber-200">
                <span className="text-slate-600">Opening Balance</span>
                <span className="font-semibold text-slate-800">{formatCurrency(currentLiquidity.openingBalance)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-200">
                <span className="text-slate-600">Total Repayments (+)</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(stats.returnedToday)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-amber-200">
                <span className="text-slate-600">Total Loans Issued (-)</span>
                <span className="font-semibold text-red-600">{formatCurrency(stats.issuedToday)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-white/50 p-2 rounded border border-amber-200">
                <span className="font-bold text-slate-700">Expected Balance</span>
                <span className="font-bold text-slate-900">{formatCurrency(expectedBalance)}</span>
              </div>
              <div className="flex justify-between items-center py-3 pt-4">
                <span className="font-bold text-slate-800">Actual Discrepancy</span>
                <div className="text-right">
                  <p className={`text-lg font-black ${Math.abs(discrepancy) > 0.01 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(discrepancy)}
                  </p>
                  {Math.abs(discrepancy) > 0.01 && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 justify-end">
                      <AlertTriangle className="w-3 h-3" /> {discrepancy < 0 ? 'Shortage Detected' : 'Surplus Detected'}
                    </p>
                  )}
                  {Math.abs(discrepancy) <= 0.01 && (
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" /> Perfectly Reconciled
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-slate-400" /> Passive Balance
                </h3>
                <p className="text-xs text-slate-500">Fixed assets and long-term reserves</p>
              </div>
              {isPassiveLocked ? (
                <Badge color="slate"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>
              ) : (
                <Badge color="green"><Unlock className="w-3 h-3 mr-1" /> Open</Badge>
              )}
            </div>
            
            <div className="relative">
              <Input 
                label="Total Fixed Assets" 
                type="number" 
                value={currentLiquidity.passiveBalance} 
                onChange={e => handleChange('passiveBalance', e.target.value)} 
                disabled={isPassiveLocked}
                placeholder="0.00"
              />
              {isPassiveLocked && (
                <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>This field is locked for 30 days to ensure asset stability. Last updated: {new Date(currentLiquidity.passiveBalanceLastUpdated).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-blue-600 text-white border-none shadow-lg shadow-blue-200">
            <p className="text-blue-100 text-sm font-medium mb-1">Total Daily Operational Liquidity</p>
            <h2 className="text-3xl font-bold">{formatCurrency(totalOperationalLiquidity)}</h2>
            <p className="text-xs text-blue-200 mt-2 opacity-80">Sum of active balance and all outstanding team debt.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const DashboardView = ({ stats, formatCurrency, activeBalance }) => (
  <div className="space-y-6 pb-20">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Issued Today</p>
              <h2 className="text-2xl font-bold">{formatCurrency(stats.issuedToday)}</h2>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Repaid Today</p>
              <h2 className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.returnedToday)}</h2>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-900 text-white border-none">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">Active Balance</p>
              <h2 className="text-2xl font-bold text-blue-400">{formatCurrency(activeBalance)}</h2>
            </div>
            <div className="p-2 bg-slate-800 rounded-lg">
              <Banknote className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white border-blue-100">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Team Debt</p>
              <h2 className={`text-2xl font-bold ${stats.totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formatCurrency(stats.totalOutstanding)}
              </h2>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Wallet className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Card className="bg-blue-50 border-blue-100 p-5">
       <div className="flex justify-between items-center">
          <div>
             <p className="text-blue-600 text-sm font-bold uppercase tracking-wider">Total Operational Liquidity</p>
             <h2 className="text-3xl font-black text-blue-900">{formatCurrency(activeBalance + stats.totalOutstanding)}</h2>
          </div>
          <div className="text-right hidden md:block">
             <p className="text-xs text-blue-500 font-medium">Combined Capital</p>
             <p className="text-[10px] text-blue-400 italic">Active Balance + Outstanding Debt</p>
          </div>
       </div>
    </Card>
  </div>
);

export const AgentsView = ({ agents, agentBalances, openModal, fileInputRef, handleFileUpload, downloadTemplate, formatCurrency }) => (
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

export const ReportView = ({ agents, agentBalances, todaysTransactions, formatCurrency, today, setReportDate, PROVIDERS, settings, setSettings }) => {
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'cashbook'
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Calculate totals for the cashbook footer
  const cashbookTotals = todaysTransactions.reduce((acc, t) => {
    if (t.type === 'issue') {
      acc.totalDebit += t.amount;
    } else {
      acc.totalCredit += t.amount;
    }
    return acc;
  }, { totalDebit: 0, totalCredit: 0 });

  const netBalance = cashbookTotals.totalCredit - cashbookTotals.totalDebit;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-slate-800">
          {viewMode === 'summary' ? 'Daily Reconciliation' : 'Cashbook Report'}
        </h2>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            className="px-3 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={today}
            onChange={(e) => setReportDate(e.target.value)}
          />
          <div className="flex bg-slate-200 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'summary' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Summary
            </button>
            <button 
              onClick={() => setViewMode('cashbook')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'cashbook' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Cashbook
            </button>
          </div>
          <Button variant="outline" icon={Download} onClick={() => window.print()}>Print / PDF</Button>
        </div>
      </div>

      {viewMode === 'summary' ? (
        <>
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

          <h3 className="text-lg font-bold text-slate-800 mt-8 print:hidden">Transactions for {today}</h3>
          <div className="space-y-2 print:hidden">
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
                                            {agents.find(a => String(a.id) === String(t.agentId))?.name || 'Unknown Agent'}
                                          </p>                        {t.type === 'return' && (
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
        </>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm print:shadow-none print:border-none">
          {/* Header mimicking PDF */}
          <div className="p-4 sm:p-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 sm:gap-0">
              <div className="flex-1 w-full">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input 
                      autoFocus
                      className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight border-b-2 border-blue-500 outline-none w-full max-w-lg"
                      value={settings.reportName}
                      onChange={e => setSettings(prev => ({ ...prev, reportName: e.target.value }))}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)}
                    />
                  </div>
                ) : (
                  <div className="group flex items-center gap-3">
                    <h1 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">{settings.reportName || 'Float Cashbook'}</h1>
                    <button 
                      onClick={() => setIsEditingTitle(true)}
                      className="p-1 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all print:hidden"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-xs sm:text-slate-500 mt-1">{new Date(today).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Date Generated</p>
                <p className="text-xs sm:text-base font-mono text-slate-700">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1">Total Debit (-)</p>
                <p className="text-lg sm:text-xl font-bold text-red-600">{formatCurrency(cashbookTotals.totalDebit)}</p>
              </div>
              <div className="border-b sm:border-b-0 sm:border-r border-slate-200 py-3 sm:py-0 sm:px-4 text-left sm:text-center">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1">Total Credit (+)</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-600">{formatCurrency(cashbookTotals.totalCredit)}</p>
              </div>
              <div className="pt-3 sm:pt-0 sm:pl-4 text-left sm:text-right">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1">Net Balance</p>
                <p className={`text-lg sm:text-xl font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(netBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px] sm:min-w-full">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="px-3 sm:px-4 py-3 text-left font-bold text-slate-900 w-24 sm:w-32">Date</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-bold text-slate-900">Name</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-bold text-slate-900">Notes</th>
                  <th className="px-3 sm:px-4 py-3 text-right font-bold text-slate-900 w-24 sm:w-32">Debit (-)</th>
                  <th className="px-3 sm:px-4 py-3 text-right font-bold text-slate-900 w-24 sm:w-32">Credit (+)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {todaysTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">No transactions recorded for this period.</td>
                </tr>
              ) : (
                todaysTransactions.map((t) => {
                  const agentName = agents.find(a => String(a.id) === String(t.agentId))?.name || 'Unknown Agent';
                  const providerLabel = PROVIDERS.find(p => p.id === t.method)?.label || t.method;
                  const dateStr = new Date(t.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' });
                  const timeStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-3 sm:px-4 py-3 align-top">
                        <span className="block font-medium text-slate-700 text-xs sm:text-sm">{dateStr}</span>
                        <span className="block text-[10px] sm:text-xs text-slate-400">{timeStr}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 align-top font-medium text-slate-800 uppercase text-xs sm:text-sm">
                        {agentName}
                      </td>
                      <td className="px-3 sm:px-4 py-3 align-top text-slate-600 text-xs sm:text-sm">
                         {t.note ? (
                           <>
                             <span className="font-medium text-slate-800">{t.note}</span>
                             <span className="text-[10px] sm:text-xs text-slate-400 ml-1 sm:ml-2">({providerLabel})</span>
                           </>
                         ) : (
                           <span className="italic text-slate-400">{providerLabel}</span>
                         )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 align-top text-right font-mono text-red-600 text-xs sm:text-sm">
                        {t.type === 'issue' ? formatCurrency(t.amount).replace('GMD', '') : '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-3 align-top text-right font-mono text-emerald-600 text-xs sm:text-sm">
                        {t.type !== 'issue' ? formatCurrency(t.amount).replace('GMD', '') : '-'}
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
};

export const OperatorsView = ({ 
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
