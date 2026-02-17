import { useState, useEffect, useMemo } from 'react';
import { generateId } from '../utils/crypto';

export const useFloatData = (rootId) => {
  const [agents, setAgents] = useState(() => {
    const saved = localStorage.getItem(`float_agents_${rootId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(`float_tx_${rootId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [liquidity, setLiquidity] = useState(() => {
    const saved = localStorage.getItem(`float_liquidity_${rootId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(`float_settings_${rootId}`);
    return saved ? JSON.parse(saved) : { reportName: 'Float Cashbook' };
  });

  useEffect(() => {
    localStorage.setItem(`float_agents_${rootId}`, JSON.stringify(agents));
  }, [agents, rootId]);

  useEffect(() => {
    localStorage.setItem(`float_tx_${rootId}`, JSON.stringify(transactions));
  }, [transactions, rootId]);

  useEffect(() => {
    localStorage.setItem(`float_liquidity_${rootId}`, JSON.stringify(liquidity));
  }, [liquidity, rootId]);

  useEffect(() => {
    localStorage.setItem(`float_settings_${rootId}`, JSON.stringify(settings));
  }, [settings, rootId]);

  const today = new Date().toISOString().split('T')[0];
  const [reportDate, setReportDate] = useState(today);

  const currentLiquidity = useMemo(() => {
    const defaultLiquidity = {
      openingBalances: {
        bank: 0, wave: 0, aps: 0, orange: 0, nafa: 0, westernUnion: 0, cash: 0
      },
      openingBalance: 0, // Total opening balance for backward compatibility/legacy views
      bank: 0,
      wave: 0,
      aps: 0,
      orange: 0,
      nafa: 0,
      westernUnion: 0,
      cash: 0,
      passiveBalance: 0,
      passiveBalanceLastUpdated: null,
      closingBalance: 0,
      reconciliationNotes: '',
      isPassiveUnlockOverride: false
    };
    const rawData = liquidity[today] || {};
    const data = { ...defaultLiquidity, ...rawData };
    
    // Ensure openingBalances object exists and is merged correctly
    data.openingBalances = { 
      ...defaultLiquidity.openingBalances, 
      ...(rawData.openingBalances || {}) 
    };

    // Derived total opening balance for backward compatibility
    data.openingBalance = Object.values(data.openingBalances).reduce((sum, val) => sum + (val || 0), 0);
    
    return data;
  }, [liquidity, today]);

  const activeBalance = useMemo(() => {
    const l = currentLiquidity;
    return (l.bank || 0) + (l.wave || 0) + (l.aps || 0) + (l.orange || 0) + (l.nafa || 0) + (l.westernUnion || 0) + (l.cash || 0);
  }, [currentLiquidity]);

  const updateLiquidity = (data) => {
    setLiquidity(prev => {
      const current = prev[today] || {
        openingBalances: { bank: 0, wave: 0, aps: 0, orange: 0, nafa: 0, westernUnion: 0, cash: 0 },
        openingBalance: 0,
        bank: 0, wave: 0, aps: 0, orange: 0, nafa: 0, westernUnion: 0, cash: 0,
        passiveBalance: 0, passiveBalanceLastUpdated: null,
        closingBalance: 0, reconciliationNotes: '',
        isPassiveUnlockOverride: false
      };

      // Handle nested openingBalances if provided
      const updated = { ...current, ...data };
      if (data.openingBalances) {
        updated.openingBalances = { ...current.openingBalances, ...data.openingBalances };
      }
      
      // If passiveBalance is changed, update timestamp
      if (data.passiveBalance !== undefined && data.passiveBalance !== current.passiveBalance) {
        updated.passiveBalanceLastUpdated = new Date().toISOString();
      }

      return {
        ...prev,
        [today]: updated
      };
    });
  };

  const todaysTransactions = useMemo(() => {
    return transactions.filter(t => t.date === today);
  }, [transactions, today]);

  const reportTransactions = useMemo(() => {
    return transactions.filter(t => t.date === reportDate);
  }, [transactions, reportDate]);

  const agentBalances = useMemo(() => {
    const balances = {};
    agents.forEach(a => {
      balances[a.id] = { prevDebt: 0, issuedToday: 0, returnedToday: 0, totalDue: 0 };
    });

    transactions.forEach(t => {
      const agent = balances[t.agentId];
      if (!agent) return;

      const amount = parseFloat(t.amount) || 0;

      if (t.date === today) {
        if (t.type === 'issue') agent.issuedToday += amount;
        if (t.type === 'return') agent.returnedToday += amount;
      } else if (t.date < today) {
        if (t.type === 'issue') agent.prevDebt += amount;
        if (t.type === 'return') agent.prevDebt -= amount;
      }
    });

    Object.values(balances).forEach(b => {
      b.prevDebt = Math.round(b.prevDebt * 100) / 100;
      b.totalDue = Math.round((b.prevDebt + b.issuedToday - b.returnedToday) * 100) / 100;
    });

    return balances;
  }, [transactions, agents, today]);

  const reportBalances = useMemo(() => {
    const balances = {};
    agents.forEach(a => {
      balances[a.id] = { prevDebt: 0, issuedToday: 0, returnedToday: 0, totalDue: 0 };
    });

    transactions.forEach(t => {
      const agent = balances[t.agentId];
      if (!agent) return;

      const amount = parseFloat(t.amount) || 0;

      if (t.date === reportDate) {
        if (t.type === 'issue') agent.issuedToday += amount;
        if (t.type === 'return') agent.returnedToday += amount;
      } else if (t.date < reportDate) {
        if (t.type === 'issue') agent.prevDebt += amount;
        if (t.type === 'return') agent.prevDebt -= amount;
      }
    });

    Object.values(balances).forEach(b => {
      b.prevDebt = Math.round(b.prevDebt * 100) / 100;
      b.totalDue = Math.round((b.prevDebt + b.issuedToday - b.returnedToday) * 100) / 100;
    });

    return balances;
  }, [transactions, agents, reportDate]);

  const stats = useMemo(() => {
    let issuedToday = 0;
    let returnedToday = 0;
    let totalOutstanding = 0;
    
    const channelStats = {
      bank: { in: 0, out: 0 },
      wave: { in: 0, out: 0 },
      aps: { in: 0, out: 0 },
      orange: { in: 0, out: 0 },
      nafa: { in: 0, out: 0 },
      westernUnion: { in: 0, out: 0 },
      cash: { in: 0, out: 0 }
    };

    // totalOutstanding still comes from agents
    Object.values(agentBalances).forEach(b => {
      totalOutstanding += b.totalDue;
    });

    // Sum ALL transactions for today for global totals and per-channel totals
    todaysTransactions.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      
      // Global totals
      if (t.type === 'issue') issuedToday += amount;
      if (t.type === 'return') returnedToday += amount;

      // Channel specific
      if (channelStats[t.method]) {
        if (t.type === 'issue') channelStats[t.method].out += amount;
        if (t.type === 'return') channelStats[t.method].in += amount;
      }
    });

    return { issuedToday, returnedToday, totalOutstanding, channelStats };
  }, [agentBalances, todaysTransactions]);

  const addAgent = (name, location, phone) => {
    const newAgent = {
      id: generateId(),
      name,
      location,
      phone
    };
    setAgents(prev => [...prev, newAgent]);
  };

  const addTransaction = (txData) => {
    const newTx = {
      ...txData,
      id: generateId(),
      date: today,
      timestamp: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const closeDay = (discrepancyNotes = '') => {
    setLiquidity(prev => {
      const currentData = prev[today] || {};
      const updatedCurrentDay = {
        ...currentData,
        closingBalance: activeBalance,
        reconciliationNotes: discrepancyNotes,
      };

      // Calculate tomorrow's date
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Set tomorrow's opening balances to today's ACTUAL balances
      const nextDayOpeningBalances = {
        bank: currentData.bank || 0,
        wave: currentData.wave || 0,
        aps: currentData.aps || 0,
        orange: currentData.orange || 0,
        nafa: currentData.nafa || 0,
        westernUnion: currentData.westernUnion || 0,
        cash: currentData.cash || 0
      };

      const updatedTomorrow = {
        ...(prev[tomorrowStr] || {}),
        openingBalances: nextDayOpeningBalances,
        openingBalance: activeBalance, // Total carry over
        isPassiveUnlockOverride: false,
      };

      return {
        ...prev,
        [today]: updatedCurrentDay,
        [tomorrowStr]: updatedTomorrow,
      };
    });
  };

  const togglePassiveUnlockOverride = () => {
    setLiquidity(prev => ({
      ...prev,
      [today]: {
        ...prev[today],
        isPassiveUnlockOverride: !prev[today]?.isPassiveUnlockOverride,
      },
    }));
  };

  const createAdjustment = (method, diff, note = 'Reconciliation Adjustment') => {
    if (Math.abs(diff) < 0.01) return;

    setTransactions(prev => {
      // Find if an adjustment exists in the latest state
      const existingAdj = prev.find(t => 
        t.date === today && 
        t.agentId === 'SYSTEM' && 
        t.method === method && 
        t.category === 'adjustment'
      );

      if (existingAdj) {
        const currentSignedAmount = existingAdj.type === 'return' ? existingAdj.amount : -existingAdj.amount;
        const newSignedAmount = currentSignedAmount + diff;

        if (Math.abs(newSignedAmount) < 0.01) {
          // Remove it if no longer needed
          return prev.filter(t => t.id !== existingAdj.id);
        }

        // Update it
        return prev.map(t => t.id === existingAdj.id ? {
          ...t,
          amount: Math.abs(newSignedAmount),
          type: newSignedAmount > 0 ? 'return' : 'issue',
          timestamp: new Date().toISOString()
        } : t);
      } else {
        // Create new one
        const adjTx = {
          id: generateId(),
          date: today,
          timestamp: new Date().toISOString(),
          agentId: 'SYSTEM',
          type: diff > 0 ? 'return' : 'issue',
          category: 'adjustment',
          amount: Math.abs(diff),
          method,
          note,
          performedBy: 'System'
        };
        return [adjTx, ...prev];
      }
    });
  };

  return {
    agents,
    setAgents,
    transactions,
    todaysTransactions,
    reportTransactions,
    agentBalances,
    reportBalances,
    stats,
    today,
    reportDate,
    setReportDate,
    addAgent,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    closeDay,
    togglePassiveUnlockOverride,
    createAdjustment,
    currentLiquidity,
    activeBalance,
    updateLiquidity,
    settings,
    setSettings
  };
};
