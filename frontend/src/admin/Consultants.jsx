import { useState, useEffect } from "react";
import ConsultantsBLL from "../bll/ConsultantsBLL.js";
import { useNotifications } from "../context/NotificationContext.jsx";

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(r) ? "text-yellow-400" : "text-slate-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-slate-400 text-xs ml-1">{r > 0 ? r.toFixed(1) : "—"}</span>
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
    if (result.success) {
      onSave();
    } else {
      setError(result.error || result.serverError || "Something went wrong.");
    }
    setLoading(false);
  };

  const fields = [
    { name: "first_name",     label: "First Name",     placeholder: "Michel" },
    { name: "last_name",      label: "Last Name",      placeholder: "Aoun" },
    { name: "email",          label: "Email",          placeholder: "michel@finhub.com" },
    { name: "phone",          label: "Phone",          placeholder: "70111222" },
    { name: "specialization", label: "Specialization", placeholder: "Investment" },
    { name: "rating",         label: "Rating (0–5)",   placeholder: "4.5" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-5">
          {isEdit ? "Edit Consultant" : "Add Consultant"}
        </h3>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">{f.label}</label>
              <input
                name={f.name}
                value={form[f.name]}
                onChange={handle}
                placeholder={f.placeholder}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
              />
            </div>
          ))}
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
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Consultant"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-semibold mb-2">Are you sure?</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
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

const exportConsultantsCSV = (consultants) => {
  const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Specialization", "Rating"];
  const rows = consultants.map((c) => [
    c.consultant_id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone || "—",
    c.specialization,
    c.rating || "—",
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

export default function Consultants() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [modalTarget, setModalTarget] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState("");

  const { refreshCount } = useNotifications();

  const fetchConsultants = async () => {
    setLoading(true);
    const result = await ConsultantsBLL.getAll();
    if (result.success) setConsultants(result.consultants);
    else setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await ConsultantsBLL.delete(deleteTarget);
    if (result.success) {
      setConsultants((prev) => prev.filter((c) => c.consultant_id !== deleteTarget));
      refreshCount();
    } else {
      setActionError(result.error);
    }
    setDeleteTarget(null);
  };

  const filtered = consultants.filter((c) =>
    `${c.first_name} ${c.last_name} ${c.email} ${c.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Consultants</h1>
          <p className="text-slate-400 text-sm mt-1">Manage financial consultants listed on FinHub.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportConsultantsCSV(filtered)}
            className="flex items-center gap-2 border border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setModalTarget(null)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Consultant
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email or specialization…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
        />
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
          <div className="text-center py-16 text-slate-500 text-sm">No consultants found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Consultant</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Phone</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Specialization</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Rating</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((c) => (
                <tr key={c.consultant_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 text-xs font-bold">
                          {c.first_name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{c.first_name} {c.last_name}</p>
                        <p className="text-slate-500 text-xs">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{c.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-700">
                      {c.specialization}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StarRating rating={c.rating} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalTarget(c)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c.consultant_id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <p className="text-slate-600 text-xs mt-4">
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
        <ConfirmModal
          message="This will permanently delete the consultant and cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}