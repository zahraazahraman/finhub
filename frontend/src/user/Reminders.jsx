import { useState, useEffect } from "react";
import BillsBLL from "../bll/BillsBLL.js";
import CurrenciesBLL from "../bll/CurrenciesBLL.js";
import Spinner from "../components/ui/Spinner.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import BillsList from "../components/reminders/BillsList.jsx";
import BillDetail from "../components/reminders/BillDetail.jsx";
import AddBillModal from "../components/reminders/AddBillModal.jsx";
import AddReminderModal from "../components/reminders/AddReminderModal.jsx";
import WeeklySummaryCard from "../components/reminders/WeeklySummaryCard.jsx";

export default function Reminders() {
  // ── Data ──
  const [bills, setBills]           = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reminders, setReminders]   = useState([]);

  // ── View ──
  const [selectedBill, setSelectedBill] = useState(null);

  // ── Loading ──
  const [pageLoading, setPageLoading]           = useState(true);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [markingPaid, setMarkingPaid]           = useState(false);
  const [deletingBill, setDeletingBill]         = useState(false);
  const [deletingReminder, setDeletingReminder] = useState(false);
  const [sendingWeekly, setSendingWeekly]       = useState(false);

  // ── Modals ──
  const [showAddBill, setShowAddBill]                   = useState(false);
  const [showEditBill, setShowEditBill]                 = useState(false);
  const [showAddReminder, setShowAddReminder]           = useState(false);
  const [editReminderTarget, setEditReminderTarget]     = useState(null);
  const [deleteBillTarget, setDeleteBillTarget]         = useState(null);
  const [deleteReminderTarget, setDeleteReminderTarget] = useState(null);

  // ── Weekly summary feedback ──
  const [weeklyMessage, setWeeklyMessage] = useState(null);

  // ── Total reminder count (for limit display) ──
  // Use server-provided per-user total when available; fall back to loaded reminders length.
  const [totalReminderCount, setTotalReminderCount] = useState(0);

  // ── On mount: load data + silently send due reminders ──
  useEffect(() => {
    const load = async () => {
      const [billsResult, curResult, catResult] = await Promise.all([
        BillsBLL.getAll(),
        CurrenciesBLL.getAll(),
        BillsBLL.getExpenseCategories(),
      ]);
      if (billsResult.success)  setBills(billsResult.bills);
      if (curResult.success)    setCurrencies(curResult.currencies);
      if (catResult.success)    setCategories(catResult.categories);
      setPageLoading(false);

      // Silently check and send any due reminders — fire and forget
      BillsBLL.sendDue();
    };
    load();
  }, []);

  // ── Load reminders when a bill is selected ──
  useEffect(() => {
    if (!selectedBill) return;
    const load = async () => {
      setRemindersLoading(true);
      const result = await BillsBLL.getReminders(selectedBill.bill_id);
      if (result.success) {
        setReminders(result.reminders);
        // Use server total if provided, otherwise fall back to reminders length
        setTotalReminderCount(result.total ?? result.reminders.length);
      }
      setRemindersLoading(false);
    };
    load();
  }, [selectedBill]);

  // ── Handlers ──

  const handleBillCreated = (newBill) => {
    setBills(prev => [newBill, ...prev]);
    setShowAddBill(false);
  };

  const handleBillUpdated = (updatedBill) => {
    setBills(prev => prev.map(b => b.bill_id === updatedBill.bill_id ? updatedBill : b));
    setSelectedBill(updatedBill);
    setShowEditBill(false);
  };

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    const result = await BillsBLL.markPaid(selectedBill.bill_id);
    if (result.success) {
      setBills(prev => {
        const updated = prev.map(b =>
          b.bill_id === selectedBill.bill_id ? { ...b, is_paid: 1 } : b
        );
        // If a next bill was created, add it
        if (result.next_bill) return [...updated, result.next_bill];
        return updated;
      });
      setSelectedBill(prev => prev ? { ...prev, is_paid: 1 } : prev);
      // selectedBill will sync via the bills useEffect
    }
    setMarkingPaid(false);
  };

  const handleMarkUnpaid = async () => {
    setMarkingPaid(true);
    const result = await BillsBLL.markUnpaid(selectedBill.bill_id);
    if (result.success) {
      setBills(prev => prev.map(b =>
        b.bill_id === selectedBill.bill_id ? { ...b, is_paid: 0 } : b
      ));
      setSelectedBill(prev => prev ? { ...prev, is_paid: 0 } : prev);
    }
    setMarkingPaid(false);
  };

  const handleBillDeleted = async () => {
    setDeletingBill(true);
    const result = await BillsBLL.remove(deleteBillTarget.bill_id);
    if (result.success) {
      setBills(prev => prev.filter(b => b.bill_id !== deleteBillTarget.bill_id));
      setDeleteBillTarget(null);
      if (selectedBill?.bill_id === deleteBillTarget.bill_id) setSelectedBill(null);
    }
    setDeletingBill(false);
  };

  const handleReminderAdded = (newReminder) => {
    setReminders(prev => [...prev, newReminder]);
    setShowAddReminder(false);
    setTotalReminderCount((c) => c + 1);
  };

  const handleReminderDeleted = async () => {
    setDeletingReminder(true);
    const result = await BillsBLL.removeReminder(deleteReminderTarget.reminder_id);
    if (result.success) {
      setReminders(prev => prev.filter(r => r.reminder_id !== deleteReminderTarget.reminder_id));
      setDeleteReminderTarget(null);
      setTotalReminderCount((c) => Math.max(0, c - 1));
    }
    setDeletingReminder(false);
  };

  const handleSendWeekly = async () => {
    setSendingWeekly(true);
    setWeeklyMessage(null);
    const result = await BillsBLL.sendWeeklySummary();
    setWeeklyMessage(
      result.success
        ? { type: "success", text: "Weekly summary sent to your email!" }
        : { type: "error",   text: result.error }
    );
    setSendingWeekly(false);
  };

  if (pageLoading) return (
    <div className="flex items-center justify-center h-64 animate-fade-in">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="animate-fade-in">

      {/* ── Header (list view only) ── */}
      {!selectedBill && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-skin-text">Reminders</h1>
            <p className="text-skin-text-secondary text-sm mt-1">
              Manage your bills and get email reminders before due dates.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddBill(true)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
            iconPosition="left"
          >
            Add Bill
          </Button>
        </div>
      )}

      {/* ── Main view ── */}
      {!selectedBill ? (
        <>
          <WeeklySummaryCard
            onSend={handleSendWeekly}
            sending={sendingWeekly}
            message={weeklyMessage}
          />
          <BillsList
            bills={bills}
            onSelectBill={(bill) => { setReminders([]); setSelectedBill(bill); }}
            onAddBill={() => setShowAddBill(true)}
            onDeleteBill={setDeleteBillTarget}
          />
        </>
      ) : (
        <BillDetail
          bill={selectedBill}
          reminders={reminders}
          remindersLoading={remindersLoading}
          totalReminderCount={totalReminderCount}
          onBack={() => setSelectedBill(null)}
          onMarkPaid={handleMarkPaid}
          onMarkUnpaid={handleMarkUnpaid}
          markingPaid={markingPaid}
          onAddReminder={() => setShowAddReminder(true)}
          onEditReminder={(reminder) => { setEditReminderTarget(reminder); setShowAddReminder(true); }}
          onEditBill={() => setShowEditBill(true)}
          onDeleteReminder={setDeleteReminderTarget}
          onDeleteBill={setDeleteBillTarget}
        />
      )}

      {/* ── Modals ── */}
      {showAddBill && (
        <AddBillModal
          currencies={currencies}
          categories={categories}
          onClose={() => setShowAddBill(false)}
          onCreated={handleBillCreated}
        />
      )}

      {showEditBill && selectedBill && (
        <AddBillModal
          currencies={currencies}
          categories={categories}
          initialBill={selectedBill}
          onClose={() => setShowEditBill(false)}
          onUpdated={handleBillUpdated}
        />
      )}

          {showAddReminder && selectedBill && (
            <AddReminderModal
              bill={selectedBill}
              onClose={() => { setShowAddReminder(false); setEditReminderTarget(null); }}
              onAdded={handleReminderAdded}
              initialReminder={editReminderTarget}
              onUpdated={(updated) => {
                // Replace the reminder in state
                setReminders(prev => prev.map(r => r.reminder_id === updated.reminder_id ? updated : r));
                setShowAddReminder(false);
                setEditReminderTarget(null);
              }}
            />
          )}

      {deleteBillTarget && (
        <Modal
          title="Delete Bill?"
          description={`This will permanently delete "${deleteBillTarget.name}" and all its reminders.`}
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={deletingBill}
          onConfirm={handleBillDeleted}
          onClose={() => setDeleteBillTarget(null)}
        />
      )}

      {deleteReminderTarget && (
        <Modal
          title="Delete Reminder?"
          description="This reminder will be permanently removed and no email will be sent."
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={deletingReminder}
          onConfirm={handleReminderDeleted}
          onClose={() => setDeleteReminderTarget(null)}
        />
      )}
    </div>
  );
}