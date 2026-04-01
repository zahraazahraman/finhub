import { useState, useEffect } from "react";
import ConsultantsBLL from "../bll/ConsultantsBLL.js";
import { useNotifications } from "../context/NotificationContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Table from "../components/ui/Table.jsx";
import { formatDate, getInitials } from "../utils/formatters.js";

const exportConsultantsCSV = (consultants) => {
  const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Specialization", "Rating"];
  const rows = consultants.map((c) => [
    c.consultant_id, c.first_name, c.last_name,
    c.email, c.phone || "—", c.specialization, c.rating || "—",
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "finhub_consultants.csv";
  a.click();
  URL.revokeObjectURL(url);
};

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(r) ? "text-yellow-400" : "text-skin-text-muted"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-skin-text-secondary text-xs ml-1">{r > 0 ? r.toFixed(1) : "—"}</span>
    </div>
  );
}

function ConsultantModal({ consultant, onSave, onClose }) {
  const isEdit = !!consultant?.consultant_id;
  const [form, setForm] = useState({
    first_name:     consultant?.first_name     || "",
    last_name:      consultant?.last_name      || "",
    email:          consultant?.email          || "",
    phone:          consultant?.phone          || "",
    specialization: consultant?.specialization || "",
    rating:         consultant?.rating         || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const result = isEdit
      ? await ConsultantsBLL.update(consultant.consultant_id, form)
      : await ConsultantsBLL.create(form);
    if (result.success) onSave();
    else setError(result.error || result.serverError || "Something went wrong.");
    setLoading(false);
  };

  const fields = [
    { name: "first_name",     label: "First Name",   placeholder: "Michel" },
    { name: "last_name",      label: "Last Name",    placeholder: "Aoun" },
    { name: "email",          label: "Email",        placeholder: "michel@finhub.com" },
    { name: "phone",          label: "Phone",        placeholder: "70111222" },
    { name: "specialization", label: "Specialization", placeholder: "Investment" },
    { name: "rating",         label: "Rating (0–5)", placeholder: "4.5" },
  ];

  return (
    <Modal
      title={isEdit ? "Edit Consultant" : "Add Consultant"}
      onClose={onClose}
      showFooter
      confirmLabel={isEdit ? "Save Changes" : "Add Consultant"}
      cancelLabel="Cancel"
      onConfirm={handleSubmit}
      loading={loading}
    >
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <div className="space-y-1">
        {fields.map((f) => (
          <Input
            key={f.name}
            id={f.name}
            label={f.label}
            name={f.name}
            value={form[f.name]}
            onChange={handle}
            placeholder={f.placeholder}
          />
        ))}
      </div>
    </Modal>
  );
}

export default function Consultants() {
  const [consultants, setConsultants]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [modalTarget, setModalTarget]   = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError]   = useState("");
  const { refreshCount }                = useNotifications();

  const fetchConsultants = async () => {
    setLoading(true);
    const result = await ConsultantsBLL.getAll();
    if (result.success) setConsultants(result.consultants);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => { fetchConsultants(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await ConsultantsBLL.delete(deleteTarget);
    if (result.success) {
      setConsultants((prev) => prev.filter((c) => c.consultant_id !== deleteTarget));
      refreshCount();
    } else setActionError(result.error);
    setDeleteTarget(null);
  };

  const filtered = consultants.filter((c) =>
    `${c.first_name} ${c.last_name} ${c.email} ${c.specialization}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const searchIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );

  const columns = [
    {
      key: "consultant",
      label: "Consultant",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-500 text-xs font-bold">{getInitials(c.first_name, c.last_name)}</span>
          </div>
          <div>
            <p className="text-skin-text text-sm font-medium">{c.first_name} {c.last_name}</p>
            <p className="text-skin-text-muted text-xs">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (c) => <span className="text-skin-text-secondary text-sm">{c.phone || "—"}</span>,
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (c) => <Badge variant="default">{c.specialization}</Badge>,
    },
    {
      key: "rating",
      label: "Rating",
      render: (c) => <StarRating rating={c.rating} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-skin-text-muted hover:text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => setModalTarget(c)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-skin-text-muted hover:text-red-500 hover:bg-red-500/10"
            onClick={() => setDeleteTarget(c.consultant_id)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-skin-text">Consultants</h1>
          <p className="text-skin-text-secondary text-sm mt-1">Manage financial consultants listed on FinHub.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => exportConsultantsCSV(filtered)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setModalTarget(null)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
            iconPosition="left"
          >
            Add Consultant
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search by name, email or specialization…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={searchIcon}
          className="mb-0"
        />
      </div>

      {error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No consultants found."
        />
      )}

      {!loading && !error && (
        <p className="text-skin-text-muted text-xs mt-4">
          Showing {filtered.length} of {consultants.length} consultants
        </p>
      )}

      {modalTarget !== undefined && (
        <ConsultantModal
          consultant={modalTarget}
          onSave={() => { setModalTarget(undefined); fetchConsultants(); refreshCount(); }}
          onClose={() => setModalTarget(undefined)}
        />
      )}

      {deleteTarget && (
        <Modal
          title="Are you sure?"
          description="This will permanently delete the consultant and cannot be undone."
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