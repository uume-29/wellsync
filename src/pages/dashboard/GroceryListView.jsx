import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Plus,
  Trash2,
  ArrowLeft,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Users,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Edit3,
  Box,
  ChevronRight,
  ExternalLink,
  Wallet,
  Receipt,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatCurrency, formatWholeCurrency } from '../../utils/currency';
import groceryHeaderImg from '../../assets/dashboard/grocery-list.jpg';

const CATEGORIES = [
  'All',
  'Produce',
  'Dairy',
  'Grains',
  'Spices',
  'Bakery',
  'Meat/Protein',
  'Canned/Pantry',
  'Beverages',
  'Snacks',
  'Condiments',
  'Other',
];

const COMMON_UNITS = [
  'kg',
  'g',
  'litre',
  'ml',
  'piece',
  'pieces',
  'packet',
  'packets',
  'cup',
  'tbsp',
  'tsp',
  'bunch',
  'box',
  'can',
  'jar',
];

export default function GroceryListView() {
  const { user } = useAuth();

  // Active view tab: 'grocery' | 'pantry'
  const [activeTab, setActiveTab] = useState('grocery');

  // Month state (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [availableMonths, setAvailableMonths] = useState([]);

  // Monthly Grocery Plan State
  const [groceryPlan, setGroceryPlan] = useState(null);
  const [hasMealPlan, setHasMealPlan] = useState(true);
  const [mealPlanTitle, setMealPlanTitle] = useState('');
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [transferringToPantry, setTransferringToPantry] = useState(false);
  const [groceryFilter, setGroceryFilter] = useState('all'); // 'all', 'needed', 'stocked', 'purchased'
  const [groceryCategory, setGroceryCategory] = useState('All');
  const [grocerySearch, setGrocerySearch] = useState('');

  // Modals for Grocery
  const [isAddGroceryModalOpen, setIsAddGroceryModalOpen] = useState(false);
  const [newGroceryItem, setNewGroceryItem] = useState({
    name: '',
    category: 'Produce',
    quantity: 1,
    unit: 'kg',
    notes: '',
  });
  const [editingGroceryItem, setEditingGroceryItem] = useState(null);

  // Budget Management & Spending Tracking State
  const [budgetAnalytics, setBudgetAnalytics] = useState(null);
  const [isRecordBillModalOpen, setIsRecordBillModalOpen] = useState(false);
  const [isBudgetAlternativesModalOpen, setIsBudgetAlternativesModalOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    amount: '',
    store: 'Local Grocery',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [savingBill, setSavingBill] = useState(false);
  const [showBillHistory, setShowBillHistory] = useState(false);

  // Pantry State
  const [pantryItems, setPantryItems] = useState([]);
  const [pantrySummary, setPantrySummary] = useState({
    total: 0,
    available: 0,
    lowStock: 0,
    usedUp: 0,
  });
  const [pantryLoading, setPantryLoading] = useState(false);
  const [pantrySearch, setPantrySearch] = useState('');
  const [pantryCategory, setPantryCategory] = useState('All');
  const [isAddPantryModalOpen, setIsAddPantryModalOpen] = useState(false);
  const [newPantryItem, setNewPantryItem] = useState({
    name: '',
    category: 'Pantry',
    quantity: 1,
    unit: 'g',
    status: 'available',
    notes: '',
  });
  const [editingPantryItem, setEditingPantryItem] = useState(null);

  // Status & Notification Toast
  const [toast, setToast] = useState(null);
  const [imgError, setImgError] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load available months
  const loadMonths = async () => {
    try {
      const res = await api.grocery.getMonths();
      if (res.success && res.months) {
        setAvailableMonths(res.months);
      }
    } catch (err) {
      console.error('Failed to load months:', err);
    }
  };

  // Load grocery plan for selected month
  const loadGroceryPlan = async (monthToLoad = selectedMonth) => {
    setGroceryLoading(true);
    try {
      const res = await api.grocery.getPlan(monthToLoad);
      if (res.success) {
        setGroceryPlan(res.data);
        setHasMealPlan(res.hasMealPlan);
        setMealPlanTitle(res.mealPlanTitle || '');
      }
    } catch (err) {
      console.error('Failed to load grocery plan:', err);
      showToast('Could not load monthly grocery plan from server', 'error');
    } finally {
      setGroceryLoading(false);
    }
  };

  // Generate / Recalculate plan from active meal plan & pantry
  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await api.grocery.generatePlan({ month: selectedMonth });
      if (res.success) {
        setGroceryPlan(res.data);
        setHasMealPlan(res.hasMealPlan);
        if (res.mealPlanTitle) setMealPlanTitle(res.mealPlanTitle);
        showToast(res.message || 'Grocery plan updated successfully!');
        await loadMonths();
        await loadBudgetAnalytics(selectedMonth);
      } else {
        showToast(res.message || 'Failed to generate plan', 'error');
      }
    } catch (err) {
      console.error('Failed to generate grocery plan:', err);
      showToast('Error generating grocery plan', 'error');
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Load budget analytics and practical alternatives
  const loadBudgetAnalytics = async (monthToLoad = selectedMonth) => {
    try {
      const res = await api.grocery.getBudgetAlternatives(monthToLoad);
      if (res && res.success) {
        setBudgetAnalytics(res);
      }
    } catch (err) {
      console.warn('Could not load budget alternatives:', err.message);
    }
  };

  // Load pantry items
  const loadPantry = async () => {
    setPantryLoading(true);
    try {
      const res = await api.pantry.getItems();
      if (res.success) {
        setPantryItems(res.data || []);
        setPantrySummary(res.summary || { total: 0, available: 0, lowStock: 0, usedUp: 0 });
      }
    } catch (err) {
      console.error('Failed to load pantry items:', err);
      showToast('Could not load pantry inventory', 'error');
    } finally {
      setPantryLoading(false);
    }
  };

  // Record an actual shopping bill
  const handleRecordBill = async (e) => {
    e.preventDefault();
    if (!newBill.amount || isNaN(newBill.amount) || Number(newBill.amount) <= 0) {
      showToast('Please enter a valid bill amount in INR', 'error');
      return;
    }

    setSavingBill(true);
    try {
      const res = await api.grocery.recordBill({
        month: selectedMonth,
        amount: Number(newBill.amount),
        store: newBill.store,
        date: newBill.date,
        notes: newBill.notes,
      });

      if (res.success) {
        showToast(res.message || 'Shopping bill recorded successfully!');
        setIsRecordBillModalOpen(false);
        setNewBill({
          amount: '',
          store: 'Local Grocery',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        await loadGroceryPlan(selectedMonth);
        await loadBudgetAnalytics(selectedMonth);
      } else {
        showToast(res.message || 'Failed to record bill', 'error');
      }
    } catch (err) {
      console.error('Error recording bill:', err);
      showToast(err.response?.data?.message || 'Error recording bill', 'error');
    } finally {
      setSavingBill(false);
    }
  };

  // Delete a recorded shopping bill
  const handleDeleteBill = async (billId) => {
    try {
      const res = await api.grocery.deleteBill(billId, selectedMonth);
      if (res.success) {
        showToast(res.message || 'Shopping bill removed.');
        await loadGroceryPlan(selectedMonth);
        await loadBudgetAnalytics(selectedMonth);
      }
    } catch (err) {
      console.error('Error deleting bill:', err);
      showToast('Failed to delete shopping bill', 'error');
    }
  };

  // Initial load
  useEffect(() => {
    loadMonths();
    loadGroceryPlan(selectedMonth);
    loadBudgetAnalytics(selectedMonth);
    loadPantry();
  }, []);

  // When selectedMonth changes, reload grocery plan & budget
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    loadGroceryPlan(newMonth);
    loadBudgetAnalytics(newMonth);
  };

  // ================= GROCERY ACTIONS =================

  const handleToggleGroceryPurchased = async (itemId) => {
    try {
      const res = await api.grocery.togglePurchase(itemId, selectedMonth);
      if (res.success) {
        setGroceryPlan(res.data);
      }
    } catch (err) {
      console.error('Failed to toggle purchase:', err);
      showToast('Failed to update item status', 'error');
    }
  };

  const handleAddGroceryToPantry = async (itemId, itemName) => {
    try {
      const res = await api.grocery.addToPantry(itemId, selectedMonth);
      if (res.success) {
        setGroceryPlan(res.data);
        showToast(`Added ${itemName} to Pantry Inventory!`);
        await loadPantry();
      }
    } catch (err) {
      console.error('Failed to add to pantry:', err);
      showToast('Failed to add item to pantry', 'error');
    }
  };

  const handleDeleteGroceryItem = async (itemId) => {
    try {
      const res = await api.grocery.deleteItem(itemId, selectedMonth);
      if (res.success) {
        setGroceryPlan(res.data);
        showToast('Item removed from monthly plan');
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      showToast('Failed to remove item', 'error');
    }
  };

  const handleCreateCustomGrocery = async (e) => {
    e.preventDefault();
    if (!newGroceryItem.name.trim()) return;

    try {
      const res = await api.grocery.addItem({
        month: selectedMonth,
        name: newGroceryItem.name.trim(),
        category: newGroceryItem.category,
        quantity: parseFloat(newGroceryItem.quantity) || 1,
        unit: newGroceryItem.unit,
        notes: newGroceryItem.notes,
      });

      if (res.success) {
        setGroceryPlan(res.data);
        setIsAddGroceryModalOpen(false);
        setNewGroceryItem({ name: '', category: 'Produce', quantity: 1, unit: 'kg', notes: '' });
        showToast('Custom item added to grocery list');
      }
    } catch (err) {
      console.error('Failed to add custom item:', err);
      showToast('Failed to add custom item', 'error');
    }
  };

  const handleSaveGroceryEdit = async (e) => {
    e.preventDefault();
    if (!editingGroceryItem) return;

    try {
      const res = await api.grocery.updateItem(editingGroceryItem._id, {
        month: selectedMonth,
        name: editingGroceryItem.name,
        category: editingGroceryItem.category,
        neededQuantity: parseFloat(editingGroceryItem.neededQuantity) || 0,
        neededUnit: editingGroceryItem.neededUnit,
        notes: editingGroceryItem.notes,
      });

      if (res.success) {
        setGroceryPlan(res.data);
        setEditingGroceryItem(null);
        showToast('Item updated successfully');
      }
    } catch (err) {
      console.error('Failed to update grocery item:', err);
      showToast('Failed to update item', 'error');
    }
  };

  // Helper to compute next month YYYY-MM
  const getNextMonthStr = (monthStr) => {
    if (!monthStr || !monthStr.includes('-')) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`;
    }
    const [y, m] = monthStr.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    return `${nextYear}-${nextMonth}`;
  };

  // Finalize or reopen month cycle
  const handleFinalizePlan = async (status = 'completed') => {
    try {
      const res = await api.grocery.finalizePlan(selectedMonth, status);
      if (res.success) {
        setGroceryPlan(res.data);
        await loadMonths();
        showToast(res.message || `Monthly grocery cycle marked as ${status}!`);
      }
    } catch (err) {
      console.error('Failed to update plan status:', err);
      showToast(err.response?.data?.message || 'Failed to update plan status', 'error');
    }
  };

  // Batch transfer all purchased items to Pantry Inventory
  const handleTransferAllPurchased = async () => {
    try {
      setTransferringToPantry(true);
      const res = await api.grocery.transferAllToPantry(selectedMonth);
      if (res.success) {
        setGroceryPlan(res.data);
        await loadPantry();
        showToast(res.message || 'Transferred purchased items to Pantry!');
      }
    } catch (err) {
      console.error('Failed to transfer to pantry:', err);
      showToast(err.response?.data?.message || 'Failed to transfer items to pantry', 'error');
    } finally {
      setTransferringToPantry(false);
    }
  };

  // Advance to next month cycle, preserving history and applying replenished pantry
  const handleStartNextMonth = async () => {
    const nextMonth = getNextMonthStr(selectedMonth);
    try {
      setGeneratingPlan(true);
      setSelectedMonth(nextMonth);
      const res = await api.grocery.generatePlan({ month: nextMonth });
      if (res.success) {
        setGroceryPlan(res.data);
        await loadMonths();
        await loadBudgetAnalytics(nextMonth);
        showToast(`Initialized monthly grocery cycle for ${nextMonth}!`);
      }
    } catch (err) {
      console.error('Failed to start next month:', err);
      showToast(err.response?.data?.message || 'Failed to start next month', 'error');
    } finally {
      setGeneratingPlan(false);
    }
  };

  // ================= PANTRY ACTIONS =================

  const handleCreatePantryItem = async (e) => {
    e.preventDefault();
    if (!newPantryItem.name.trim()) return;

    try {
      const res = await api.pantry.addItem(newPantryItem);
      if (res.success) {
        await loadPantry();
        setIsAddPantryModalOpen(false);
        setNewPantryItem({
          name: '',
          category: 'Pantry',
          quantity: 1,
          unit: 'g',
          status: 'available',
          notes: '',
        });
        showToast('Pantry item added successfully');
      }
    } catch (err) {
      console.error('Failed to add pantry item:', err);
      showToast('Failed to add pantry item', 'error');
    }
  };

  const handleTogglePantryStatus = async (id) => {
    try {
      const res = await api.pantry.toggleStatus(id);
      if (res.success) {
        await loadPantry();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleUpdatePantryQty = async (item, delta) => {
    const newQty = Math.max(0, item.quantity + delta);
    try {
      const res = await api.pantry.updateItem(item._id, { quantity: newQty });
      if (res.success) {
        await loadPantry();
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
      showToast('Failed to update quantity', 'error');
    }
  };

  const handleDeletePantryItem = async (id) => {
    try {
      const res = await api.pantry.deleteItem(id);
      if (res.success) {
        await loadPantry();
        showToast('Pantry item removed');
      }
    } catch (err) {
      console.error('Failed to delete pantry item:', err);
      showToast('Failed to delete pantry item', 'error');
    }
  };

  const handleSavePantryEdit = async (e) => {
    e.preventDefault();
    if (!editingPantryItem) return;

    try {
      const res = await api.pantry.updateItem(editingPantryItem._id, editingPantryItem);
      if (res.success) {
        await loadPantry();
        setEditingPantryItem(null);
        showToast('Pantry item updated');
      }
    } catch (err) {
      console.error('Failed to update pantry item:', err);
      showToast('Failed to update pantry item', 'error');
    }
  };

  // ================= FILTERING =================

  const filteredGroceryItems = (groceryPlan?.items || []).filter((item) => {
    // Status filter
    if (groceryFilter === 'needed' && (item.neededQuantity === 0 || item.isPurchased)) return false;
    if (groceryFilter === 'stocked' && item.neededQuantity > 0) return false;
    if (groceryFilter === 'purchased' && !item.isPurchased) return false;

    // Category filter
    if (groceryCategory !== 'All' && item.category !== groceryCategory) return false;

    // Search filter
    if (grocerySearch.trim()) {
      const q = grocerySearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredPantryItems = pantryItems.filter((item) => {
    if (pantryCategory !== 'All' && item.category !== pantryCategory) return false;
    if (pantrySearch.trim()) {
      const q = pantrySearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl min-h-[220px] flex items-center">
        {!imgError ? (
          <img
            src={groceryHeaderImg}
            alt="Grocery Planning"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter blur-[0.5px]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                </Link>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Phase 3: Pantry & Monthly Grocery
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-emerald-400" />
                Smart Grocery & Pantry Hub
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
                Aggregate meal plan ingredients scaled for your household size, deduct available
                pantry inventory, and plan your monthly provisions with safe unit conversions.
              </p>
            </div>

            {/* Quick Tab Switcher */}
            <div className="inline-flex p-1.5 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shrink-0">
              <button
                onClick={() => setActiveTab('grocery')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'grocery'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Monthly Grocery Plan
              </button>
              <button
                onClick={() => setActiveTab('pantry')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'pantry'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Package className="w-4 h-4" />
                Pantry Inventory ({pantrySummary.total})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MONTHLY GROCERY PLANNING                                */}
      {/* ============================================================== */}
      {activeTab === 'grocery' && (
        <div className="space-y-6">
          {/* Controls Bar: Month Picker, Status Badge, Cycle Finalization, Pantry Replenishment, and Next Cycle */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-slate-700">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {new Date(`${m}-01`).toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                      })} ({m})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cycle Status Badge */}
              {groceryPlan?.status === 'completed' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  Cycle Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Active Cycle
                </span>
              )}

              {/* Finalize / Reopen Cycle Toggle */}
              {groceryPlan?.status === 'completed' ? (
                <button
                  type="button"
                  onClick={() => handleFinalizePlan('active')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all cursor-pointer"
                  title="Reopen this month cycle for active edits"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Cycle</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleFinalizePlan('completed')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                  title="Finalize this monthly cycle and mark as completed"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Finalize Month</span>
                </button>
              )}

              {groceryPlan?.householdSize && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                  <Users className="w-4 h-4 text-slate-500" />
                  Household: <strong className="text-slate-900">{groceryPlan.householdSize}</strong>{' '}
                  {groceryPlan.householdSize > 1 ? 'people' : 'person'} (4-week cycle)
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Batch Transfer Purchased Items to Pantry */}
              {(() => {
                const untransferred = (groceryPlan?.items || []).filter(
                  (i) => i.isPurchased && !i.isTransferredToPantry
                ).length;
                return (
                  <button
                    type="button"
                    onClick={handleTransferAllPurchased}
                    disabled={transferringToPantry || untransferred === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={
                      untransferred > 0
                        ? `Transfer ${untransferred} purchased item(s) into Pantry Inventory`
                        : 'Mark items as purchased to transfer them into Pantry'
                    }
                  >
                    <Package className={`w-3.5 h-3.5 ${transferringToPantry ? 'animate-spin' : ''}`} />
                    <span>Transfer to Pantry</span>
                    {untransferred > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-teal-900/40 text-teal-100 text-[10px] font-extrabold">
                        {untransferred}
                      </span>
                    )}
                  </button>
                );
              })()}

              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generatingPlan ? 'animate-spin' : ''}`} />
                {generatingPlan ? 'Recalculating...' : 'Recalculate with Pantry'}
              </button>

              {/* Advance to Next Month Cycle */}
              <button
                type="button"
                onClick={handleStartNextMonth}
                disabled={generatingPlan}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                title={`Advance to next month cycle (${getNextMonthStr(selectedMonth)})`}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next Cycle ({getNextMonthStr(selectedMonth)})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsAddGroceryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Item</span>
              </button>
            </div>
          </div>

          {/* Missing Meal Plan Notice */}
          {!hasMealPlan && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    No Active AI Meal Plan Detected
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Generating a personalized meal plan in the AI Meal Planner allows WellSync to
                    automatically calculate exact ingredient quantities scaled for your household size and
                    deduct pantry stock.
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard/meals"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors shadow-sm"
              >
                Go to Meal Planner <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* ============================================================== */}
          {/* MONTHLY FOOD BUDGET & ACTUAL SPENDING TRACKER CARD             */}
          {/* ============================================================== */}
          {(() => {
            const monthlyBudget =
              groceryPlan?.budget?.monthlyBudget ||
              budgetAnalytics?.analysis?.monthlyBudget ||
              (user?.preferences?.weeklyBudget ? user.preferences.weeklyBudget * 4 : 10000);
            const plannedSpending =
              groceryPlan?.budget?.plannedSpending ||
              budgetAnalytics?.analysis?.plannedSpending ||
              0;
            const recordedBills = groceryPlan?.budget?.recordedBills || [];
            const actualSpending =
              groceryPlan?.budget?.actualSpending ??
              budgetAnalytics?.analysis?.actualSpending ??
              recordedBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
            const remainingBudget = monthlyBudget - actualSpending;
            const percentageSpent =
              monthlyBudget > 0
                ? Math.min(100, Math.round((actualSpending / monthlyBudget) * 100))
                : 0;
            const plannedPercentage =
              monthlyBudget > 0
                ? Math.min(100, Math.round((plannedSpending / monthlyBudget) * 100))
                : 0;

            return (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF4E8] text-[#D9A441] border border-[#D9A441]/30 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                      <Wallet className="w-5 h-5 text-[#D9A441]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#1E293B]">
                          Monthly Food Budget & Spending Tracker
                        </h3>
                        <span className="text-[10px] font-bold text-[#6B8E7B] bg-[#EBF1ED] px-2 py-0.5 rounded-md">
                          {selectedMonth}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track planned recipe requirements vs real grocery shopping bills without guessing prices.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsRecordBillModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#D9A441]" />
                      <span>Record Shopping Bill</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBudgetAlternativesModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#6B8E7B] border border-[#6B8E7B]/30 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#D9A441]" />
                      <span>Budget Alternatives</span>
                    </button>
                  </div>
                </div>

                {/* Financial Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Monthly Budget Target */}
                  <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Monthly Budget
                      </span>
                      <Link
                        to="/dashboard/profile"
                        className="text-[10px] font-bold text-[#6B8E7B] hover:underline"
                        title="Change monthly budget in Profile"
                      >
                        Edit Target
                      </Link>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#1E293B]">
                      {formatWholeCurrency(monthlyBudget)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      ~{formatWholeCurrency(Math.round(monthlyBudget / 4))}/week allocation
                    </p>
                  </div>

                  {/* 2. Planned Grocery Expenditure */}
                  <div className="bg-[#F8FAF7] p-4 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Planned Expenditure
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-slate-900">
                      {formatWholeCurrency(plannedSpending)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Based on active 4-week meal plan
                    </p>
                  </div>

                  {/* 3. Actual Recorded Spending */}
                  <div className="bg-[#FAF4E8] p-4 rounded-2xl border border-[#D9A441]/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        Actual Spending
                      </span>
                      <span className="text-[10px] font-bold text-[#D9A441]">
                        {recordedBills.length} {recordedBills.length === 1 ? 'receipt' : 'receipts'}
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#1E293B]">
                      {formatWholeCurrency(actualSpending)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {percentageSpent}% of budget used
                    </p>
                  </div>

                  {/* 4. Remaining Budget */}
                  <div
                    className={`p-4 rounded-2xl border space-y-1 ${
                      remainingBudget < 0
                        ? 'bg-rose-50 border-rose-200'
                        : remainingBudget < monthlyBudget * 0.15
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          remainingBudget < 0 ? 'text-rose-700' : 'text-emerald-800'
                        }`}
                      >
                        Remaining Budget
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          remainingBudget < 0
                            ? 'bg-rose-200/80 text-rose-800'
                            : remainingBudget < monthlyBudget * 0.15
                            ? 'bg-amber-200/80 text-amber-800'
                            : 'bg-emerald-200/80 text-emerald-800'
                        }`}
                      >
                        {remainingBudget < 0
                          ? 'Over Budget'
                          : remainingBudget < monthlyBudget * 0.15
                          ? 'Near Limit'
                          : 'On Track'}
                      </span>
                    </div>
                    <p
                      className={`text-xl sm:text-2xl font-black ${
                        remainingBudget < 0 ? 'text-rose-700' : 'text-emerald-800'
                      }`}
                    >
                      {formatWholeCurrency(remainingBudget)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {remainingBudget < 0
                        ? `Over by ${formatWholeCurrency(Math.abs(remainingBudget))}`
                        : `${formatWholeCurrency(remainingBudget)} available for groceries`}
                    </p>
                  </div>
                </div>

                {/* Visual Dual-Spending Meter */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]" />
                      <span>Actual Spent: {percentageSpent}%</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#6B8E7B]" />
                      <span>Planned: {plannedPercentage}% of budget</span>
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex relative">
                    <div
                      className={`h-full transition-all duration-500 ${
                        actualSpending > monthlyBudget ? 'bg-rose-500' : 'bg-[#D9A441]'
                      }`}
                      style={{ width: `${Math.min(100, percentageSpent)}%` }}
                    />
                  </div>
                </div>

                {/* Budget Overrun Warning Banner */}
                {(plannedSpending > monthlyBudget || actualSpending > monthlyBudget) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Budget Advisory:</strong>{' '}
                        {plannedSpending > monthlyBudget
                          ? `Your 4-week planned meals (₹${plannedSpending}) exceed your monthly budget of ₹${monthlyBudget}.`
                          : `Your actual recorded spending (₹${actualSpending}) has exceeded your target budget.`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBudgetAlternativesModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
                    >
                      <span>View Cheaper Swaps & Savings Tips</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Toggleable Recorded Bills History */}
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowBillHistory(!showBillHistory)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {showBillHistory
                          ? 'Hide Shopping Receipts'
                          : `View Shopping Receipts (${recordedBills.length})`}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          showBillHistory ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {recordedBills.length > 0 && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Total Recorded: {formatWholeCurrency(actualSpending)}
                      </span>
                    )}
                  </div>

                  {showBillHistory && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      {recordedBills.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-3">
                          No receipts recorded yet for {selectedMonth}. Click "Record Shopping Bill" above
                          after shopping.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {recordedBills.map((bill) => (
                            <div
                              key={bill._id}
                              className="bg-[#F8FAF7] border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-bold text-slate-900">
                                  {bill.store || 'Grocery Store'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(bill.date).toLocaleDateString()}
                                  {bill.notes ? ` • ${bill.notes}` : ''}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[#D9A441]">
                                  {formatWholeCurrency(bill.amount)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBill(bill._id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete receipt"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Grocery Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Items
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {groceryPlan?.summary?.totalItems || groceryPlan?.items?.length || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                <Box className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Needed to Buy
                </p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {groceryPlan?.summary?.neededItems ??
                    (groceryPlan?.items || []).filter((i) => i.neededQuantity > 0).length}
                </p>
              </div>
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                  Covered by Pantry
                </p>
                <p className="text-2xl font-black text-teal-600 mt-1">
                  {groceryPlan?.summary?.stockedItems ??
                    (groceryPlan?.items || []).filter(
                      (i) => i.neededQuantity === 0 && !i.unitMismatch
                    ).length}
                </p>
              </div>
              <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Purchased
                </p>
                <p className="text-2xl font-black text-indigo-600 mt-1">
                  {groceryPlan?.summary?.purchasedItems ??
                    (groceryPlan?.items || []).filter((i) => i.isPurchased).length}
                </p>
              </div>
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
              {[
                { id: 'all', label: 'All Items' },
                { id: 'needed', label: 'To Buy' },
                { id: 'stocked', label: 'In Pantry' },
                { id: 'purchased', label: 'Purchased' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setGroceryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    groceryFilter === f.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search grocery item..."
                  value={grocerySearch}
                  onChange={(e) => setGrocerySearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 md:w-60 text-slate-800"
                />
              </div>

              <select
                value={groceryCategory}
                onChange={(e) => setGroceryCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grocery Item List */}
          {groceryLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Loading monthly grocery plan...</p>
            </div>
          ) : filteredGroceryItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Grocery Items Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {groceryPlan?.items?.length === 0
                  ? 'Click "Recalculate with Pantry" to aggregate ingredients from your active meal plan, or add custom grocery items.'
                  : 'No items match your active filter or search query.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleGeneratePlan}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Calculate from Meal Plan
                </button>
                <button
                  onClick={() => setIsAddGroceryModalOpen(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Add Custom Item
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {filteredGroceryItems.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    item.isPurchased ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
                  }`}
                >
                  {/* Left: Purchase toggle & Details */}
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleGroceryPurchased(item._id)}
                      className={`w-6 h-6 mt-0.5 rounded-lg border flex items-center justify-center transition-all ${
                        item.isPurchased
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-emerald-500 bg-white'
                      }`}
                      title={item.isPurchased ? 'Mark as pending' : 'Mark as purchased'}
                    >
                      {item.isPurchased && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm md:text-base font-bold ${
                            item.isPurchased
                              ? 'text-slate-400 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.name}
                        </span>

                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>

                        {item.isUserAdded && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                            Custom
                          </span>
                        )}

                        {item.isUserEdited && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            Edited
                          </span>
                        )}

                        {item.neededQuantity === 0 && !item.unitMismatch && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                            Fully in Pantry
                          </span>
                        )}

                        {item.isTransferredToPantry && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3 text-teal-700 stroke-[3]" /> Stocked in Pantry
                          </span>
                        )}
                      </div>

                      {/* Quantities breakdown */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                        <span>
                          Required:{' '}
                          <strong className="text-slate-700 font-semibold">
                            {item.requiredQuantity} {item.requiredUnit}
                          </strong>
                        </span>

                        <span>•</span>

                        <span>
                          In Pantry:{' '}
                          <strong
                            className={
                              item.pantryQuantity > 0 ? 'text-teal-700 font-semibold' : 'text-slate-500'
                            }
                          >
                            {item.pantryQuantity > 0
                              ? `${item.pantryQuantity} ${item.pantryUnit}`
                              : '0'}
                          </strong>
                        </span>

                        <span>•</span>

                        <span>
                          To Buy:{' '}
                          <strong
                            className={`font-bold ${
                              item.neededQuantity > 0
                                ? item.isPurchased
                                  ? 'text-slate-500 line-through'
                                  : 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {item.neededQuantity} {item.neededUnit}
                          </strong>
                        </span>
                      </div>

                      {/* Unit Mismatch Alert */}
                      {item.unitMismatch && (
                        <div className="mt-2 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{item.unitMismatchMessage}</span>
                        </div>
                      )}

                      {/* User Notes */}
                      {item.notes && (
                        <p className="text-xs text-slate-500 italic mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Add to Pantry Button */}
                    {item.isTransferredToPantry ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-xl border border-teal-200">
                        <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3]" />
                        In Pantry
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddGroceryToPantry(item._id, item.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-xl border border-teal-200 transition-colors cursor-pointer"
                        title="Add this item directly to your Pantry Inventory"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Add to Pantry
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingGroceryItem({ ...item })}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteGroceryItem(item._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PANTRY INVENTORY                                        */}
      {/* ============================================================== */}
      {activeTab === 'pantry' && (
        <div className="space-y-6">
          {/* Pantry Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                Pantry Ingredients at Home
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep stock updated so monthly grocery planning deducts what you already own.
              </p>
            </div>

            <button
              onClick={() => setIsAddPantryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Pantry Ingredient
            </button>
          </div>

          {/* Pantry Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Pantry Items
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">{pantrySummary.total}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                In Stock & Available
              </p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{pantrySummary.available}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Low Stock
              </p>
              <p className="text-2xl font-black text-amber-600 mt-1">{pantrySummary.lowStock}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Used Up
              </p>
              <p className="text-2xl font-black text-slate-400 mt-1">{pantrySummary.usedUp}</p>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search pantry ingredient..."
                  value={pantrySearch}
                  onChange={(e) => setPantrySearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-48 md:w-60 text-slate-800"
                />
              </div>

              <select
                value={pantryCategory}
                onChange={(e) => setPantryCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pantry Items Grid */}
          {pantryLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Loading pantry inventory...</p>
            </div>
          ) : filteredPantryItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Pantry Ingredients</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Add ingredients you currently have at home so they can be deducted from your monthly
                grocery plan automatically.
              </p>
              <button
                onClick={() => setIsAddPantryModalOpen(true)}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                Add First Pantry Ingredient
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPantryItems.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                    item.status === 'used_up'
                      ? 'border-slate-200 bg-slate-50/60 opacity-70'
                      : 'border-slate-200/80 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          className={`font-bold text-base ${
                            item.status === 'used_up'
                              ? 'text-slate-500 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">
                          {item.category}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <button
                        onClick={() => handleTogglePantryStatus(item._id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          item.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : item.status === 'low_stock'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title="Click to toggle available / used up"
                      >
                        {item.status === 'available'
                          ? 'Available'
                          : item.status === 'low_stock'
                          ? 'Low Stock'
                          : 'Used Up'}
                      </button>
                    </div>

                    {/* Quantity Display & Steppers */}
                    <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                      <span className="text-xs font-semibold text-slate-500">Current Stock:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdatePantryQty(item, -1)}
                          className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-sm"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-sm font-extrabold text-slate-900 min-w-[50px] text-center">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => handleUpdatePantryQty(item, 1)}
                          className="w-7 h-7 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-sm"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-500 italic mt-2.5">{item.notes}</p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleTogglePantryStatus(item._id)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      {item.status === 'used_up' ? 'Restore Stock' : 'Mark Used Up'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingPantryItem({ ...item })}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit pantry item"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePantryItem(item._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete pantry item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD CUSTOM GROCERY ITEM                               */}
      {/* ============================================================== */}
      {isAddGroceryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add Custom Grocery Item
              </h3>
              <button
                onClick={() => setIsAddGroceryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomGrocery} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rolled Oats, Greek Yogurt"
                  value={newGroceryItem.name}
                  onChange={(e) => setNewGroceryItem({ ...newGroceryItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={newGroceryItem.quantity}
                    onChange={(e) =>
                      setNewGroceryItem({ ...newGroceryItem, quantity: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <select
                    value={newGroceryItem.unit}
                    onChange={(e) => setNewGroceryItem({ ...newGroceryItem, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newGroceryItem.category}
                  onChange={(e) =>
                    setNewGroceryItem({ ...newGroceryItem, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Brand (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic, brand preference"
                  value={newGroceryItem.notes}
                  onChange={(e) => setNewGroceryItem({ ...newGroceryItem, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddGroceryModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT GROCERY ITEM                                     */}
      {/* ============================================================== */}
      {editingGroceryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                Edit Grocery Item
              </h3>
              <button
                onClick={() => setEditingGroceryItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroceryEdit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={editingGroceryItem.name}
                  onChange={(e) =>
                    setEditingGroceryItem({ ...editingGroceryItem, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Needed to Buy
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editingGroceryItem.neededQuantity}
                    onChange={(e) =>
                      setEditingGroceryItem({
                        ...editingGroceryItem,
                        neededQuantity: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <select
                    value={editingGroceryItem.neededUnit}
                    onChange={(e) =>
                      setEditingGroceryItem({
                        ...editingGroceryItem,
                        neededUnit: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={editingGroceryItem.category}
                  onChange={(e) =>
                    setEditingGroceryItem({
                      ...editingGroceryItem,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={editingGroceryItem.notes || ''}
                  onChange={(e) =>
                    setEditingGroceryItem({ ...editingGroceryItem, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingGroceryItem(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ADD PANTRY ITEM                                       */}
      {/* ============================================================== */}
      {isAddPantryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                Add Pantry Ingredient
              </h3>
              <button
                onClick={() => setIsAddPantryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePantryItem} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice, Olive Oil, Cumin"
                  value={newPantryItem.name}
                  onChange={(e) => setNewPantryItem({ ...newPantryItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={newPantryItem.quantity}
                    onChange={(e) =>
                      setNewPantryItem({ ...newPantryItem, quantity: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <select
                    value={newPantryItem.unit}
                    onChange={(e) => setNewPantryItem({ ...newPantryItem, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newPantryItem.category}
                    onChange={(e) =>
                      setNewPantryItem({ ...newPantryItem, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={newPantryItem.status}
                    onChange={(e) =>
                      setNewPantryItem({ ...newPantryItem, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="available">Available</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="used_up">Used Up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. In upper shelf, opened pack"
                  value={newPantryItem.notes}
                  onChange={(e) => setNewPantryItem({ ...newPantryItem, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddPantryModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
                >
                  Save to Pantry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: EDIT PANTRY ITEM                                      */}
      {/* ============================================================== */}
      {editingPantryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                Edit Pantry Ingredient
              </h3>
              <button
                onClick={() => setEditingPantryItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePantryEdit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPantryItem.name}
                  onChange={(e) =>
                    setEditingPantryItem({ ...editingPantryItem, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editingPantryItem.quantity}
                    onChange={(e) =>
                      setEditingPantryItem({ ...editingPantryItem, quantity: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <select
                    value={editingPantryItem.unit}
                    onChange={(e) =>
                      setEditingPantryItem({ ...editingPantryItem, unit: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={editingPantryItem.category}
                    onChange={(e) =>
                      setEditingPantryItem({ ...editingPantryItem, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={editingPantryItem.status}
                    onChange={(e) =>
                      setEditingPantryItem({ ...editingPantryItem, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="available">Available</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="used_up">Used Up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={editingPantryItem.notes || ''}
                  onChange={(e) =>
                    setEditingPantryItem({ ...editingPantryItem, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPantryItem(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: RECORD ACTUAL GROCERY SHOPPING BILL                   */}
      {/* ============================================================== */}
      {isRecordBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-slide-up">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4 text-[#D9A441]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B]">
                    Record Grocery Shopping Bill
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedMonth}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordBillModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bill Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 1450"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8E7B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Store / Market Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Supermarket, Local Sabzi Mandi, Blinkit"
                  value={newBill.store}
                  onChange={(e) => setNewBill({ ...newBill, store: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8E7B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Purchase
                </label>
                <input
                  type="date"
                  required
                  value={newBill.date}
                  onChange={(e) => setNewBill({ ...newBill, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8E7B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly dry staples, dairy, fresh vegetables"
                  value={newBill.notes}
                  onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8E7B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordBillModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBill}
                  className="px-5 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingBill ? 'Recording...' : 'Save Shopping Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: BUDGET-FRIENDLY ALTERNATIVES & SAVINGS TIPS          */}
      {/* ============================================================== */}
      {isBudgetAlternativesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-slide-up">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF4E8] text-[#D9A441] border border-[#D9A441]/30 flex items-center justify-center font-bold">
                  <Lightbulb className="w-5 h-5 text-[#D9A441]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E293B]">
                    Budget-Conscious Ingredient Alternatives
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clinically sound swaps that reduce grocery expenses without sacrificing nutrition.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBudgetAlternativesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Budget Analytics Summary Box */}
            {budgetAnalytics?.analysis && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F8FAF7] rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Monthly Budget</span>
                  <span className="font-bold text-[#1E293B]">
                    {formatWholeCurrency(budgetAnalytics.analysis.monthlyBudget)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Planned 4-Week Cost</span>
                  <span className="font-bold text-slate-900">
                    {formatWholeCurrency(budgetAnalytics.analysis.plannedSpending)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Actual Spending</span>
                  <span className="font-bold text-[#D9A441]">
                    {formatWholeCurrency(budgetAnalytics.analysis.actualSpending)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Remaining</span>
                  <span
                    className={`font-bold ${
                      budgetAnalytics.analysis.remainingBudget < 0
                        ? 'text-rose-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {formatWholeCurrency(budgetAnalytics.analysis.remainingBudget)}
                  </span>
                </div>
              </div>
            )}

            {/* Swaps List */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B]">
                Recommended Grocery Substitutions
              </h4>

              <div className="space-y-2.5">
                {(budgetAnalytics?.budgetSwaps || []).map((swap, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-slate-100 hover:border-slate-200 transition-colors space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 line-through">
                          {swap.premiumItem}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#6B8E7B]" />
                        <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {swap.budgetAlternative}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#D9A441] bg-[#FAF4E8] px-2 py-0.5 rounded-md border border-[#D9A441]/30">
                        Saves ~{swap.savingsEstimated}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {swap.clinicalNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Tips */}
            <div className="p-4 rounded-2xl bg-[#EBF1ED] border border-[#6B8E7B]/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#17201B] font-extrabold">
                <Sparkles className="w-4 h-4 text-[#6B8E7B]" />
                <span>Smart Grocery Savings Habits</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#17201B] list-disc pl-4 leading-relaxed">
                {(
                  budgetAnalytics?.actionableTips || [
                    'Buy legumes and whole grains in monthly family packs rather than weekly retail packets to save 15-25%.',
                    'Check your Pantry Inventory before grocery shopping to avoid duplicate purchases.',
                    'Prioritize seasonal local produce over imported off-season vegetables for better nutrient retention and lower cost.',
                    'Batch-cook base gravies and freeze in portions to reduce fresh produce waste.',
                  ]
                ).map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBudgetAlternativesModalOpen(false)}
                className="px-5 py-2.5 bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
