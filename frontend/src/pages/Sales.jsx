import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';

const Sales = () => {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/medicines');
        setMedicines(res.data);
      } catch (error) {
        console.error('Error fetching medicines', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const addToCart = () => {
    if (!selectedMedicine || !quantity) return;
    
    const medicine = medicines.find(m => m.id === Number(selectedMedicine));
    if (!medicine) return;

    if (Number(quantity) > medicine.total_stock) {
      setError(`Only ${medicine.total_stock} ${medicine.unit}s available.`);
      return;
    }

    // simple check if already in cart
    const existing = cart.find(item => item.medicine_id === medicine.id);
    if (existing) {
      const newQty = existing.quantity + Number(quantity);
      if (newQty > medicine.total_stock) {
        setError(`Only ${medicine.total_stock} ${medicine.unit}s available.`);
        return;
      }
      setCart(cart.map(item => item.medicine_id === medicine.id ? { ...item, quantity: newQty } : item));
    } else {
      setCart([...cart, { 
        medicine_id: medicine.id, 
        name: medicine.name, 
        quantity: Number(quantity),
        // Just an estimate of price for UI, actual subtotal will be calculated on backend based on batches
        priceEstimate: medicine.batches[0]?.selling_price || 0 
      }]);
    }
    
    setError('');
    setSelectedMedicine('');
    setQuantity('');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.medicine_id !== id));
  };

  const processSale = async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map(item => ({ medicine_id: item.medicine_id, quantity: item.quantity }));
      await axios.post('http://localhost:5005/api/sales', { items });
      setCart([]);
      alert('Sale processed successfully!');
      // Refresh medicines to update stock
      const res = await axios.get('http://localhost:5005/api/medicines');
      setMedicines(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing sale');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Point of Sale</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Entry Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4">Add Item to Cart</h2>
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">Select Medicine</label>
              <select 
                value={selectedMedicine} 
                onChange={(e) => setSelectedMedicine(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select...</option>
                {medicines.filter(m => m.total_stock > 0).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.total_stock} {m.unit}s available)</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-slate-700">Quantity</label>
              <input 
                type="number" 
                min="1"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={addToCart}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-200 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
          <div className="flex items-center space-x-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold">Current Sale</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-slate-500 text-center mt-10">Cart is empty</p>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li key={item.medicine_id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.quantity} qty</p>
                    </div>
                    <button onClick={() => removeFromCart(item.medicine_id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <button 
              onClick={processSale}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${cart.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
