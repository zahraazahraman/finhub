import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import TransactionsBLL from "../../bll/TransactionsBLL.js";

export default function ImportTransactionsModal({ account, onClose, onImported }) {
  const [file, setFile]           = useState(null);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e) => {
    setError("");
    setResult(null);
    setFile(e.target.files[0] ?? null);
  };

  const handleImport = async () => {
    if (!file) { setError("Please select a file."); return; }
    setImporting(true);
    const res = await TransactionsBLL.import(account.account_id, file);
    setImporting(false);
    if (!res.success) { setError(res.error); return; }
    setResult(res);
  };

  const handleDone = () => {
    onImported();
    onClose();
  };

  return (
    <Modal
      title="Import Transactions"
      description={`Import transactions into: ${account.account_name}`}
      onClose={onClose}
      size="lg"
      showFooter={false}
    >
      <div className="pt-2 space-y-4">

        {/* ── Expected format ── */}
        <div className="bg-skin-secondary border border-skin-border rounded-xl p-4">
          <p className="text-skin-text text-sm font-medium mb-2">Expected columns:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "date",             required: true  },
              { label: "type",             required: true  },
              { label: "amount",           required: true  },
              { label: "description",      required: false },
              { label: "category",         required: false },
            ].map((col) => (
              <span key={col.label} className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
                col.required
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-skin-hover text-skin-text-muted border-skin-border"
              }`}>
                {col.label}{col.required ? " *" : ""}
              </span>
            ))}
          </div>
          <p className="text-skin-text-muted text-xs mt-3">
            * Required. Column names are flexible — e.g. "date", "Date", "Transaction Date" all work.
            Type must be: <span className="font-mono">income</span>, <span className="font-mono">expense</span>, or <span className="font-mono">transfer</span>.
          </p>
          <p className="text-skin-text-muted text-xs mt-2 pt-2 border-t border-skin-border">
            Supported formats: <span className="font-mono text-skin-text">CSV</span>, <span className="font-mono text-skin-text">XLS</span>, <span className="font-mono text-skin-text">XLSX</span>
          </p>
        </div>

        {/* ── File picker ── */}
        {!result && (
          <div>
            <label className="block text-sm font-medium text-skin-text-secondary mb-1.5">
              Select File
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="w-full text-sm text-skin-text-secondary
                         file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                         file:text-sm file:font-medium file:bg-emerald-500/10
                         file:text-emerald-500 hover:file:bg-emerald-500/20
                         cursor-pointer"
            />
            {file && (
              <p className="text-skin-text-muted text-xs mt-1.5">
                Selected: {file.name}
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        )}

        {/* ── Result ── */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-emerald-500 text-sm font-medium">
                Successfully imported {result.imported} transaction{result.imported !== 1 ? "s" : ""}.
              </p>
            </div>
            {result.skipped.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-500 text-sm font-medium mb-2">
                  {result.skipped.length} row{result.skipped.length !== 1 ? "s" : ""} skipped:
                </p>
                <ul className="space-y-1">
                  {result.skipped.map((msg, i) => (
                    <li key={i} className="text-yellow-500/80 text-xs">{msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          {!result ? (
            <>
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleImport}
                loading={importing}
                disabled={!file}
              >
                Import
              </Button>
            </>
          ) : (
            <Button variant="primary" className="flex-1" onClick={handleDone}>
              Done
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}