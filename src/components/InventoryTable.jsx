// src/components/InventoryTable.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Spinner } from './Spinner';

export default function InventoryTable({ date }) {
  const {
    currentBar,
    inventory,
    fetchInventory,
    bulkUpsertInventory,
    loading,
    error,
  } = useContext(AppContext);

  const [editedProducts, setEditedProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentBar && date) fetchInventory(currentBar, date);
  }, [currentBar, date]);

  useEffect(() => {
    const saved = localStorage.getItem('editedProducts');
    if (saved) setEditedProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('editedProducts', JSON.stringify(editedProducts));
  }, [editedProducts]);

  const startEdit = (rec) => {
    setEditedProducts((prev) => ({
      ...prev,
      [rec.product._id]: {
        opening: rec.opening,
        inQty: rec.inQty,
        outQty: rec.outQty,
        salesQty: rec.salesQty,
        closing: rec.opening + rec.inQty - rec.outQty,
      },
    }));
  };

  const updateField = (id, field, value) => {
    setEditedProducts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: +value },
    }));
  };

  const saveAllEdits = async () => {
    if (!currentBar) return;
    const items = Object.entries(editedProducts).map(
      ([productId, data]) => ({ productId, ...data })
    );
    await bulkUpsertInventory(currentBar, date, items);
    setEditedProducts({});
  };

  const filtered = inventory.filter((rec) =>
    rec.product.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );
  const displayed = [...filtered].sort((a, b) => {
    const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tB - tA;
  });

  if (loading.inventory) {
    return (
      <div className="p-4 flex justify-center">
        <Spinner />
      </div>
    );
  }
  if (error.inventory) {
    return <div className="p-4 text-red-600">{error.inventory}</div>;
  }

  return (
    <div className="relative bg-white shadow-md rounded-lg overflow-hidden">
      {Object.keys(editedProducts).length > 0 && (
        <div className="bg-yellow-100 text-yellow-800 p-2 mb-2 rounded text-sm flex justify-between">
          <span>
            You have {Object.keys(editedProducts).length} unsaved change
            {Object.keys(editedProducts).length > 1 ? 's' : ''}.
          </span>
          <button onClick={saveAllEdits} className="underline font-medium">
            Save All
          </button>
        </div>
      )}

      <div className="p-4">
        <input
          type="text"
          placeholder="Search product…"
          className="w-full border rounded px-3 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* desktop table */}
      <div className="overflow-x-auto hidden md:block">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {[
                  'Product',
                  'Opening',
                  'In',
                  'Out',
                  'Closing',
                  'Sales',
                  'Amount',
                  'Actions',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map((rec) => {
                const id = rec.product._id;
                const isEditing = !!editedProducts[id];
                const vals = isEditing ? editedProducts[id] : rec;
                const closingComputed = vals.opening + vals.inQty - vals.outQty;

                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{rec.product.name}</td>

                    {/* swap here: closing before salesQty */}
                    {['opening', 'inQty', 'outQty', 'closing', 'salesQty'].map(
                      (field) => (
                        <td key={field} className="px-4 py-2">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-full sm:w-20 border rounded px-2 py-1"
                              value={
                                field === 'closing'
                                  ? vals.closing
                                  : vals[field]
                              }
                              onChange={(e) =>
                                updateField(id, field, e.target.value)
                              }
                            />
                          ) : field === 'closing' ? (
                            closingComputed
                          ) : (
                            rec[field]
                          )}
                        </td>
                      )
                    )}

                    <td className="px-4 py-2 whitespace-nowrap">
                      $
                      {(
                        (isEditing ? vals.salesQty : rec.salesQty) *
                        rec.product.sellingPrice
                      ).toFixed(2)}
                    </td>

                    <td className="px-4 py-2 space-x-2">
                      {isEditing ? (
                        <button
                          onClick={() => {
                            setEditedProducts((prev) => {
                              const next = { ...prev };
                              delete next[id];
                              return next;
                            });
                          }}
                          className="text-sm text-gray-600"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(rec)}
                          className="text-sm text-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* mobile card view */}
      <div className="md:hidden space-y-4 p-4">
        {displayed.map((rec) => {
          const id = rec.product._id;
          const isEditing = !!editedProducts[id];
          const vals = isEditing ? editedProducts[id] : rec;
          const closingComputed = vals.opening + vals.inQty - vals.outQty;

          return (
            <div key={id} className="bg-gray-50 border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{rec.product.name}</h4>
                {isEditing ? (
                  <button
                    onClick={() => {
                      setEditedProducts((prev) => {
                        const next = { ...prev };
                        delete next[id];
                        return next;
                      });
                    }}
                    className="text-sm text-gray-600"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(rec)}
                    className="text-sm text-blue-600"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {[
                  ['Opening', isEditing ? (
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1"
                      value={vals.opening}
                      onChange={(e) =>
                        updateField(id, 'opening', e.target.value)
                      }
                    />
                  ) : (
                    rec.opening
                  )],
                  ['In', isEditing ? (
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1"
                      value={vals.inQty}
                      onChange={(e) =>
                        updateField(id, 'inQty', e.target.value)
                      }
                    />
                  ) : (
                    rec.inQty
                  )],
                  ['Out', isEditing ? (
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1"
                      value={vals.outQty}
                      onChange={(e) =>
                        updateField(id, 'outQty', e.target.value)
                      }
                    />
                  ) : (
                    rec.outQty
                  )],
                  ['Closing', isEditing ? (
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1"
                      value={vals.closing}
                      onChange={(e) =>
                        updateField(id, 'closing', e.target.value)
                      }
                    />
                  ) : (
                    closingComputed
                  )],
                  ['Sales', isEditing ? (
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1"
                      value={vals.salesQty}
                      onChange={(e) =>
                        updateField(id, 'salesQty', e.target.value)
                      }
                    />
                  ) : (
                    rec.salesQty
                  )],
                  [
                    'Amount',
                    `$${(
                      (isEditing ? vals.salesQty : rec.salesQty) *
                      rec.product.sellingPrice
                    ).toFixed(2)}`,
                  ],
                ].map(([label, content]) => (
                  <div key={label}>
                    <span className="font-medium">{label}:</span> {content}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}





