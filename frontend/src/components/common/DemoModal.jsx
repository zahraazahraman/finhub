import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal.jsx";

export default function DemoModal({ onClose }) {
  const navigate = useNavigate();

  return (
    <Modal onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>

        <div>
          <h3 className="text-skin-text font-semibold text-base">You're in demo mode</h3>
          <p className="text-skin-text-secondary text-sm mt-2 leading-relaxed">
            This is a demo account. If you want to delve deeper in exploring
            features, take 2 minutes to create and verify your account.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full pt-1">
          <button
            onClick={() => { onClose(); navigate("/register"); }}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            Create an Account
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-skin-text-secondary hover:text-skin-text text-sm transition-colors"
          >
            Keep exploring
          </button>
        </div>
      </div>
    </Modal>
  );
}
