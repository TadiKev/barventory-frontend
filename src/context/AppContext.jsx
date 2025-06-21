// src/context/AppContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// In dev, use empty so Vite proxy handles it; in prod, use your Render URL
axios.defaults.baseURL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_URL;

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  // Pull user & token from AuthContext
  const { user, token } = useContext(AuthContext);

  // Helper to build Axios config with JWT + any overrides
  const makeConfig = (overrides = {}) => ({
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    ...overrides
  });


  // ─── Bars & Current Bar ───
  const [bars, setBars] = useState([]);
  const [currentBar, setCurrentBar] = useState(() =>
    window.localStorage.getItem('currentBar') || 'all'
  );
  useEffect(() => {
    window.localStorage.setItem('currentBar', currentBar);
  }, [currentBar]);

  // ─── Selected Date ───
  const [selectedDate, setSelectedDate] = useState(() =>
    window.localStorage.getItem('selectedDate') ||
    new Date().toISOString().slice(0, 10)
  );
  useEffect(() => {
    window.localStorage.setItem('selectedDate', selectedDate);
  }, [selectedDate]);

  // ─── Cash Count (uses selectedDate, currentBar) ───
  const [cashCount, setCashCount] = useState(() => {
    const key = `cashCount-${currentBar}-${selectedDate}`;
    return Number(window.localStorage.getItem(key)) || 0;
  });
  useEffect(() => {
    const key = `cashCount-${currentBar}-${selectedDate}`;
    setCashCount(Number(window.localStorage.getItem(key)) || 0);
  }, [currentBar, selectedDate]);
  const saveCashCount = (amt) => {
    const key = `cashCount-${currentBar}-${selectedDate}`;
    window.localStorage.setItem(key, amt);
    setCashCount(amt);
  };

  // ─── Data Stores ───
  const [products, setProducts]       = useState([]);
  const [inventory, setInventory]     = useState([]);
  const [transfers, setTransfers]     = useState([]);
  const [ledger, setLedger]           = useState([]);
  const [report, setReport]           = useState(null);
  const [summaryData, setSummaryData] = useState({
    revenue: 0, cost: 0, profit: 0,
    openingStock: 0, received: 0, sales: 0,
    lowStockCount: 0,
  });
  const [dailySummary, setDailySummary]     = useState([]);
  const [weeklySummary, setWeeklySummary]   = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [transactions, setTransactions]     = useState([]);
  const [expenses, setExpenses]             = useState([]);

  // ─── Loading & Error ───
  const [loading, setLoading] = useState({
    bars: false, createBar: false, updateBar: false, deleteBar: false,
    products: false, createProduct: false, updateProduct: false, deleteProduct: false,
    transfers: false, inventory: false,
    transactions: false,
    expenses: false, createExpense: false, updateExpense: false, deleteExpense: false,
    ledger: false, report: false,
    summary: false, daily: false, weekly: false, monthly: false,
  });
  const [error, setError] = useState({
    bars: null, createBar: null, updateBar: null, deleteBar: null,
    products: null, createProduct: null, updateProduct: null, deleteProduct: null,
    transfers: null, inventory: null,
    transactions: null,
    expenses: null, createExpense: null, updateExpense: null, deleteExpense: null,
    ledger: null, report: null,
    summary: null, daily: null, weekly: null, monthly: null,
  });

  // ─── BAR CRUD ───
  const fetchBars = async () => {
    setLoading(l => ({ ...l, bars: true }));
    try {
      const { data } = await axios.get('/api/bars');
      setBars(data);
      if (data.length && currentBar === 'all') setCurrentBar(data[0]._id);
      setError(e => ({ ...e, bars: null }));
    } catch (err) {
      setError(e => ({ ...e, bars: err.message }));
    } finally {
      setLoading(l => ({ ...l, bars: false }));
    }
  };

  const fetchReport = useCallback(async (from, to) => {
  setLoading(l => ({ ...l, report: true }));
  try {
    const { data } = await axios.get('/api/reports/income-statement', {
      params: { barId: currentBar, from, to },
      headers: { Authorization: `Bearer ${token}` }
    });
    setReport(data);
    setError(e => ({ ...e, report: null }));
    return data;
  } catch (err) {
    setError(e => ({ ...e, report: err.message }));
    throw err;
  } finally {
    setLoading(l => ({ ...l, report: false }));
  }
}, [currentBar, token]);

  const createBar = async ({ name, location }) => {
    setLoading(l => ({ ...l, createBar: true }));
    try {
      const { data } = await axios.post('/api/bars', { name, location });
      setBars(prev => [...prev, data]);
      setError(e => ({ ...e, createBar: null }));
    } catch (err) {
      setError(e => ({ ...e, createBar: err.message }));
    } finally {
      setLoading(l => ({ ...l, createBar: false }));
    }
  };

  const updateBar = async (barId, updates) => {
    setLoading(l => ({ ...l, updateBar: true }));
    try {
      const { data } = await axios.put(`/api/bars/${barId}`, updates);
      setBars(prev => prev.map(b => b._id === barId ? data : b));
      setError(e => ({ ...e, updateBar: null }));
    } catch (err) {
      setError(e => ({ ...e, updateBar: err.message }));
    } finally {
      setLoading(l => ({ ...l, updateBar: false }));
    }
  };

  const deleteBar = async (barId) => {
    setLoading(l => ({ ...l, deleteBar: true }));
    try {
      await axios.delete(`/api/bars/${barId}`);
      setBars(prev => prev.filter(b => b._id !== barId));
      if (currentBar === barId) {
        const next = bars.find(b => b._id !== barId);
        setCurrentBar(next?._id || 'all');
      }
      setError(e => ({ ...e, deleteBar: null }));
    } catch (err) {
      setError(e => ({ ...e, deleteBar: err.message }));
    } finally {
      setLoading(l => ({ ...l, deleteBar: false }));
    }
  };

  // ─── PRODUCT CRUD ───
  const fetchProducts = async (page = 1, pageSize = 1000) => {
    setLoading(l => ({ ...l, products: true }));
    try {
      const res = await axios.get('/api/products', {
        params: { bar: currentBar, page, pageSize }
      });
      setProducts(Array.isArray(res.data.products) ? res.data.products : []);
      setError(e => ({ ...e, products: null }));
    } catch (err) {
      setError(e => ({ ...e, products: err.message }));
    } finally {
      setLoading(l => ({ ...l, products: false }));
    }
  };

  const createProduct = async (prod) => {
    setLoading(l => ({ ...l, createProduct: true }));
    try {
      const { data } = await axios.post('/api/products', { ...prod, bar: currentBar });
      setProducts(p => [...p, data]);
      setError(e => ({ ...e, createProduct: null }));
      return data;
    } catch (err) {
      setError(e => ({ ...e, createProduct: err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, createProduct: false }));
    }
  };

  const updateProduct = async (id, updates) => {
    setLoading(l => ({ ...l, updateProduct: true }));
    try {
      const { data } = await axios.put(`/api/products/${id}`, updates);
      setProducts(p => p.map(x => x._id === id ? data : x));
      setError(e => ({ ...e, updateProduct: null }));
      return data;
    } catch (err) {
      setError(e => ({ ...e, updateProduct: err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, updateProduct: false }));
    }
  };

  const deleteProduct = async (id) => {
    setLoading(l => ({ ...l, deleteProduct: true }));
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      setError(e => ({ ...e, deleteProduct: null }));
    } catch (err) {
      setError(e => ({ ...e, deleteProduct: err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, deleteProduct: false }));
    }
  };

    // ─── INVENTORY CRUD ───

  const fetchInventory = useCallback(
    async (barId = currentBar, date = selectedDate) => {
      setLoading(l => ({ ...l, inventory: true }));
      try {
        // GET /api/inventory?barId=...&date=...
        const res = await axios.get(
          '/api/inventory',
          makeConfig({ params: { barId, date } })
        );
        setInventory(res.data.data);
        setError(e => ({ ...e, inventory: null }));
        return res.data;
      } catch (err) {
        setError(e => ({ ...e, inventory: err.message }));
        throw err;
      } finally {
        setLoading(l => ({ ...l, inventory: false }));
      }
    },
    [currentBar, selectedDate, token]
  );

  const upsertInventory = async ({ barId, productId, date, opening, inQty, outQty, manualClosing }) => {
    setLoading(l => ({ ...l, inventory: true }));
    try {
      if (!token) throw new Error('Not authorized');
      const payload = { barId, productId, date, opening, inQty, outQty, manualClosing };
      // POST /api/inventory
      const { data } = await axios.post(
        '/api/inventory',
        payload,
        makeConfig()
      );
      // Refresh the list
      await fetchInventory(barId, date);
      setError(e => ({ ...e, inventory: null }));
      return data;
    } catch (err) {
      setError(e => ({ ...e, inventory: err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, inventory: false }));
    }
  };

    // ─── INVENTORY CRUD ───

  // ...

  const bulkUpsertInventory = async (barId, date, items) => {
    setLoading(l => ({ ...l, inventory: true }));
    try {
      if (!token) throw new Error('Not authorized');
      const payload = { barId, date, items };
      // POST /api/inventory/bulk-upsert
      const { data } = await axios.post(
        '/api/inventory/bulk-upsert',
        payload,
        makeConfig()
      );
      // Merge updated rows back into state, guarding against any null product objects
      setInventory(prev => {
        const byId = {};
        prev.forEach(r => {
          const pid = r.product?._id;
          if (pid) byId[pid] = r;
        });
        data.updated.forEach(r => {
          const pid = r.product?._id;
          if (pid) byId[pid] = r;
        });
        return Object.values(byId);
      });
      setError(e => ({ ...e, inventory: null }));
      return data.updated;
    } catch (err) {
      setError(e => ({ ...e, inventory: err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, inventory: false }));
    }
  };


  // ─── EXPENSES CRUD ───
