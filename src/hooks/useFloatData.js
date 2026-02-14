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

  useEffect(() => {
    localStorage.setItem(`float_agents_${rootId}`, JSON.stringify(agents));
  }, [agents, rootId]);

  useEffect(() => {
    localStorage.setItem(`float_tx_${rootId}`, JSON.stringify(transactions));
  }, [transactions, rootId]);

  const today = new Date().toISOString().split('T')[0];

  const todaysTransactions = useMemo(() => {
    return transactions.filter(t => t.date === today);
  }, [transactions, today]);

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
      b.totalDue = Math.round((b.prevDebt + b.issuedToday - b.returnedToday) * 100) / 100;
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

  return {
    agents,
    setAgents,
    transactions,
    todaysTransactions,
    agentBalances,
    stats,
    today,
    addAgent,
    addTransaction
  };
};
