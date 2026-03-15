import { useState, useEffect } from "react";
import CategoriesBLL from "../bll/CategoriesBLL.js";

const typeStyles = {
  income:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  expense: "bg-red-500/10 text-red-400 border-red-500/20",
};

function CategoryModal({ onSave, onClose }) {
  const [form, setForm]       = useState({ name: "", type: "expense" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const result = await CategoriesBLL.create(form);
    if (result.success) onSave();
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-5">Add Category</h3>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Groceries"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-slate-900 font-semibold text-sm transition-all"
          >
            {loading ? "Saving…" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-semibold mb-2">Are you sure?</h3>
        <p className="text-slate-400 text-sm mb-6">This will permanently delete the category.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-medium transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError]   = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const result = await CategoriesBLL.getAll();
    if (result.success) setCategories(result.categories);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await CategoriesBLL.delete(deleteTarget);
    if (result.success) {
      setCategories((prev) => prev.filter((c) => c.category_id !== deleteTarget));
    } else {
      setActionError(result.error);
    }
    setDeleteTarget(null);
  };

  const filtered = categories.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === "all" || c.type === filterType;
    return matchSearch && matchType;
  });

  const incomeCount  = categories.filter((c) => c.type === "income").length;
  const expenseCount = categories.filter((c) => c.type === "expense").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">Manage global transaction categories.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-5 py-4">
          <p className="text-emerald-400 text-2xl font-bold">{incomeCount}</p>
          <p className="text-slate-400 text-sm mt-0.5">Income Categories</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl px-5 py-4">
          <p className="text-red-400 text-2xl font-bold">{expenseCount}</p>
          <p className="text-slate-400 text-sm mt-0.5">Expense Categories</p>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No categories found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Type</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Owner</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((c) => (
                <tr key={c.category_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-white text-sm font-medium">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${typeStyles[c.type]}`}>
                      {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {c.user_id ? `${c.first_name} ${c.last_name}` : (
                      <span className="text-slate-600 italic">Global</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeleteTarget(c.category_id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <p className="text-slate-600 text-xs mt-4">
          Showing {filtered.length} of {categories.length} categories
        </p>
      )}

      {showModal && (
        <CategoryModal
          onSave={() => { setShowModal(false); fetchCategories(); }}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}