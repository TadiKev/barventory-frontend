// src/components/ProductTable.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function ProductTable() {
  const {
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useContext(AppContext);

  // --- form for adding new products ---
  const [form, setForm] = useState({
    name: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    lowStockThreshold: '10',
  });

  // --- pagination & products state ---
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  // fetch with pagination
  const fetchProducts = async (page = 1, pageSize = 10) => {
  try {
    // base is '' in dev, or 'https://barventory-backend.onrender.com' in prod
    const base = import.meta.env.VITE_API_URL || '';

    const res = await fetch(
      `${base}/api/products?page=${page}&pageSize=${pageSize}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();
    setProducts(data.products);
    setPagination({
      page: data.page,
      pageSize: data.pageSize,
      total: data.total,
      totalPages: data.totalPages,
    });
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }
};


  // on mount and when pagination changes
  useEffect(() => {
    fetchProducts(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize]);

  // add new product
  const handleAdd = async (e) => {
    e.preventDefault();
    await createProduct({
      name: form.name.trim(),
      category: form.category.trim(),
      costPrice: parseFloat(form.costPrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 0,
    });
    setForm({
      name: '',
      category: '',
      costPrice: '',
      sellingPrice: '',
      lowStockThreshold: '10',
    });
    fetchProducts(pagination.page, pagination.pageSize);
  };

  // --- inline editing state ---
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // begin editing a row/card
  const startEdit = (p) => {
    setEditingId(p._id);
    setEditForm({
      name: p.name,
      category: p.category,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      lowStockThreshold: p.lowStockThreshold,
    });
  };

  // cancel inline edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // save inline edit (table or card)
  const saveEdit = async (id) => {
    await updateProduct(id, {
      name: editForm.name.trim(),
      category: editForm.category.trim(),
      costPrice: parseFloat(editForm.costPrice) || 0,
      sellingPrice: parseFloat(editForm.sellingPrice) || 0,
      lowStockThreshold: parseInt(editForm.lowStockThreshold) || 0,
    });
    cancelEdit();
    fetchProducts(pagination.page, pagination.pageSize);
  };

  // delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    fetchProducts(pagination.page, pagination.pageSize);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-6">
      {/* — Add form — */}
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2"
      >
        {['name', 'category', 'costPrice', 'sellingPrice', 'lowStockThreshold'].map(
          (field) => (
            <input
              key={field}
              name={field}
              type={field.includes('Price') ? 'number' : 'text'}
              step="0.01"
              placeholder={field
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (s) => s.toUpperCase())}
              className="border rounded px-2 py-1 w-full"
              value={form[field]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [field]: e.target.value }))
              }
              required={['name', 'costPrice', 'sellingPrice'].includes(field)}
            />
          )
        )}
        <button
          type="submit"
          className="col-span-full sm:col-span-1 bg-pink-500 text-white rounded px-3 py-1 hover:bg-pink-600"
          disabled={loading.createProduct}
        >
          {loading.createProduct ? 'Adding…' : 'Add Product'}
        </button>
      </form>
      {error.createProduct && (
        <p className="text-red-600">{error.createProduct}</p>
      )}

      {/* — Table view (md+) — */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-gray-100">
            <tr>
              {[
                'Name',
                'Category',
                'Cost',
                'Price',
                'Low Threshold',
                'Actions',
              ].map((col) => (
                <th key={col} className="px-3 py-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                {editingId === p._id ? (
                  <>
                    <td className="px-2 py-1">
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, name: e.target.value }))
                        }
                        className="border rounded px-1 py-1 w-full"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            category: e.target.value,
                          }))
                        }
                        className="border rounded px-1 py-1 w-full"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.costPrice}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            costPrice: e.target.value,
                          }))
                        }
                        className="border rounded px-1 py-1 w-full"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.sellingPrice}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            sellingPrice: e.target.value,
                          }))
                        }
                        className="border rounded px-1 py-1 w-full"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={editForm.lowStockThreshold}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            lowStockThreshold: e.target.value,
                          }))
                        }
                        className="border rounded px-1 py-1 w-full"
                      />
                    </td>
                    <td className="px-2 py-1 space-x-2">
                      <button
                        onClick={() => saveEdit(p._id)}
                        className="text-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.category}</td>
                    <td className="px-3 py-2">
                      ${p.costPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      ${p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{p.lowStockThreshold}</td>
                    <td className="px-3 py-2 space-x-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {error.updateProduct && (
          <p className="text-red-600 mt-2">{error.updateProduct}</p>
        )}
        {error.deleteProduct && (
          <p className="text-red-600 mt-2">{error.deleteProduct}</p>
        )}
      </div>

      {/* — Card view (sm) — */}
      <div className="space-y-4 md:hidden">
        {products.map((p) => {
          const isEditing = editingId === p._id;
          return (
            <div
              key={p._id}
              className="bg-gray-50 border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{p.name}</h4>
                {isEditing ? (
                  <button
                    onClick={cancelEdit}
                    className="text-sm text-gray-600"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(p)}
                    className="text-sm text-blue-600"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Category:</span>{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          category: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    p.category
                  )}
                </div>

                <div>
                  <span className="font-medium">Cost:</span>{' '}
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border rounded px-2 py-1"
                      value={editForm.costPrice}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          costPrice: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    `$${p.costPrice.toFixed(2)}`
                  )}
                </div>

                <div>
                  <span className="font-medium">Price:</span>{' '}
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border rounded px-2 py-1"
                      value={editForm.sellingPrice}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          sellingPrice: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    `$${p.sellingPrice.toFixed(2)}`
                  )}
                </div>

                <div>
                  <span className="font-medium">Low Threshold:</span>{' '}
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1"
                      value={editForm.lowStockThreshold}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          lowStockThreshold: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    p.lowStockThreshold
                  )}
                </div>

                {isEditing && (
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => saveEdit(p._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="text-center text-gray-500">
            No products available.
          </div>
        )}
      </div>

      {/* — Pagination — */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
        <button
          onClick={() =>
            setPagination((p) => ({ ...p, page: p.page - 1 }))
          }
          disabled={pagination.page <= 1}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() =>
            setPagination((p) => ({ ...p, page: p.page + 1 }))
          }
          disabled={pagination.page >= pagination.totalPages}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
