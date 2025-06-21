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

  // get YYYY-MM-DD for today
  const todayStr = new Date().toISOString().slice(0, 10);
  // default to today if no propDate
  const date     = propDate || todayStr;
  const isToday  = date === todayStr;

  const {
    currentBar,
    bars,
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
    qty: 1,
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
  }, [currentBar, date]);

  // Row editing
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

  // Transfer modal
  const openTransferModal  = productId => setTransferModal({ open: true, productId, qty: 1, toBar: '' });
  const closeTransferModal = ()          => setTransferModal({ open: false, productId: null, qty: 1, toBar: '' });
  const submitTransfer     = async ()    => {
    const { productId, qty, toBar } = transferModal;
    if (!productId || !toBar || qty < 1) return;
    await requestTransfer({ productId, qty, fromBar: currentBar, toBar });
    await fetchInventory(currentBar, date);
    closeTransferModal();
  };

  // Filter + sort
  const displayed = inventory
    .filter(r => r.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.product.name.localeCompare(b.product.name));

  // ENRICH with guaranteed salesQty & salesAmt
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

  // Day‑End totals
  const totalExpectedCash = enriched.reduce((sum, r) => sum + r.salesAmt, 0);
  const cashVariance      = cashCount - totalExpectedCash;

  if (loading.inventory) return (
    <div className="p-4 flex justify-center">
      <Spinner />
    </div>
  );
  if (error.inventory) return (
    <div className="p-4 text-red-600">
      {error.inventory.includes('Network Error')
        ? 'Cannot reach server—check your API base URL or proxy.'
        : error.inventory}
    </div>
  );

  return (
    <>
      {/* Unsaved banner */}
      {(isAdmin || (isEmployee && isToday)) && Object.keys(editedRecords).length > 0 && (
        <div className="bg-yellow-100 text-yellow-800 p-2 mb-2 rounded flex justify-between">
          <span>
            {Object.keys(editedRecords).length} unsaved row
            {Object.keys(editedRecords).length > 1 && 's'}.
          </span>
          <button onClick={saveAll} className="underline font-medium">Save All</button>
        </div>
      )}

      {/* Search */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search product…"
          className="w-full border rounded px-3 py-2"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                'Product','Opening','Received','Transfer In',
                'Sales','Transfer Out','Expected',
                'Manual Closing','Variance','Actions'
              ].map(col => (
                <th key={col} className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  {col}
                </th>
              ))}
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
              const manual  = isEd
                ? ed.manualClosing
                : (r.manualClosing ?? null);

              // recalc in‑row values
              const sales    = opening + received + inT - outT - (manual ?? 0);
              const expected = opening + received + inT - (sales + outT);
              const variance = manual != null
                ? manual - expected
                : r.variance;

              const canEdit = isAdmin || (isEmployee && isToday);

              return (
                <tr key={id} className={`hover:bg-gray-50 ${variance < 0 ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-2">{r.product.name}</td>
                  <td className="px-4 py-2">{opening}</td>
                  <td className="px-4 py-2">
                    {canEdit && isEd
                      ? <input
                          type="number"
                          className="w-20 border rounded px-2 py-1"
                          value={received}
                          onChange={e => updateField(id, 'receivedQty', e.target.value)}
                        />
                      : received
                    }
                  </td>
                  <td className="px-4 py-2">{inT}</td>
                  <td className="px-4 py-2 font-semibold">{sales}</td>
                  <td className="px-4 py-2">{outT}</td>
                  <td className="px-4 py-2">{expected}</td>
                  <td className="px-4 py-2">
                    {canEdit && isEd
                      ? <input
                          type="number"
                          className="w-20 border rounded px-2 py-1"
                          value={manual ?? ''}
                          onChange={e => updateField(id, 'manualClosing', e.target.value)}
                        />
                      : (manual != null ? manual : '-')
                    }
                  </td>
                  <td className={`px-4 py-2 ${variance < 0 ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
                    {variance != null ? variance : '-'}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {canEdit && (
                      isEd
                        ? <button onClick={() => cancelEdit(id)} className="text-sm text-gray-600">
                            Cancel
                          </button>
                        : <button onClick={() => startEdit(r)} className="text-sm text-blue-600">
                            Edit
                          </button>
                    )}
                    <button onClick={() => openTransferModal(id)} className="text-sm text-indigo-600 hover:underline">
                      Transfer
                    </button>
                  </td>
                </tr>
              );
            })}
            {enriched.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                  No products match “{searchTerm}”
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {transferModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium">Request Transfer</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination Bar</label>
                <select
                  className="mt-1 block w-full border rounded px-3 py-2"
                  value={transferModal.toBar}
                  onChange={e => setTransferModal(tm => ({ ...tm, toBar: e.target.value }))}
                >
                  <option value="">— Select Bar —</option>
                  {bars.filter(b => b._id !== currentBar).map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-full border rounded px-3 py-2"
                  value={transferModal.qty}
                  onChange={e => setTransferModal(tm => ({ ...tm, qty: Number(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-2">
              <button
                onClick={closeTransferModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitTransfer}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day‑End Summary: admin only */}
      {isAdmin && (
        <div className="p-4 border-t mt-4">
          <h3 className="text-lg font-semibold mb-2">Day‑End Summary</h3>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Cash</label>
              <div className="mt-1 text-xl font-bold">${totalExpectedCash.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Actual Cash Collected</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cashCount}
                onChange={e => setCashCount(Number(e.target.value))}
                onBlur={() => saveCashCount(cashCount)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Variance</label>
              <div className={`mt-1 text-xl font-bold ${cashVariance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${cashVariance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
