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
    fetchProducts,    // ← pulled in from context
  } = useContext(AppContext);

  // Add‐product form state
  const [form, setForm] = useState({
    name: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    lowStockThreshold: '10',
  });

  // Products & pagination
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  
  // Load products on mount & when page/pageSize change
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts(pagination.page, pagination.pageSize);
        if (data) {
          setProducts(data.products);
          setPagination({
            page: data.page,
            pageSize: data.pageSize,
            total: data.total,
            totalPages: data.totalPages,
          });
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    })();
  }, [pagination.page, pagination.pageSize, fetchProducts]);

  // Handle add
  const handleAdd = async e => {
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
    // Refresh list
    try {
      const data = await fetchProducts(pagination.page, pagination.pageSize);
      if (data) setProducts(data.products);
    } catch (err) {
      console.error('Failed to reload after add:', err);
    }
  };

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = p => {
    setEditingId(p._id);
    setEditForm({
      name: p.name,
      category: p.category,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      lowStockThreshold: p.lowStockThreshold,
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  const saveEdit = async id => {
    await updateProduct(id, {
      name: editForm.name.trim(),
      category: editForm.category.trim(),
      costPrice: parseFloat(editForm.costPrice) || 0,
      sellingPrice: parseFloat(editForm.sellingPrice) || 0,
      lowStockThreshold: parseInt(editForm.lowStockThreshold) || 0,
    });
    cancelEdit();
    // Refresh list
    try {
      const data = await fetchProducts(pagination.page, pagination.pageSize);
      if (data) setProducts(data.products);
    } catch (err) {
      console.error('Failed to reload after edit:', err);
    }
  };
  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    // Refresh list
    try {
      const data = await fetchProducts(pagination.page, pagination.pageSize);
      if (data) setProducts(data.products);
    } catch (err) {
      console.error('Failed to reload after delete:', err);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-6">
      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-sm"
      >
        {['name','category','costPrice','sellingPrice','lowStockThreshold'].map(field => (
          <input
            key={field}
            name={field}
            type={field.includes('Price') ? 'number' : 'text'}
            step="0.01"
            placeholder={field
              .replace(/([A-Z])/g,' $1')
              .replace(/^./, s=>s.toUpperCase())}
            className="border rounded px-3 py-2 w-full"
            value={form[field]}
            onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}
            required={['name','costPrice','sellingPrice'].includes(field)}
          />
        ))}
        <button
          type="submit"
          disabled={loading.createProduct}
          className="col-span-full sm:col-span-1 bg-pink-500 text-white rounded px-3 py-2 hover:bg-pink-600 disabled:opacity-50"
        >
          {loading.createProduct ? 'Adding…' : 'Add Product'}
        </button>
      </form>
      {error.createProduct && (
        <p className="text-red-600 text-sm">{error.createProduct}</p>
      )}

      {/* Table for medium+ */}
      <div className="overflow-x-auto hidden md:block">
        <table className="table-fixed w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-2/12 px-4 py-2 text-left">Name</th>
              <th className="w-3/12 px-4 py-2 text-left">Category</th>
              <th className="w-2/12 px-4 py-2 text-right">Cost</th>
              <th className="w-2/12 px-4 py-2 text-right">Price</th>
              <th className="w-2/12 px-4 py-2 text-right">Threshold</th>
              <th className="w-1/12 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                {editingId === p._id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        className="w-full border rounded px-2 py-1"
                        value={editForm.name}
                        onChange={e=>setEditForm(f=>({...f,name:e.target.value}))}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="w-full border rounded px-2 py-1"
                        value={editForm.category}
                        onChange={e=>setEditForm(f=>({...f,category:e.target.value}))}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number" step="0.01"
                        className="w-full border rounded px-2 py-1 text-right"
                        value={editForm.costPrice}
                        onChange={e=>setEditForm(f=>({...f,costPrice:e.target.value}))}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number" step="0.01"
                        className="w-full border rounded px-2 py-1 text-right"
                        value={editForm.sellingPrice}
                        onChange={e=>setEditForm(f=>({...f,sellingPrice:e.target.value}))}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 text-right"
                        value={editForm.lowStockThreshold}
                        onChange={e=>setEditForm(f=>({...f,lowStockThreshold:e.target.value}))}
                      />
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={()=>saveEdit(p._id)} className="text-green-600">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="text-gray-600">
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.category}</td>
                    <td className="px-4 py-2 text-right">
                      ${p.costPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {p.lowStockThreshold}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={()=>startEdit(p)} className="text-blue-600">
                        Edit
                      </button>
                      <button onClick={()=>handleDelete(p._id)} className="text-red-600">
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
          <p className="text-red-600 mt-2 text-sm">{error.updateProduct}</p>
        )}
        {error.deleteProduct && (
          <p className="text-red-600 mt-2 text-sm">{error.deleteProduct}</p>
        )}
      </div>

      {/* Card view for small screens */}
      <div className="md:hidden space-y-4">
        {products.map(p => {
          const isEditing = editingId === p._id;
          return (
            <div key={p._id} className="bg-gray-50 border rounded-lg p-4 text-sm">
              <div className="flex justify-between mb-2">
                <h4 className="font-semibold">{p.name}</h4>
                {isEditing ? (
                  <button onClick={cancelEdit} className="text-gray-600">
                    Cancel
                  </button>
                ) : (
                  <button onClick={()=>startEdit(p)} className="text-blue-600">
                    Edit
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                <li>
                  <strong>Category:</strong>{' '}
                  {isEditing ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editForm.category}
                      onChange={e=>setEditForm(f=>({...f,category:e.target.value}))}
                    />
                  ) : (
                    p.category
                  )}
                </li>
                <li>
                  <strong>Cost:</strong>{' '}
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded px-2 py-1 w-full text-right"
                      value={editForm.costPrice}
                      onChange={e=>setEditForm(f=>({...f,costPrice:e.target.value}))}
                    />
                  ) : (
                    `$${p.costPrice.toFixed(2)}`
                  )}
                </li>
                <li>
                  <strong>Price:</strong>{' '}
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded px-2 py-1 w-full text-right"
                      value={editForm.sellingPrice}
                      onChange={e=>setEditForm(f=>({...f,sellingPrice:e.target.value}))}
                    />
                  ) : (
                    `$${p.sellingPrice.toFixed(2)}`
                  )}
                </li>
                <li>
                  <strong>Threshold:</strong>{' '}
                  {isEditing ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full text-right"
                      value={editForm.lowStockThreshold}
                      onChange={e=>setEditForm(f=>({...f,lowStockThreshold:e.target.value}))}
                    />
                  ) : (
                    p.lowStockThreshold
                  )}
                </li>
              </ul>
              {isEditing && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={()=>saveEdit(p._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="text-center text-gray-500">No products available.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm mt-4 space-y-2 sm:space-y-0">
        <button
          onClick={()=>setPagination(p=>({...p,page:p.page-1}))}
          disabled={pagination.page <= 1}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button
          onClick={()=>setPagination(p=>({...p,page:p.page+1}))}
          disabled={pagination.page >= pagination.totalPages}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
