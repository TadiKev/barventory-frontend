// src/pages/Transfers.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Spinner }   from '../components/Spinner';

export default function TransfersPage() {
  const {
    transfers,
    fetchTransfers,
    approveTransfer,
    rejectTransfer,
    loading,
    error
  } = useContext(AppContext);

  const [statusFilter, setStatusFilter] = useState('pending');

  // whenever filter changes, re-fetch
  useEffect(() => {
    fetchTransfers(statusFilter).catch(console.error);
  }, [statusFilter, fetchTransfers]);

  // loading state for transfers
  if (loading.transfers) {
    return (
      <div className="p-4 flex justify-center">
        <Spinner />
      </div>
    );
  }

  // error state for transfers
  if (error.transfers) {
    return (
      <div className="p-4 text-red-600">
        {error.transfers}
      </div>
    );
  }

  // ensure we have an array
  const safeTransfers = Array.isArray(transfers) ? transfers : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Transfer Requests</h1>

      <div className="mb-4 flex items-center space-x-4">
        <label className="font-medium">Filter:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                'Product',
                'Qty',
                'From Bar',
                'To Bar',
                'Requested By',
                'Requested At',
                'Status',
                'Actions'
              ].map(col => (
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
            {safeTransfers.length > 0 ? (
              safeTransfers.map(t => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{t.product?.name || '—'}</td>
                  <td className="px-4 py-2">{t.qty}</td>
                  <td className="px-4 py-2">{t.fromBar?.name || '—'}</td>
                  <td className="px-4 py-2">{t.toBar?.name || '—'}</td>
                  <td className="px-4 py-2">{t.requestedBy?.username || '—'}</td>
                  <td className="px-4 py-2">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 capitalize">{t.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    {t.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => approveTransfer(t._id)}
                          className="text-green-600 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectTransfer(t._id)}
                          className="text-red-600 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No transfer requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
