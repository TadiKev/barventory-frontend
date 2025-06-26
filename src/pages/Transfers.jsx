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
    deleteTransfer,
    loading,
    error
  } = useContext(AppContext);

  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchTransfers(statusFilter).catch(console.error);
  }, [statusFilter, fetchTransfers]);

  if (loading.transfers) {
    return (
      <div className="p-4 flex justify-center text-xs"> <Spinner /> </div>
    );
  }

  if (error.transfers) {
    return (
      <div className="p-4 text-red-600 text-xs">{error.transfers}</div>
    );
  }

  const safeTransfers = Array.isArray(transfers) ? transfers : [];
  const todayISO = () => new Date().toISOString().slice(0, 10);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
        Transfer Requests
      </h1>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center space-x-2 text-xs sm:text-sm">
        <label className="font-medium">Filter:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table on md+ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                'Product','Qty','From Bar','To Bar',
                'Requested By','Requested At','Status','Actions'
              ].map(col => (
                <th key={col} className="px-3 py-2 text-left font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {safeTransfers.length > 0 ? safeTransfers.map(t => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{t.product?.name || '—'}</td>
                <td className="px-3 py-2">{t.qty}</td>
                <td className="px-3 py-2">{t.fromBar?.name || '—'}</td>
                <td className="px-3 py-2">{t.toBar?.name || '—'}</td>
                <td className="px-3 py-2">{t.requestedBy?.username || '—'}</td>
                <td className="px-3 py-2 text-xs">
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 capitalize">{t.status}</td>
                <td className="px-3 py-2 space-x-2 text-xs sm:text-sm">
                  {t.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => approveTransfer(t._id, todayISO())}
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
                    <button
                      onClick={async () => {
                        await deleteTransfer(t._id);
                        fetchTransfers(statusFilter).catch(console.error);
                      }}
                      className="text-gray-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-gray-500 text-xs"
                >
                  No transfer requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card view on small */}
      <div className="md:hidden space-y-3 text-xs">
        {safeTransfers.length > 0 ? safeTransfers.map(t => (
          <div
            key={t._id}
            className="border rounded-lg p-2 bg-gray-50 shadow-sm"
          >
            <p><strong>Product:</strong> {t.product?.name || '—'}</p>
            <p><strong>Qty:</strong> {t.qty}</p>
            <p><strong>From:</strong> {t.fromBar?.name || '—'}</p>
            <p><strong>To:</strong> {t.toBar?.name || '—'}</p>
            <p><strong>By:</strong> {t.requestedBy?.username || '—'}</p>
            <p className="text-xs">
              <strong>At:</strong> {new Date(t.createdAt).toLocaleString()}
            </p>
            <p><strong>Status:</strong> {t.status}</p>
            <div className="mt-2 flex flex-wrap space-x-2">
              {t.status === 'pending' ? (
                <>
                  <button
                    onClick={() => approveTransfer(t._id, todayISO())}
                    className="text-green-600 text-xs hover:underline"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectTransfer(t._id)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  onClick={async () => {
                    await deleteTransfer(t._id);
                    fetchTransfers(statusFilter).catch(console.error);
                  }}
                  className="text-gray-600 text-xs hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )) : (
          <p className="text-center text-gray-500 text-xs">No transfer requests found.</p>
        )}
      </div>
    </div>
  );
}
