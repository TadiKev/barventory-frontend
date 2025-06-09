// src/components/InventoryTable.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AppContext }  from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { Spinner }     from './Spinner';

export default function InventoryTable({ date }) {
  const { user } = useContext(AuthContext);

  const roleLower = user?.role?.toLowerCase();
  const isEmployee = roleLower === 'employee';
  const isAdmin    = roleLower === 'admin';

  const {
    currentBar,
    bars,
    inventory,
    fetchInventory,
    bulkUpsertInventory,
    requestTransfer,
    loading,
    error,
  } = useContext(AppContext);

  // local state for in-UI edits
  const [editedRecords, setEditedRecords] = useState({});
  const [searchTerm, setSearchTerm]       = useState('');
  const [transferModal, setTransferModal] = useState({
    open: false,
    productId: null,
    qty: 1,
    toBar: '',
  });

  // load any saved edits from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('editedRecords');
    if (saved) setEditedRecords(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('editedRecords', JSON.stringify(editedRecords));
  }, [editedRecords]);

  // re-fetch inventory when bar or date changes
  useEffect(() => {
    if (currentBar && date) {
      fetchInventory(currentBar, date).catch(console.error);
    }
  }, [currentBar, date]);

  // start editing a row
  const startEdit = rec => {
    setEditedRecords(prev => ({
      ...prev,
      [rec.product._id]: {
        opening:       rec.opening       ?? 0,
        receivedQty:   rec.receivedQty   ?? 0,
        salesQty:      rec.salesQty      ?? 0,
        manualClosing: rec.manualClosing ?? 0,
      }
    }));
  };

  // update a single field in the edit
  const updateField = (id, field, val) => {
    const num = Number(val) || 0;
    setEditedRecords(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: num
      }
    }));
  };

  // send all pending edits in one bulk-upsert call
  const saveAll = async () => {
    if (!currentBar) return;
    const items = Object.entries(editedRecords).map(([productId, f]) => ({
      productId,
      opening:       f.opening,
      receivedQty:   f.receivedQty,
      transferInQty: 0,
      transferOutQty:0,
      salesQty:      f.salesQty,
      manualClosing: f.manualClosing,
    }));
    await bulkUpsertInventory(currentBar, date, items);
    setEditedRecords({});
  };

  // transfer modal handlers
  const openTransferModal = productId =>
    setTransferModal({ open: true, productId, qty: 1, toBar: '' });
  const closeTransferModal = () =>
    setTransferModal({ open: false, productId: null, qty: 1, toBar: '' });
  const submitTransfer = async () => {
    const { productId, qty, toBar } = transferModal;
    if (!productId || !toBar || qty < 1) return;
    await requestTransfer({ productId, qty, fromBar: currentBar, toBar });
    await fetchInventory(currentBar, date);
    closeTransferModal();
  };

  // filtered + sorted list
  const displayed = inventory
    .filter(r => r.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (loading.inventory) {
    return <div className="p-4 flex justify-center"><Spinner/></div>;
  }
  if (error.inventory) {
    return (
      <div className="p-4 text-red-600">
        {error.inventory.includes('Network Error')
          ? 'Cannot reach server—check your API base URL or proxy.'
          : error.inventory}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Unsaved banner */}
      {(isEmployee || isAdmin) && Object.keys(editedRecords).length > 0 && (
        <div className="bg-yellow-100 text-yellow-800 p-2 mb-2 rounded flex justify-between">
          <span>
            {Object.keys(editedRecords).length} row
            {Object.keys(editedRecords).length > 1 && 's'} unsaved.
          </span>
          <button onClick={saveAll} className="underline font-medium">
            Save All
          </button>
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
                <th key={col}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map(rec => {
              const id = rec.product._id;
              const ed = editedRecords[id] || {};

              const opening  = ed.opening       ?? rec.opening       ?? 0;
              const received = ed.receivedQty   ?? rec.receivedQty   ?? 0;
              const inT      = rec.transferInQty  ?? 0;
              const sales    = ed.salesQty      ?? rec.salesQty      ?? 0;
              const outT     = rec.transferOutQty ?? 0;
              const manual   = ed.manualClosing !== undefined
                ? ed.manualClosing
                : (rec.manualClosing ?? null);

              // expected = opening + received + inT − (sales + outT)
              const expected = opening + received + inT - (sales + outT);
              const variance = manual !== null ? manual - expected : null;
              const isEd = id in editedRecords;

              return (
                <tr key={id}
                  className={`hover:bg-gray-50 ${variance !== null && variance < 0 ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-2">{rec.product.name}</td>
                  <td className="px-4 py-2">{opening}</td>
                  <td className="px-4 py-2">
                    {(isEmployee || isAdmin) && isEd ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={received}
                        onChange={e => updateField(id, 'receivedQty', e.target.value)}
                      />
                    ) : received}
                  </td>
                  <td className="px-4 py-2">{inT}</td>
                  <td className="px-4 py-2">
                    {(isEmployee || isAdmin) && isEd ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={sales}
                        onChange={e => updateField(id, 'salesQty', e.target.value)}
                      />
                    ) : sales}
                  </td>
                  <td className="px-4 py-2">{outT}</td>
                  <td className="px-4 py-2">{expected}</td>
                  <td className="px-4 py-2">
                    {(isEmployee || isAdmin) && isEd ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={manual ?? ''}
                        onChange={e => updateField(id, 'manualClosing', e.target.value)}
                      />
                    ) : manual !== null ? manual : '-'}
                  </td>
                  <td className={`px-4 py-2 ${
                      variance !== null
                        ? variance < 0
                          ? 'text-red-600 font-semibold'
                          : 'text-green-600'
                        : ''
                    }`}>
                    {variance !== null ? variance : '-'}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {(isEmployee || isAdmin) && (isEd
                      ? <button
                          onClick={() => {
                            const nxt = { ...editedRecords };
                            delete nxt[id];
                            setEditedRecords(nxt);
                          }}
                          className="text-sm text-gray-600">
                          Cancel
                        </button>
                      : <button
                          onClick={() => startEdit(rec)}
                          className="text-sm text-blue-600">
                          Edit
                        </button>
                    )}
                    <button
                      onClick={() => openTransferModal(id)}
                      className="text-sm text-indigo-600 hover:underline">
                      Transfer
                    </button>
                  </td>
                </tr>
              );
            })}

            {displayed.length === 0 && (
              <tr>
                <td colSpan={10}
                  className="px-4 py-6 text-center text-gray-500">
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
                <label className="block text-sm font-medium text-gray-700">
                  Destination Bar
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-full border rounded px-3 py-2"
                  value={transferModal.qty}
                  onChange={e => setTransferModal(tm => ({
                    ...tm,
                    qty: Number(e.target.value) || 1
                  }))}
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
    </div>
  );
}
