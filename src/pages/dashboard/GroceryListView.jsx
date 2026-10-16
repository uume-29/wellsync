import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Plus, Trash2, ArrowLeft, X, Check, Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatWholeCurrency } from '../../utils/currency';
import groceryHeaderImg from '../../assets/dashboard/grocery-list.jpg';

const INITIAL_GROCERY_ITEMS = [
  // Produce
  { id: 1, name: 'Haas Avocados', category: 'Produce', qty: 3, unit: 'items', estPrice: 220, purchased: false, fromMealPlan: true },
  { id: 2, name: 'Organic Baby Spinach', category: 'Produce', qty: 1, unit: 'bunch', estPrice: 45, purchased: true, fromMealPlan: true },
  { id: 3, name: 'Fresh Wild Blueberries', category: 'Produce', qty: 1, unit: 'box', estPrice: 180, purchased: false, fromMealPlan: true },
  { id: 4, name: 'Sweet Potatoes', category: 'Produce', qty: 2, unit: 'kg', estPrice: 70, purchased: false, fromMealPlan: true },
  { id: 5, name: 'Meyer Lemons', category: 'Produce', qty: 3, unit: 'items', estPrice: 40, purchased: true, fromMealPlan: true },
  { id: 6, name: 'Organic Cucumbers', category: 'Produce', qty: 1, unit: 'pack', estPrice: 50, purchased: false, fromMealPlan: true },
  // Proteins
  { id: 7, name: 'Wild Alaskan Salmon Fillets', category: 'Proteins', qty: 1, unit: 'pack (300g)', estPrice: 450, purchased: false, fromMealPlan: true },
  { id: 8, name: 'Organic Chickpeas', category: 'Proteins', qty: 2, unit: 'packs', estPrice: 85, purchased: true, fromMealPlan: true },
  { id: 9, name: 'Organic Sprouted Tempeh', category: 'Proteins', qty: 1, unit: 'pack', estPrice: 160, purchased: false, fromMealPlan: true },
  // Pantry & Grains
  { id: 10, name: 'Gluten-Free Rolled Oats', category: 'Pantry', qty: 1, unit: 'bag (500g)', estPrice: 160, purchased: false, fromMealPlan: true },
  { id: 11, name: 'White Organic Quinoa', category: 'Pantry', qty: 1, unit: 'pack (500g)', estPrice: 195, purchased: false, fromMealPlan: true },
  { id: 12, name: 'Raw Black Chia Seeds', category: 'Pantry', qty: 1, unit: 'pouch (250g)', estPrice: 140, purchased: true, fromMealPlan: true },
  { id: 13, name: 'Sesame Tahini Paste', category: 'Pantry', qty: 1, unit: 'jar', estPrice: 240, purchased: false, fromMealPlan: true },
  // Dairy & Alternatives
  { id: 14, name: 'Unsweetened Almond Milk', category: 'Dairy/Alt', qty: 1, unit: 'carton (1L)', estPrice: 210, purchased: false, fromMealPlan: true },
  { id: 15, name: 'Plain Greek Yogurt (400g)', category: 'Dairy/Alt', qty: 1, unit: 'tub', estPrice: 120, purchased: false, fromMealPlan: true },
];

const CATEGORIES = ['Produce', 'Proteins', 'Pantry', 'Dairy/Alt', 'Household'];

