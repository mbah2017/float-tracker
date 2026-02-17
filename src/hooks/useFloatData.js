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
      openingBalance: 0,
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
    return liquidity[today] || defaultLiquidity;
  }, [liquidity, today]);

  const activeBalance = useMemo(() => {
    const l = currentLiquidity;
    return l.bank + l.wave + l.aps + l.orange + l.nafa + l.westernUnion + l.cash;
  }, [currentLiquidity]);

  const updateLiquidity = (data) => {
    setLiquidity(prev => {
      const current = prev[today] || {
        openingBalance: 0,
        bank: 0, wave: 0, aps: 0, orange: 0, nafa: 0, westernUnion: 0, cash: 0,
        passiveBalance: 0, passiveBalanceLastUpdated: null,
        closingBalance: 0, reconciliationNotes: '',
        isPassiveUnlockOverride: false
      };

      const updated = { ...current, ...data };
      
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

      if (t.date === today) {
        if (t.type === 'issue') agent.issuedToday += t.amount;
        if (t.type === 'return') agent.returnedToday += t.amount;
      } else if (t.date < today) {
        if (t.type === 'issue') agent.prevDebt += t.amount;
        if (t.type === 'return') agent.prevDebt -= t.amount;
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

      if (t.date === reportDate) {
        if (t.type === 'issue') agent.issuedToday += t.amount;
        if (t.type === 'return') agent.returnedToday += t.amount;
      } else if (t.date < reportDate) {
        if (t.type === 'issue') agent.prevDebt += t.amount;
        if (t.type === 'return') agent.prevDebt -= t.amount;
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

    Object.values(agentBalances).forEach(b => {
      issuedToday += b.issuedToday;
      returnedToday += b.returnedToday;
      totalOutstanding += b.totalDue;
    });

    return { issuedToday, returnedToday, totalOutstanding };
  }, [agentBalances]);

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

  const closeDay = (discrepancyNotes = '') => {
    setLiquidity(prev => {
      const updatedCurrentDay = {
        ...prev[today],
        closingBalance: activeBalance,
        reconciliationNotes: discrepancyNotes,
      };

      // Calculate tomorrow's date
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Set tomorrow's opening balance to today's closing balance
      const updatedTomorrow = {
        ...prev[tomorrowStr],
        openingBalance: activeBalance, // Carry over active balance as next day's opening
        // Ensure that isPassiveUnlockOverride is reset for tomorrow
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
    closeDay,
    togglePassiveUnlockOverride,
    currentLiquidity,
    activeBalance,
    updateLiquidity,
    settings,
    setSettings
  };
};
