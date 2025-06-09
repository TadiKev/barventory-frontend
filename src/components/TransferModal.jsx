import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function TransferModal({ product, fromBar, onClose }) {
  const { requestTransfer } = useContext(AppContext);
  const [toBar, setToBar] = useState('');
  const [qty, setQty]     = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    await requestTransfer({ productId: product._id, qty, fromBar, toBar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-4 rounded">
        <h2>Transfer {product.name}</h2>
        <select required value={toBar} onChange={e=>setToBar(e.target.value)}>
          <option value="">Select destination bar</option>
          {/* map your bars from context */}
        </select>
        <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} />
        <button type="submit">Request</button>
      </form>
    </div>
  );
}