export default function GroceryListView() {
  const { user } = useAuth();
  const weeklyBudget = user?.preferences?.weeklyBudget || 2500;

  const [items, setItems] = useState(INITIAL_GROCERY_ITEMS);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'pending', 'purchased'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('item');
  const [newItemPrice, setNewItemPrice] = useState('120');

  // Calculations
  const totalEstPrice = items.reduce((sum, item) => sum + (item.estPrice * (item.qty > 0 ? 1 : 0)), 0);
  const purchasedPrice = items.filter(i => i.purchased).reduce((sum, item) => sum + item.estPrice, 0);
  const remainingBudget = Math.max(0, weeklyBudget - totalEstPrice);
  const budgetUsagePercent = Math.min(100, Math.round((totalEstPrice / weeklyBudget) * 100));

  const togglePurchased = (id) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const handleUpdateQty = (id, delta) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newItemName.trim(),
      category: newItemCategory,
      qty: parseInt(newItemQty, 10) || 1,
      unit: newItemUnit,
      estPrice: parseFloat(newItemPrice) || 80,
      purchased: false,
      fromMealPlan: false,
    };

    setItems(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPrice('120');
  };

  const filteredItems = items.filter(item => {
    if (filterTab === 'pending') return !item.purchased;
    if (filterTab === 'purchased') return item.purchased;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-slide-up pb-16">
      
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-lg px-1.5 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 1. VISUAL HEADER WITH DEDICATED AI GROCERY PHOTOGRAPHY       */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1ED] text-[11px] font-bold text-[#6B8E7B]">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Smart Grocery Organizer</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Aisle & Budget Shopping Cart
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              Organized automatically by supermarket aisle from your confirmed weekly meal plans, keeping you strictly under your {formatWholeCurrency(weeklyBudget)}/week grocery budget.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Item</span>
              </button>

              <Link
                to="/dashboard/profile"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#F8FAF7] hover:bg-[#EBF1ED] text-[#1E293B] text-xs font-bold border border-gray-200/90 transition-all"
              >
                <Sliders className="w-4 h-4 text-[#64748B]" />
                <span>Adjust Budget Target</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-[#EBF1ED] group">
              {!imgError ? (
                <img
                  src={groceryHeaderImg}
                  alt="Artisan farmers market tote overflowing with organic kale, heirloom tomatoes, Meyer lemons, sourdough and glass jars"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#EBF1ED] to-white text-center">
                  <ShoppingCart className="w-8 h-8 text-[#6B8E7B] mb-2" />
                  <span className="text-xs font-bold text-[#1E293B]">Organic Market Haul</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                  Local Farmers Market
                </span>
                <span className="text-[10px] text-[#FAF4E8] font-semibold">
                  Cost Optimized
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. REAL WEEKLY BUDGET METER                                  */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B]">Weekly Budget Gauge</span>
            <h2 className="text-lg font-extrabold text-[#1E293B] mt-0.5">Estimated Basket Cost vs. Budget</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] text-[#64748B] block font-semibold">Total Estimated</span>
              <span className="text-base font-extrabold text-[#1E293B]">{formatCurrency(totalEstPrice)}</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="text-right">
              <span className="text-[10px] text-[#64748B] block font-semibold">Weekly Target</span>
              <span className="text-base font-extrabold text-[#6B8E7B]">{formatWholeCurrency(weeklyBudget)}</span>
            </div>
          </div>
        </div>

        {/* Budget Bar */}
        <div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent > 90 ? 'bg-amber-500' : 'bg-[#6B8E7B]'
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#64748B] mt-1.5 font-semibold">
            <span>{budgetUsagePercent}% of weekly allowance allocated</span>
            <span className="font-bold text-[#1E293B]">{formatCurrency(remainingBudget)} remaining under budget</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CATEGORIZED GROCERY ITEMS & FILTER TABS                   */}
      {/* ============================================================ */}
      <div className="space-y-4">
        
        {/* Filter Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1.5 p-1 bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'all' ? 'bg-[#6B8E7B] text-white shadow-sm' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'pending' ? 'bg-[#6B8E7B] text-white shadow-sm' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              To Buy ({items.filter(i => !i.purchased).length})
            </button>
            <button
              onClick={() => setFilterTab('purchased')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'purchased' ? 'bg-[#6B8E7B] text-white shadow-sm' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Purchased ({items.filter(i => i.purchased).length})
            </button>
          </div>

          <div className="text-xs text-[#64748B]">
            <span>Purchased Total: <strong>{formatCurrency(purchasedPrice)}</strong></span>
          </div>
        </div>

        {/* Categories rendering */}
        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const catItems = filteredItems.filter(i => i.category === category);
            if (catItems.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B]">
                    {category} ({catItems.length})
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B]">
                    {formatCurrency(catItems.reduce((acc, i) => acc + i.estPrice, 0))}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {catItems.map((item) => (
                    <div 
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          onClick={() => togglePurchased(item.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            item.purchased
                              ? 'bg-[#6B8E7B] border-[#6B8E7B] text-white'
                              : 'bg-white border-gray-300 hover:border-[#6B8E7B]'
                          }`}
                        >
                          {item.purchased && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${
                            item.purchased ? 'line-through text-gray-400' : 'text-[#1E293B]'
                          }`}>
                            {item.name}
                          </p>
                          <span className="text-[10px] text-[#64748B]">
                            {item.qty} {item.unit} {item.fromMealPlan && '• Meal Plan synced'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Qty increment */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs">
                          <button
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="px-2 py-0.5 hover:bg-gray-100 text-[#64748B]"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-[#1E293B]">{item.qty}</span>
                          <button
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="px-2 py-0.5 hover:bg-gray-100 text-[#64748B]"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#1E293B] min-w-[60px] text-right">
                          {formatCurrency(item.estPrice * (item.qty > 0 ? 1 : 0))}
                        </span>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-300 hover:text-red-600 p-1 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. ADD ITEM MODAL                                            */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up">
            
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-[#1E293B]">Add Item to Grocery Cart</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chia Seeds"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6B8E7B]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Est. Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1E293B] block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. pack, lb, bunch"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF7] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold transition-colors cursor-pointer mt-2"
              >
                Add Item
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
