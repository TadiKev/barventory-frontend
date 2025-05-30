// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';


// In dev, use empty so Vite proxy handles it; in prod, use your Render URL
axios.defaults.baseURL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_URL;

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  // — Selected bar (persisted) —
  const [bars, setBars] = useState([]);
  const [currentBar, setCurrentBar] = useState(() => {
    return window.localStorage.getItem('currentBar') || 'all';
  });

  // — Selected date (persisted) —
  const [selectedDate, setSelectedDate] = useState(() => {
    return (
      window.localStorage.getItem('selectedDate') ||
      new Date().toISOString().slice(0, 10)
    );
  });

  // Persist bar
  useEffect(() => {
    if (currentBar) {
      window.localStorage.setItem('currentBar', currentBar);
    }
  }, [currentBar]);

  // Persist date
  useEffect(() => {
    window.localStorage.setItem('selectedDate', selectedDate);
  }, [selectedDate]);

  // — Data stores —
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [report, setReport] = useState(null);
  const [summaryData, setSummaryData] = useState({
    revenue: 0,
    cost: 0,
    profit: 0,
    openingStock: 0,
    received: 0,
    sales: 0,
    lowStockCount: 0,
  });
  const [dailySummary, setDailySummary] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // — Loading & error flags —
  const [loading, setLoading] = useState({
    bars: false,
    createBar: false,
    updateBar: false,
    deleteBar: false,
    products: false,
    createProduct: false,
    updateProduct: false,
    deleteProduct: false,
    inventory: false,
    transactions: false,
    expenses: false,
    createExpense: false,
    updateExpense: false,
    deleteExpense: false,
    ledger: false,
    report: false,
    summary: false,
    daily: false,
    weekly: false,
    monthly: false,
  });
  const [error, setError] = useState({
    bars: null,
    createBar: null,
    updateBar: null,
    deleteBar: null,
    products: null,
    createProduct: null,
    updateProduct: null,
    deleteProduct: null,
    inventory: null,
    transactions: null,
    expenses: null,
    createExpense: null,
    updateExpense: null,
    deleteExpense: null,
    ledger: null,
    report: null,
    summary: null,
    daily: null,
    weekly: null,
    monthly: null,
  });

 const fetchBars = async () => {
    setLoading((l) => ({ ...l, bars: true }));
    try {
      const { data } = await axios.get('/api/bars');
      setBars(data);
      if (data.length && currentBar === 'all') {
        setCurrentBar(data[0]._id);
      }
      setError((e) => ({ ...e, bars: null }));
    } catch (err) {
      setError((e) => ({ ...e, bars: err.message }));
    } finally {
      setLoading((l) => ({ ...l, bars: false }));
    }
  };

  const createBar = async ({ name, location }) => {
    setLoading((l) => ({ ...l, createBar: true }));
    try {
      const { data } = await axios.post('/api/bars', { name, location });
      setBars((prev) => [...prev, data]);
      setError((e) => ({ ...e, createBar: null }));
    } catch (err) {
      setError((e) => ({ ...e, createBar: err.message }));
    } finally {
      setLoading((l) => ({ ...l, createBar: false }));
    }
  };

  const updateBar = async (barId, updates) => {
    setLoading((l) => ({ ...l, updateBar: true }));
    try {
      const { data } = await axios.put(`/api/bars/${barId}`, updates);
      setBars((prev) => prev.map((b) => (b._id === barId ? data : b)));
      if (currentBar === barId) setCurrentBar(barId);
      setError((e) => ({ ...e, updateBar: null }));
    } catch (err) {
      setError((e) => ({ ...e, updateBar: err.message }));
    } finally {
      setLoading((l) => ({ ...l, updateBar: false }));
    }
  };

