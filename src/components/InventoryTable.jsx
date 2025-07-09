// src/components/InventoryTable.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AppContext }  from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { Spinner }     from './Spinner';

export default function InventoryTable({ date: propDate }) {
  const { user } = useContext(AuthContext);
  const roleLower  = user?.role?.toLowerCase();
  const isEmployee = roleLower === 'employee';
  const isAdmin    = roleLower === 'admin';

  const todayStr = new Date().toISOString().slice(0, 10);
  const date     = propDate || todayStr;
  const isToday  = date === todayStr;

  const {
    bars,
    currentBar,
    inventory,
    fetchInventory,
    bulkUpsertInventory,
    requestTransfer,
    loading,
    error,
    cashCount,
    setCashCount,
    saveCashCount
  } = useContext(AppContext);

  const [editedRecords, setEditedRecords] = useState({});
  const [searchTerm, setSearchTerm]       = useState('');
  const [transferModal, setTransferModal] = useState({
    open: false,
    productId: null,
    qty: '',
    toBar: '',
  });

  // Persist unsaved edits
  useEffect(() => {
    const saved = localStorage.getItem('editedRecords');
    if (saved) setEditedRecords(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('editedRecords', JSON.stringify(editedRecords));
  }, [editedRecords]);

  // Fetch inventory on bar/date change
  useEffect(() => {
    if (currentBar && date) {
      fetchInventory(currentBar, date).catch(console.error);
    }
  }, [currentBar, date, fetchInventory]);

  // Row editing helpers (unchanged) …
  const startEdit = rec => {
    if (isEmployee && !isToday) return;
    setEditedRecords(prev => ({
      ...prev,
      [rec.product._id]: {
        opening:       rec.opening       ?? 0,
        receivedQty:   rec.receivedQty   ?? 0,
        manualClosing: rec.manualClosing ?? 0,
      }
    }));
  };
  const cancelEdit = id => {
    setEditedRecords(prev => {
      const nxt = { ...prev };
      delete nxt[id];
      return nxt;
    });
  };
  const updateField = (id, field, val) => {
    if (isEmployee && !isToday) return;
    const num = Number(val) || 0;
    setEditedRecords(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: num }
    }));
  };
  const saveAll = async () => {
    if (!currentBar || (isEmployee && !isToday)) return;
    const items = Object.entries(editedRecords).map(([productId, f]) => ({
      productId,
      opening:       f.opening,
      receivedQty:   f.receivedQty,
      manualClosing: f.manualClosing,
    }));
    await bulkUpsertInventory(currentBar, date, items);
    setEditedRecords({});
  };

  // Transfer modal controls
  const openTransferModal  = productId =>
    setTransferModal({ open: true, productId, qty: '', toBar: '' });
  const closeTransferModal = () =>
    setTransferModal({ open: false, productId: null, qty: '', toBar: '' });
  const submitTransfer = async e => {
    e.preventDefault();
    const { productId, qty, toBar } = transferModal;
    const qtyNum = parseInt(qty, 10);
    if (!productId || !toBar || isNaN(qtyNum) || qtyNum < 1) return;
    await requestTransfer({ productId, qty: qtyNum, fromBar: currentBar, toBar });
    await fetchInventory(currentBar, date);
    closeTransferModal();
  };

  // Filter + sort
  const displayed = inventory
    .filter(r => r.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.product.name.localeCompare(b.product.name));

  // Enrich with sales & amounts
  const enriched = displayed.map(r => {
    const o     = r.opening       || 0;
    const re    = r.receivedQty   || 0;
    const ti    = r.transferInQty  || 0;
    const to    = r.transferOutQty || 0;
    const m     = r.manualClosing != null ? r.manualClosing : 0;
    const price = r.sellingPrice ?? r.product.sellingPrice ?? 0;
    const salesQty = o + re + ti - to - m;
    const salesAmt = salesQty * price;
    return { ...r, salesQty, salesAmt };
  });

  // Day-End totals
  const totalExpectedCash = enriched.reduce((sum, r) => sum + r.salesAmt, 0);
  const cashVariance      = cashCount - totalExpectedCash;

  if (loading.inventory) return (
    <div className="p-4 flex justify-center"><Spinner /></div>
  );
  if (error.inventory) return (
    <div className="p-4 text-red-600 text-sm">
      {error.inventory.includes('Network Error')
        ? 'Cannot reach server—check API base URL or proxy.'
        : error.inventory}
    </div>
  );

  return (
    <>
      {/* Unsaved banner */}
      {(isAdmin || (isEmployee && isToday)) && Object.keys(editedRecords).length > 0 && (
        <div className="bg-yellow-100 text-yellow-800 p-2 mb-2 rounded flex flex-col sm:flex-row justify-between text-xs sm:text-sm">
          <span>
            {Object.keys(editedRecords).length} unsaved row
            {Object.keys(editedRecords).length > 1 && 's'}.
          </span>
          <button onClick={saveAll} className="underline font-medium mt-1 sm:mt-0">
            Save All
          </button>
        </div>
      )}

      {/* Search */}
      <div className="p-2 sm:p-4">
        <input
          type="text"
          placeholder="Search product…"
          className="w-full border rounded px-2 py-1 text-xs sm:text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left">Product</th>
              <th className="px-2 py-1 text-left">Opening</th>
              <th className="px-2 py-1 text-left">Received</th>
              <th className="hidden sm:table-cell px-2 py-1 text-left">In</th>
              <th className="px-2 py-1 text-left">Sales</th>
              <th className="hidden sm:table-cell px-2 py-1 text-left">Out</th>
              <th className="hidden sm:table-cell px-2 py-1 text-left">Expected</th>
              <th className="px-2 py-1 text-left">Manual</th>
              <th className="hidden sm:table-cell px-2 py-1 text-left">Variance</th>
              <th className="px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enriched.map(r => {
              const id    = r.product._id;
              const ed    = editedRecords[id];
              const isEd  = Boolean(ed);
              const opening = ed?.opening     ?? r.opening      ?? 0;
              const received= ed?.receivedQty ?? r.receivedQty  ?? 0;
              const inT     = r.transferInQty  ?? 0;
              const outT    = r.transferOutQty ?? 0;
              const manual  = isEd ? ed.manualClosing : (r.manualClosing ?? null);

              const sales    = opening + received + inT - outT - (manual ?? 0);
              const expected = opening + received + inT - (sales + outT);
              const variance = manual != null ? manual - expected : 0;
              const canEdit  = isAdmin || (isEmployee && isToday);

              return (
                <tr key={id} className={`${variance<0?'bg-red-50':''} hover:bg-gray-50`}>
                  <td className="px-2 py-1">{r.product.name}</td>
                  <td className="px-2 py-1">{opening}</td>
                  <td className="px-2 py-1">
                    {canEdit && isEd ? (
                      <input
                        type="number"
                        className="w-12 sm:w-20 border rounded px-1 py-0.5"
                        value={received}
                        onChange={e => updateField(id,'receivedQty',e.target.value)}
                      />
                    ) : received}
                  </td>
                  <td className="hidden sm:table-cell px-2 py-1">{inT}</td>
                  <td className="px-2 py-1 font-semibold">{sales}</td>
                  <td className="hidden sm:table-cell px-2 py-1">{outT}</td>
                  <td className="hidden sm:table-cell px-2 py-1">{expected}</td>
                  <td className="px-2 py-1">
                    {canEdit && isEd ? (
                      <input
                        type="number"
                        className="w-12 sm:w-20 border rounded px-1 py-0.5"
                        value={manual ?? ''}
                        onChange={e => updateField(id,'manualClosing',e.target.value)}
                      />
                    ) : (manual!=null?manual:'-')}
                  </td>
                  <td className="hidden sm:table-cell px-2 py-1">
                    <span className={`${variance<0?'text-red-600':'text-green-600'}`}>
                      {variance}
                    </span>
                  </td>
                  <td className="px-2 py-1 space-x-1">
                    {canEdit && (isEd
                      ? <button onClick={()=>cancelEdit(id)} className="text-gray-600">Cancel</button>
                      : <button onClick={()=>startEdit(r)} className="text-blue-600">Edit</button>
                    )}
                    <button onClick={()=>openTransferModal(id)} className="text-indigo-600 hover:underline">
                      Transfer
                    </button>
                  </td>
                </tr>
              );
            })}
            {enriched.length===0 && (
              <tr>
                <td colSpan={10} className="px-2 py-4 text-center text-gray-500">
                  No products match “{searchTerm}”
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {transferModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-2">
          <form
            onSubmit={submitTransfer}
            className="bg-white rounded-lg w-full max-w-xs p-3 sm:p-4 space-y-3"
          >
            <h2 className="text-base font-medium">Transfer Product</h2>
            <div>
              <label className="block mb-1 text-sm">Destination Bar</label>
              <select
                required
                className="w-full border rounded px-2 py-1"
                value={transferModal.toBar}
                onChange={e => setTransferModal(tm=>({...tm,toBar:e.target.value}))}
              >
                <option value="">Select Bar</option>
                {bars.filter(b=>b._id!==currentBar).map(b=>(
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">Quantity</label>
              <input
                type="number"
                min="1"
                value={transferModal.qty}
                onChange={e=>setTransferModal(tm=>({...tm,qty:e.target.value}))}
                className="w-full border rounded px-2 py-1"
                placeholder="0"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeTransferModal}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

            {/* Day-End Summary (Admins + Employees see Expected Cash) */}
      {(isAdmin || isEmployee) && (
        <div className="p-4 border-t mt-4">
          <h3 className="text-lg font-semibold mb-2">Day‑End Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expected Cash: everyone */}
            <div>
              <label className="block text-sm">Expected Cash</label>
              <div className="mt-1 text-xl font-bold">
                ${totalExpectedCash.toFixed(2)}
              </div>
            </div>

            {/* Actual Cash Collected: only admins can edit, employees just view “—” */}
            <div>
              <label className="block text-sm">Actual Cash Collected</label>
              {isAdmin ? (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashCount}
                  onChange={e => setCashCount(Number(e.target.value))}
                  onBlur={() => saveCashCount(cashCount)}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              ) : (
                <div className="mt-1 text-lg">—</div>
              )}
            </div>

            {/* Variance: only admins */}
            {isAdmin && (
              <div>
                <label className="block text-sm">Variance</label>
                <div className={`mt-1 text-xl font-bold ${cashVariance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${cashVariance.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}
