import React from 'react';
import ProductTable from '../components/ProductTable';

export default function Products() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <ProductTable />
    </div>
  );
}