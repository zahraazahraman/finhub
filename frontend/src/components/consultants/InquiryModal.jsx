import { useEffect, useState } from "react";
import UserConsultantsBLL from "../../bll/UserConsultantsBLL.js";
import { useUser } from "../../context/UserContext.jsx";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Spinner from "../ui/Spinner.jsx";

// ── Step: Data sharing consent ──
function ConsentStep({ onAllow, onSkip }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-skin-secondary border border-skin-border">
        <div className="w-10 h-10 rounded-xl bg-skin-brand-subtle flex items-center justify-center flex-shrink-0 text-brand">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-skin-text">Use your financial data?</p>
          <p className="text-sm text-skin-text-secondary mt-1 leading-relaxed">
            Your AI data sharing is currently <span className="font-medium text-skin-text">turned off</span>.
            To write a personalized brief for the consultant, we can use your accounts, goals, and
            investments — just for this brief, without changing your setting.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button variant="primary" className="w-full justify-center" onClick={onAllow}>
          Use my data for this brief
        </Button>
        <Button variant="secondary" className="w-full justify-center" onClick={onSkip}>
          No thanks — use a basic brief
        </Button>
      </div>
    </div>
  );
}

// ── Step: Loading ──
function LoadingStep() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <Spinner size="lg" />
      <div className="text-center">
        <p className="text-sm font-medium text-skin-text">Preparing your brief…</p>
        <p className="text-xs text-skin-text-muted mt-1">
          Analysing your financial data with AI
        </p>
      </div>
    </div>
  );
}

// ── Step: Review brief + optional note ──
function ReviewStep({ consultant, brief, onBriefChange, note, onNoteChange, onSubmit, submitting, error }) {
  return (
    <div className="flex flex-col gap-5">

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-skin-text-muted uppercase tracking-wider">
          Your consultation brief
        </label>
        <p className="text-xs text-skin-text-muted">
          AI-generated from your financial data — edit freely before sending.
        </p>
        <textarea
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          rows={5}
          disabled={submitting}
          className="w-full bg-skin-secondary border border-skin-border rounded-xl px-4 py-3 text-sm text-skin-text placeholder-skin-text-muted resize-none outline-none focus:ring-2 focus:ring-[var(--brand-subtle)] focus:border-brand transition-all disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-skin-text-muted uppercase tracking-wider">
          Additional note <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Anything specific you'd like the consultant to know beforehand…"
          rows={2}
          disabled={submitting}
          className="w-full bg-skin-secondary border border-skin-border rounded-xl px-4 py-3 text-sm text-skin-text placeholder-skin-text-muted resize-none outline-none focus:ring-2 focus:ring-[var(--brand-subtle)] focus:border-brand transition-all disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button
        variant="primary"
        className="w-full justify-center"
        onClick={onSubmit}
        loading={submitting}
        disabled={!brief.trim() || submitting}
      >
        Send inquiry to {consultant.first_name}
      </Button>
    </div>
  );
}

// ── Step: Success ──
function SuccessStep({ consultant, onClose }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <div className="w-14 h-14 rounded-full bg-skin-brand-subtle flex items-center justify-center">
        <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-skin-text">Inquiry sent!</p>
        <p className="text-sm text-skin-text-secondary mt-1.5 leading-relaxed">
          Your inquiry has been sent to{" "}
          <span className="font-medium text-skin-text">{consultant.first_name} {consultant.last_name}</span>.
          You'll receive a notification when they respond.
        </p>
      </div>
      <Button variant="secondary" className="w-full justify-center" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

// ── Step: Already sent ──
function AlreadySentStep({ consultant, onClose }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <div className="w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
        <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-skin-text">Inquiry already pending</p>
        <p className="text-sm text-skin-text-secondary mt-1.5 leading-relaxed">
          You already have a pending inquiry with{" "}
          <span className="font-medium text-skin-text">{consultant.first_name} {consultant.last_name}</span>.
          Please wait for their response before sending another.
        </p>
      </div>
      <Button variant="secondary" className="w-full justify-center" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}

// ── Main modal ──
export default function InquiryModal({ consultant, situationTag = "", onClose, onSuccess }) {
  const { user }     = useUser();
  const dataIsOn     = (user?.ai_data_sharing ?? 1) === 1;

  // "consent" step only shown when ai_data_sharing is off
  const [step,       setStep]       = useState(dataIsOn ? "loading" : "consent");
  const [brief,      setBrief]      = useState("");
  const [note,       setNote]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const runGenerate = (includeData) => {
    setStep("loading");

    UserConsultantsBLL.checkEligibility(consultant.consultant_id).then((eligResult) => {
      if (!eligResult.success || eligResult.alreadySent) {
        setStep("already_sent");
        return;
      }

      UserConsultantsBLL.generateBrief(consultant.consultant_id, "", includeData).then((briefResult) => {
        setBrief(briefResult.success ? briefResult.briefText : "");
        setStep("review");
      });
    });
  };

  // When data sharing is on, start generating immediately on mount
  useEffect(() => {
    if (dataIsOn) runGenerate(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    const result = await UserConsultantsBLL.submitInquiry(
      consultant.consultant_id,
      brief.trim(),
      note.trim(),
      situationTag
    );
    setSubmitting(false);
    if (result.success) {
      setStep("success");
      if (onSuccess) onSuccess();
    } else {
      setError(result.error);
    }
  };

  const titles = {
    consent:      "Connect with " + consultant.first_name,
    loading:      "Connecting you with " + consultant.first_name,
    review:       "Review Your Brief",
    success:      null,
    already_sent: null,
  };

  const descriptions = {
    consent:      "We need your permission before using your financial data.",
    loading:      null,
    review:       "We've drafted an introduction based on your financial profile.",
    success:      null,
    already_sent: null,
  };

  return (
    <Modal
      title={titles[step]}
      description={descriptions[step]}
      onClose={onClose}
      size="md"
    >
      {step === "consent"      && (
        <ConsentStep
          onAllow={() => runGenerate(true)}
          onSkip={() => runGenerate(false)}
        />
      )}
      {step === "loading"      && <LoadingStep />}
      {step === "review"       && (
        <ReviewStep
          consultant={consultant}
          brief={brief}
          onBriefChange={setBrief}
          note={note}
          onNoteChange={setNote}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />
      )}
      {step === "success"      && <SuccessStep      consultant={consultant} onClose={onClose} />}
      {step === "already_sent" && <AlreadySentStep  consultant={consultant} onClose={onClose} />}
    </Modal>
  );
}
