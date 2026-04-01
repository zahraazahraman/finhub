import { useState, useEffect } from "react";
import CategoriesBLL from "../bll/CategoriesBLL.js";
import { useNotifications } from "../context/NotificationContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Table from "../components/ui/Table.jsx";
import Select from "../components/ui/Select.jsx";
import { CATEGORY_TYPES, CATEGORY_TYPE_STYLES } from "../utils/constants.js";

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
    <Modal
      title="Add Category"
      onClose={onClose}
      showFooter
      confirmLabel="Add Category"
      cancelLabel="Cancel"
      onConfirm={handleSubmit}
      loading={loading}
    >
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <Input
        id="name"
        label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="e.g. Groceries"
      />
      <div className="mb-4">
        <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">Type</label>
        <Select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          options={CATEGORY_TYPES.map((t) => ({
            value: t,
            label: t.charAt(0).toUpperCase() + t.slice(1),
          }))}
          className="w-full"
        />
      </div>
    </Modal>
  );
}

export default function Categories() {
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filterType, setFilterType]     = useState("all");
  const [showModal, setShowModal]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError]   = useState("");
  const { refreshCount }                = useNotifications();

  const fetchCategories = async () => {
    setLoading(true);
    const result = await CategoriesBLL.getAll();
    if (result.success) setCategories(result.categories);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await CategoriesBLL.delete(deleteTarget);
    if (result.success) {
      setCategories((prev) => prev.filter((c) => c.category_id !== deleteTarget));
      refreshCount();
    } else setActionError(result.error);
    setDeleteTarget(null);
  };

  const filtered = categories.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === "all" || c.type === filterType;
    return matchSearch && matchType;
  });

  const incomeCount  = categories.filter((c) => c.type === "income").length;
  const expenseCount = categories.filter((c) => c.type === "expense").length;

  const searchIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (c) => <span className="text-skin-text text-sm font-medium">{c.name}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (c) => (
        <Badge variant={CATEGORY_TYPE_STYLES[c.type]}>
          {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (c) => c.user_id ? (
        <span className="text-skin-text-secondary text-sm">{c.first_name} {c.last_name}</span>
      ) : (
        <span className="text-skin-text-muted text-sm italic">Global</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (c) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-skin-text-muted hover:text-red-500 hover:bg-red-500/10"
          onClick={() => setDeleteTarget(c.category_id)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          }
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-skin-text">Categories</h1>
          <p className="text-skin-text-secondary text-sm mt-1">Manage global transaction categories.</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
          iconPosition="left"
        >
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-5 py-4">
          <p className="text-emerald-500 text-2xl font-bold">{incomeCount}</p>
          <p className="text-skin-text-secondary text-sm mt-0.5">Income Categories</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl px-5 py-4">
          <p className="text-red-500 text-2xl font-bold">{expenseCount}</p>
          <p className="text-skin-text-secondary text-sm mt-0.5">Expense Categories</p>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={searchIcon}
          className="flex-1 mb-0"
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={[
            { value: "all", label: "All Types" },
            ...CATEGORY_TYPES.map((t) => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1),
            })),
          ]}
        />
      </div>

      {error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No categories found."
        />
      )}

      {!loading && !error && (
        <p className="text-skin-text-muted text-xs mt-4">
          Showing {filtered.length} of {categories.length} categories
        </p>
      )}

      {showModal && (
        <CategoryModal
          onSave={() => { setShowModal(false); fetchCategories(); refreshCount(); }}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <Modal
          title="Are you sure?"
          description="This will permanently delete this category."
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}