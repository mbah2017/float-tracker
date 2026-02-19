import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateId } from '../utils/crypto';

export const useFloatData = (rootId) => {
  const [agents, setAgents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [liquidity, setLiquidity] = useState({});
  const [settings, setSettings] = useState({ reportName: 'Float Cashbook' });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [reportDate, setReportDate] = useState(today);

  // 1. Sync Agents
  useEffect(() => {
    if (!rootId) return;
    const q = query(collection(db, 'businesses', rootId, 'agents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(agentsData);
    });
    return () => unsubscribe();
  }, [rootId]);

  // 2. Sync Transactions
  useEffect(() => {
    if (!rootId) return;
    const q = query(
      collection(db, 'businesses', rootId, 'transactions'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txData);
    });
    return () => unsubscribe();
  }, [rootId]);

  // 3. Sync Liquidity
  useEffect(() => {
    if (!rootId) return;
    const q = query(collection(db, 'businesses', rootId, 'liquidity'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liqData = {};
      snapshot.docs.forEach(doc => {
        liqData[doc.id] = doc.data();
      });
      setLiquidity(liqData);
    });
    return () => unsubscribe();
  }, [rootId]);

  // 4. Sync Settings
  useEffect(() => {
    if (!rootId) return;
    const docRef = doc(db, 'businesses', rootId, 'config', 'settings');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    });
    return () => unsubscribe();
  }, [rootId]);

  const currentLiquidity = useMemo(() => {
    const defaultBalances = {
      bank: 0, wave: 0, aps: 0, orange: 0, nafa: 0, westernUnion: 0, cash: 0
    };
    const defaultLiquidity = {
      openingBalances: defaultBalances,
      actualBalances: defaultBalances,
      openingBalance: 0,
      passiveBalance: 0,
      passiveBalanceLastUpdated: null,
      closingBalance: null,
      reconciliationNotes: '',
      isPassiveUnlockOverride: false
    };
    const rawData = liquidity[today] || {};
    const data = { ...defaultLiquidity, ...rawData };
    
    data.openingBalances = { 
      ...defaultBalances, 
      ...(rawData.openingBalances || {}) 
    };
    data.actualBalances = {
      ...defaultBalances,
      ...(rawData.actualBalances || {})
    };

    data.openingBalance = Object.values(data.openingBalances).reduce((sum, val) => sum + (val || 0), 0);
    
    return data;
  }, [liquidity, today]);

  const activeBalance = useMemo(() => {
    const l = currentLiquidity;
    return Object.values(l.actualBalances).reduce((sum, val) => sum + (val || 0), 0);
  }, [currentLiquidity]);

  const updateLiquidity = async (data) => {
    const docRef = doc(db, 'businesses', rootId, 'liquidity', today);
    const current = liquidity[today] || {};
    
    const updated = { ...current, ...data };
    
    if (data.openingBalances) {
      updated.openingBalances = { ...(current.openingBalances || {}), ...data.openingBalances };
    }

    if (data.actualBalances) {
      updated.actualBalances = { ...(current.actualBalances || {}), ...data.actualBalances };
    }
    
    if (data.passiveBalance !== undefined && data.passiveBalance !== current.passiveBalance) {
      updated.passiveBalanceLastUpdated = new Date().toISOString();
    }

    await setDoc(docRef, updated, { merge: true });
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

    Object.values(agentBalances).forEach(b => {
      totalOutstanding += b.totalDue;
    });

    todaysTransactions.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      
      if (t.type === 'issue') issuedToday += amount;
      if (t.type === 'return') returnedToday += amount;

      if (channelStats[t.method]) {
        if (t.type === 'issue') channelStats[t.method].out += amount;
        if (t.type === 'return') channelStats[t.method].in += amount;
      }
    });

    return { issuedToday, returnedToday, totalOutstanding, channelStats };
  }, [agentBalances, todaysTransactions]);

  const addAgent = async (name, location, phone) => {
    const colRef = collection(db, 'businesses', rootId, 'agents');
    await addDoc(colRef, {
      name,
      location,
      phone,
      createdAt: serverTimestamp()
    });
  };

  const addTransaction = async (txData) => {
    const colRef = collection(db, 'businesses', rootId, 'transactions');
    await addDoc(colRef, {
      ...txData,
      date: today,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
  };

  const updateTransaction = async (id, updatedData) => {
    const docRef = doc(db, 'businesses', rootId, 'transactions', id);
    await updateDoc(docRef, updatedData);
  };

  const deleteTransaction = async (id) => {
    const docRef = doc(db, 'businesses', rootId, 'transactions', id);
    await deleteDoc(docRef);
  };

  const closeDay = async (discrepancyNotes = '') => {
    const currentActiveBalance = activeBalance;
    
    // Update current day
    await updateLiquidity({
      closingBalance: currentActiveBalance,
      reconciliationNotes: discrepancyNotes,
    });

    // Prepare tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const tomorrowRef = doc(db, 'businesses', rootId, 'liquidity', tomorrowStr);
    await setDoc(tomorrowRef, {
      openingBalances: currentLiquidity.actualBalances,
      openingBalance: currentActiveBalance,
      isPassiveUnlockOverride: false,
    }, { merge: true });
  };

  const togglePassiveUnlockOverride = async () => {
    const docRef = doc(db, 'businesses', rootId, 'liquidity', today);
    await updateDoc(docRef, {
      isPassiveUnlockOverride: !currentLiquidity.isPassiveUnlockOverride
    });
  };

  const createAdjustment = async (method, diff, note = 'Reconciliation Adjustment') => {
    if (Math.abs(diff) < 0.01) return;

    const existingAdj = transactions.find(t => 
      t.date === today && 
      t.agentId === 'SYSTEM' && 
      t.method === method && 
      t.category === 'adjustment'
    );

    if (existingAdj) {
      const currentSignedAmount = existingAdj.type === 'return' ? existingAdj.amount : -existingAdj.amount;
      const newSignedAmount = currentSignedAmount + diff;

      if (Math.abs(newSignedAmount) < 0.01) {
        await deleteTransaction(existingAdj.id);
      } else {
        await updateTransaction(existingAdj.id, {
          amount: Math.abs(newSignedAmount),
          type: newSignedAmount > 0 ? 'return' : 'issue',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      await addTransaction({
        agentId: 'SYSTEM',
        type: diff > 0 ? 'return' : 'issue',
        category: 'adjustment',
        amount: Math.abs(diff),
        method,
        note,
        performedBy: 'System'
      });
    }
  };

  const setBusinessSettings = async (newSettings) => {
    const docRef = doc(db, 'businesses', rootId, 'config', 'settings');
    await setDoc(docRef, newSettings, { merge: true });
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
    setSettings: setBusinessSettings
  };
};