const fetchExpenses = useCallback(async (barId, from, to) => {
    setLoading(l => ({ ...l, expenses: true }));
    try {
      const res = await axios.get(
        '/api/expenses',
        makeConfig({ params: { barId, from, to } })
      );
      setExpenses(res.data);
      setError(e => ({ ...e, expenses: null }));
      return res.data;
    } catch (err) {
      setError(e => ({ ...e, expenses: err.response?.data?.error || err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, expenses: false }));
    }
  }, [token]);

  const createExpense = async ({ barId, category, amount, date, notes }) => {
    setLoading(l => ({ ...l, createExpense: true }));
    try {
      const res = await axios.post(
        '/api/expenses',
        { barId, category, amount, date, notes },
        makeConfig()
      );
      // append new one in UI
      setExpenses(prev => [...prev, res.data]);
      setError(e => ({ ...e, createExpense: null }));
      return res.data;
    } catch (err) {
      setError(e => ({ ...e, createExpense: err.response?.data?.error || err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, createExpense: false }));
    }
  };


  // ─── UPDATE EXPENSE ───
  const updateExpense = async (id, { category, amount, date, notes }) => {
    setLoading(l => ({ ...l, updateExpense: true }));
    try {
      const res = await axios.put(
        `/api/expenses/${id}`,
        { category, amount, date, notes },
        makeConfig()
      );
      // replace in state
      setExpenses(prev =>
        prev.map(x => (x._id === id ? res.data : x))
      );
      setError(e => ({ ...e, updateExpense: null }));
      return res.data;
    } catch (err) {
      setError(e => ({ ...e, updateExpense: err.response?.data?.error || err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, updateExpense: false }));
    }
  };

  // ─── DELETE EXPENSE ───
  const deleteExpense = async id => {
    setLoading(l => ({ ...l, deleteExpense: true }));
    try {
      await axios.delete(
        `/api/expenses/${id}`,
        makeConfig()
      );
      // remove from state
      setExpenses(prev => prev.filter(x => x._id !== id));
      setError(e => ({ ...e, deleteExpense: null }));
    } catch (err) {
      setError(e => ({ ...e, deleteExpense: err.response?.data?.error || err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, deleteExpense: false }));
    }
  };


  // ─── TRANSFERS CRUD ───
  const requestTransfer = async ({ productId, qty, fromBar, toBar }) => {
    if (!token) throw new Error('Not authorized');
    const dateStr = selectedDate;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(
      '/api/transfers',
      { productId, qty, fromBar, toBar, date: dateStr },
      config
    );
    return data;
  };

  const fetchTransfers = useCallback(async (status='pending') => {
    setLoading(l => ({ ...l, transfers: true }));
    try {
      if (!token) throw new Error('Not authorized');
      const config = { headers:{ Authorization:`Bearer ${token}` }, params:{status} };
      const { data } = await axios.get('/api/transfers', config);
      setTransfers(data);
      setError(e => ({...e, transfers:null}));
      return data;
    } catch (err) {
      setError(e => ({...e, transfers:err.message}));
      throw err;
    } finally {
      setLoading(l => ({ ...l, transfers: false }));
    }
  }, [token]);

  const deleteTransfer = useCallback(async (id) => {
    await axios.delete(`/api/transfers/${id}`);
    return fetchTransfers();
  }, [fetchTransfers]);

   // TRANSACTIONS CRUD
  const fetchTransactions = useCallback(async (from, to) => {
    setLoading(l=>({...l,transactions:true}));
    try {
      if(!token) throw new Error('Not authorized');
      const cfg={headers:{Authorization:`Bearer ${token}`},params:{barId:currentBar,from,to}};
      const { data } = await axios.get('/api/transactions',cfg);
      setTransactions(data);
      setError(e=>({...e,transactions:null}));
      return data;
    } catch(err){
      setError(e=>({...e,transactions:err.message}));
      throw err;
    } finally {
      setLoading(l=>({...l,transactions:false}));
    }
  },[token, currentBar]);

  const approveTransfer = async (id) => {
    if (!token) throw new Error('Not authorized');
    const config = { headers:{ Authorization:`Bearer ${token}` } };
    const { data } = await axios.put(
      `/api/transfers/${id}/approve`,
      { date: selectedDate },
      config
    );
    setTransfers(prev => prev.map(t => t._id===id ? data : t));
    return data;
  };

  const rejectTransfer = async (id) => {
    if (!token) throw new Error('Not authorized');
    const config = { headers:{ Authorization:`Bearer ${token}` } };
    const { data } = await axios.put(`/api/transfers/${id}/reject`, {}, config);
    setTransfers(prev => prev.map(t => t._id===id ? data : t));
    return data;
  };

  // ─── AUTO FETCH ───
  useEffect(() => { fetchBars(); }, []);
  useEffect(() => {
    if (currentBar && currentBar!=='all' && selectedDate) {
      fetchProducts();
      fetchInventory();
    }
  }, [currentBar, selectedDate]);

  return (
  <AppContext.Provider value={{
    bars,
    currentBar,
    setCurrentBar,
    selectedDate,
    setSelectedDate,
    products,
    inventory,
    transfers,
    cashCount,
    setCashCount,
    saveCashCount,
    ledger,
    report,
    summaryData,
    dailySummary,
    weeklySummary,
    monthlySummary,
    transactions,
    expenses,
    loading,
    error,
    fetchTransactions,
    fetchBars,
    fetchReport,
    createBar,
    updateBar,
    deleteBar,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchInventory,
    upsertInventory,
    bulkUpsertInventory,
    fetchTransfers,
    requestTransfer,
    approveTransfer,
    rejectTransfer,
    deleteTransfer,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  }}>
    {children}
  </AppContext.Provider>
);

}