const deleteBar = async (barId) => {
  setLoading((l) => ({ ...l, deleteBar: true }));
  try {
    await axios.delete(`/api/bars/${barId}`);
    setBars((prev) => prev.filter((b) => b._id !== barId));
    if (currentBar === barId) {
      setCurrentBar((bars.find((b) => b._id !== barId) || {}). _id || 'all');
    }
    setError((e) => ({ ...e, deleteBar: null }));
  } catch (err) {
    setError((e) => ({ ...e, deleteBar: err.message }));
  } finally {
    setLoading((l) => ({ ...l, deleteBar: false }));
  }
};

  // — Products CRUD —
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
  const createProduct = async (product) => {
    setLoading(l => ({ ...l, createProduct: true }));
    try {
      const { data } = await axios.post('/api/products', { ...product, bar: currentBar });
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
      setProducts(p => p.map(x => (x._id === id ? data : x)));
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

  // — Inventory CRUD —
  const fetchInventory = async (barId = currentBar, date = selectedDate) => {
    setLoading(l => ({ ...l, inventory: true }));
    try {
      const res = await axios.get('/api/inventory', {
        params: { barId, date }
      });
      setInventory(res.data.data);
      setError(e => ({ ...e, inventory: null }));
      return res.data;
    } catch (err) {
      setError(e => ({ ...e, inventory: err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, inventory: false }));
    }
  };

  // Always send date as a string, plus opening/in/out.
  const upsertInventory = async ({ barId, productId, date, opening, inQty, outQty }) => {
    setLoading(l => ({ ...l, inventory: true }));
    try {
      // ensure date is a YYYY-MM-DD string
      const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0,10);
      const payload = { barId, productId, date: dateStr, opening, inQty, outQty };
      const { data } = await axios.post('/api/inventory', payload);
      // refresh
      await fetchInventory(barId, dateStr);
      setError(e => ({ ...e, inventory: null }));
      return data;
    } catch (err) {
      setError(e => ({ ...e, inventory: err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, inventory: false }));
    }
  };

  const bulkUpsertInventory = async (barId, date, items) => {
    setLoading(l => ({ ...l, inventory: true }));
    try {
      const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0,10);
      const { data } = await axios.post('/api/inventory/bulk-upsert', { barId, date: dateStr, items });
      // merge locally
      setInventory(prev => {
        const byId = {};
        prev.forEach(r => {
          byId[r.product._id.toString()] = r;
        });
        data.updated.forEach(r => {
          byId[r.product._id.toString()] = r;
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

  // — Transactions & Expenses —
  const fetchTransactions = async (barId = currentBar, from, to) => {
    setLoading((l) => ({ ...l, transactions: true }));
    try {
      const { data } = await axios.get('/api/transactions', {
        params: { barId, from, to },
      });
      setTransactions(data);
      setError((e) => ({ ...e, transactions: null }));
    } catch (err) {
      setError((e) => ({ ...e, transactions: err.message }));
    } finally {
      setLoading((l) => ({ ...l, transactions: false }));
    }
  };

  const fetchExpenses = async (barId = currentBar, from, to) => {
    setLoading((l) => ({ ...l, expenses: true }));
    try {
      const { data } = await axios.get('/api/expenses', {
        params: { barId, from, to },
      });
      setExpenses(data);
      setError((e) => ({ ...e, expenses: null }));
    } catch (err) {
      setError((e) => ({ ...e, expenses: err.message }));
    } finally {
      setLoading((l) => ({ ...l, expenses: false }));
    }
  };

  const createExpense = async (expense) => {
    setLoading((l) => ({ ...l, createExpense: true }));
    try {
      const { data } = await axios.post('/api/expenses', expense);
      setExpenses((prev) => [...prev, data]);
      setError((e) => ({ ...e, createExpense: null }));
      return data;
    } catch (err) {
      setError((e) => ({ ...e, createExpense: err.message }));
      throw err;
    } finally {
      setLoading((l) => ({ ...l, createExpense: false }));
    }
  };

  const updateExpense = async (id, updates) => {
    setLoading(l => ({ ...l, updateExpense: true }));
    try {
      const { data } = await axios.put(`/api/expenses/${id}`, updates);
      setExpenses(prev =>
        prev.map(ex => (ex._id === id ? data : ex))
      );
      setError(e => ({ ...e, updateExpense: null }));
      return data;
    } catch (err) {
      setError(e => ({ ...e, updateExpense: err.message }));
      throw err;
    } finally {
      setLoading(l => ({ ...l, updateExpense: false }));
    }
  };

  // Delete an expense
  const deleteExpense = async (id) => {
    setLoading(l => ({ ...l, deleteExpense: true }));
    try {
      await axios.delete(`/api/expenses/${id}`);
      setExpenses(prev => prev.filter(ex => ex._id !== id));
      setError(e => ({ ...e, deleteExpense: null }));
    } catch (err) {
      setError(e => ({ ...e, deleteExpense: err.message }));
    } finally {
      setLoading(l => ({ ...l, deleteExpense: false }));
    }
  };

  // — Reports —
  const fetchReport = async (from, to) => {
    setLoading((l) => ({ ...l, report: true }));
    try {
      const { data } = await axios.get(
        '/api/reports/income-statement',
        {
          params: { barId: currentBar, from, to },
        }
      );
      setReport(data);
      setError((e) => ({ ...e, report: null }));
    } catch (err) {
      setError((e) => ({ ...e, report: err.message }));
    } finally {
      setLoading((l) => ({ ...l, report: false }));
    }
  };

  // — Auto-fetch bars on mount —
  useEffect(() => {
    fetchBars();
  }, []);

  // — Re-fetch when bar or date changes —
  useEffect(() => {
    if (currentBar && currentBar !== 'all' && selectedDate) {
      fetchProducts();
      fetchInventory();
    }
  }, [currentBar, selectedDate]);

  return (
    <AppContext.Provider
      value={{
        bars,
        currentBar,
        setCurrentBar,
        selectedDate,
        setSelectedDate,
        products,
        inventory,
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
        fetchBars,
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
        fetchTransactions,
        fetchExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        fetchReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
