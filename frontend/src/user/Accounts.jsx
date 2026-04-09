import { useState, useEffect } from "react";
import AccountsBLL from "../bll/AccountsBLL.js";
import TransactionsBLL from "../bll/TransactionsBLL.js";
import CurrenciesBLL from "../bll/CurrenciesBLL.js";
import Modal from "../components/ui/Modal.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import AccountsList from "../components/accounts/AccountsList.jsx";
import AccountDetail from "../components/accounts/AccountDetail.jsx";
import AddAccountModal from "../components/accounts/AddAccountModal.jsx";
import AddTransactionModal from "../components/accounts/AddTransactionModal.jsx";
import ImportTransactionsModal from "../components/accounts/ImportTransactionsModal.jsx";
import ScanReceiptModal from "../components/accounts/ScanReceiptModal.jsx";

export default function Accounts() {
  // ── Data ──
  const [accounts, setAccounts]         = useState([]);
  const [currencies, setCurrencies]     = useState([]);
  const [transactions, setTransactions] = useState([]);

  // ── View ──
  const [selectedAccount, setSelectedAccount] = useState(null);

  // ── Loading ──
  const [pageLoading, setPageLoading] = useState(true);
  const [txLoading, setTxLoading]     = useState(false);

  // ── Modals ──
  const [showAddAccount, setShowAddAccount]       = useState(false);
  const [showAddTx, setShowAddTx]                 = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showScanReceipt, setShowScanReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [deleteAccountTarget, setDeleteAccountTarget] = useState(null);
  const [deleteTxTarget, setDeleteTxTarget]       = useState(null);

  // ── Loading states for actions ──
  const [accountSaving, setAccountSaving] = useState(false);
  const [txSaving, setTxSaving]           = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletingTx, setDeletingTx]           = useState(false);

  // ── Load accounts + currencies on mount ──
  useEffect(() => {
    const load = async () => {
      const [accResult, curResult] = await Promise.all([
        AccountsBLL.getAll(),
        CurrenciesBLL.getAll(),
      ]);
      if (accResult.success) setAccounts(accResult.accounts);
      if (curResult.success) setCurrencies(curResult.currencies);
      setPageLoading(false);
    };
    load();
  }, []);

  // ── Load transactions when an account is selected ──
  useEffect(() => {
    if (!selectedAccount) return;
    const load = async () => {
      setTxLoading(true);
      const result = await TransactionsBLL.getByAccount(selectedAccount.account_id);
      if (result.success) setTransactions(result.transactions);
      setTxLoading(false);
    };
    load();
  }, [selectedAccount]);

  // ── Handlers ──
  const handleAccountCreated = (newAccount) => {
    setAccounts((prev) => [newAccount, ...prev]);
    setShowAddAccount(false);
  };

  const handleAccountDeleted = async () => {
    setDeletingAccount(true);
    const result = await AccountsBLL.remove(deleteAccountTarget.account_id);
    if (result.success) {
      setAccounts((prev) => prev.filter(a => a.account_id !== deleteAccountTarget.account_id));
      setDeleteAccountTarget(null);
      if (selectedAccount?.account_id === deleteAccountTarget.account_id)
        setSelectedAccount(null);
    }
    setDeletingAccount(false);
  };

  const handleTxCreated = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
    setSelectedAccount((prev) => ({
      ...prev,
      balance: parseFloat(prev.balance) +
        (newTx.transaction_type === "income" ? parseFloat(newTx.amount) : -parseFloat(newTx.amount)),
    }));
    setAccounts((prev) => prev.map(a =>
      a.account_id === selectedAccount.account_id
        ? { ...a, balance: parseFloat(a.balance) +
            (newTx.transaction_type === "income" ? parseFloat(newTx.amount) : -parseFloat(newTx.amount)) }
        : a
    ));
    setShowAddTx(false);
  };

  const handleImported = async () => {
    if (!selectedAccount) return;
    setTxLoading(true);
    const [txResult, accResult] = await Promise.all([
      TransactionsBLL.getByAccount(selectedAccount.account_id),
      AccountsBLL.getAll(),
    ]);
    if (txResult.success) setTransactions(txResult.transactions);
    if (accResult.success) {
      setAccounts(accResult.accounts);
      const updated = accResult.accounts.find(a => a.account_id === selectedAccount.account_id);
      if (updated) setSelectedAccount(updated);
    }
    setTxLoading(false);
  };

  const handleReceiptExtracted = (data) => {
    setShowScanReceipt(false);
    setShowAddTx(true);
    setReceiptData(data);
  };

  const handleTxDeleted = async () => {
    setDeletingTx(true);
    const result = await TransactionsBLL.remove(deleteTxTarget.transaction_id);
    if (result.success) {
      setTransactions((prev) => prev.filter(t => t.transaction_id !== deleteTxTarget.transaction_id));
      const delta = deleteTxTarget.transaction_type === "income"
        ? -parseFloat(deleteTxTarget.amount)
        :  parseFloat(deleteTxTarget.amount);
      setSelectedAccount((prev) => ({ ...prev, balance: parseFloat(prev.balance) + delta }));
      setAccounts((prev) => prev.map(a =>
        a.account_id === selectedAccount.account_id
          ? { ...a, balance: parseFloat(a.balance) + delta }
          : a
      ));
      setDeleteTxTarget(null);
    }
    setDeletingTx(false);
  };

  if (pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div>
      {/* ── View ── */}
      {!selectedAccount ? (
        <AccountsList
          accounts={accounts}
          onSelectAccount={setSelectedAccount}
          onAddAccount={() => setShowAddAccount(true)}
          onDeleteAccount={setDeleteAccountTarget}
        />
      ) : (
        <AccountDetail
          account={selectedAccount}
          transactions={transactions}
          loading={txLoading}
          onBack={() => setSelectedAccount(null)}
          onAddTx={() => setShowAddTx(true)}
          onImport={() => setShowImport(true)}
          onScanReceipt={() => setShowScanReceipt(true)}
          onDeleteTx={setDeleteTxTarget}
          onDeleteAccount={setDeleteAccountTarget}
        />
      )}

      {/* ── Modals ── */}
      {showAddAccount && (
        <AddAccountModal
          currencies={currencies}
          onClose={() => setShowAddAccount(false)}
          onCreated={handleAccountCreated}
        />
      )}

      {showAddTx && (
        <AddTransactionModal
          account={selectedAccount}
          receiptData={receiptData}
          onClose={() => { setShowAddTx(false); setReceiptData(null); }}
          onCreated={handleTxCreated}
        />
      )}

      {showImport && (
        <ImportTransactionsModal
          account={selectedAccount}
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}

      {showScanReceipt && (
        <ScanReceiptModal
          account={selectedAccount}
          onClose={() => setShowScanReceipt(false)}
          onExtracted={handleReceiptExtracted}
        />
      )}

      {deleteAccountTarget && (
        <Modal
          title="Delete Account?"
          description={`This will permanently delete "${deleteAccountTarget.account_name}" and all its transactions.`}
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={deletingAccount}
          onConfirm={handleAccountDeleted}
          onClose={() => setDeleteAccountTarget(null)}
        />
      )}

      {deleteTxTarget && (
        <Modal
          title="Delete Transaction?"
          description="This will permanently delete this transaction and update your account balance."
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={deletingTx}
          onConfirm={handleTxDeleted}
          onClose={() => setDeleteTxTarget(null)}
        />
      )}
    </div>
  );
}