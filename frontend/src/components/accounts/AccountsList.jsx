import Button from "../ui/Button.jsx";
import AccountCard from "./AccountCard.jsx";

export default function AccountsList({ accounts, onSelectAccount, onAddAccount, onDeleteAccount }) {
  return (
    <div>
      {/* ── Empty state ── */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <h3 className="text-skin-text font-semibold text-lg mb-1">No accounts yet</h3>
          <p className="text-skin-text-muted text-sm mb-6">
            Create your first account to start tracking your finances.
          </p>
          <Button variant="primary" onClick={onAddAccount}>Create Account</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.account_id}
              account={account}
              onSelect={onSelectAccount}
              onDelete={onDeleteAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
