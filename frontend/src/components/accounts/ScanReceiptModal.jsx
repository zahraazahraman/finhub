import { useState, useRef } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import TransactionsBLL from "../../bll/TransactionsBLL.js";

const isMobile = () => window.matchMedia("(pointer: coarse)").matches;

export default function ScanReceiptModal({ account, onClose, onExtracted }) {
  const [image, setImage]         = useState(null);
  const [preview, setPreview]     = useState(null);
  const [error, setError]         = useState("");
  const [scanning, setScanning]   = useState(false);
  const fileInputRef              = useRef(null);
  const mobile                    = isMobile();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleScan = async () => {
    if (!image) { setError("Please select an image."); return; }
    setScanning(true);
    const result = await TransactionsBLL.scanReceipt(image);
    setScanning(false);
    if (!result.success) { setError(result.error); return; }
    onExtracted(result.data);
    onClose();
  };

  return (
    <Modal
      title={mobile ? "Scan Receipt" : "Upload Receipt"}
      description="We'll extract the transaction details automatically."
      onClose={onClose}
      size="md"
      showFooter={false}
    >
      <div className="pt-2 space-y-4">

        {/* ── Image picker / camera ── */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-skin-border rounded-xl p-6
                     flex flex-col items-center justify-center gap-3 cursor-pointer
                     hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
        >
          {preview ? (
            <img
              src={preview}
              alt="Receipt preview"
              className="max-h-48 rounded-lg object-contain"
            />
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                              flex items-center justify-center text-emerald-500">
                {mobile ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <p className="text-skin-text text-sm font-medium">
                  {mobile ? "Tap to scan receipt" : "Click to upload receipt"}
                </p>
                <p className="text-skin-text-muted text-xs mt-1">
                  JPG, PNG, HEIK, or WEBP
                </p>
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpg,image/jpeg,image/png,image/webp,image/heic"
          capture={mobile ? "environment" : undefined}
          onChange={handleFileChange}
          className="hidden"
        />

        {preview && (
          <button
            onClick={() => { setImage(null); setPreview(null); setError(""); }}
            className="text-skin-text-muted hover:text-red-500 text-xs transition-colors"
          >
            Remove image
          </button>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleScan}
            loading={scanning}
            disabled={!image}
          >
            {scanning ? "Analyzing..." : "Extract Data"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}