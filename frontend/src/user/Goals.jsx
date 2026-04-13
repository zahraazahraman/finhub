import { useState, useEffect } from "react";
import GoalsBLL from "../bll/GoalsBLL.js";
import AccountsBLL from "../bll/AccountsBLL.js";
import Spinner from "../components/ui/Spinner.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import GoalsList from "../components/goals/GoalsList.jsx";
import GoalDetail from "../components/goals/GoalDetail.jsx";
import AddGoalModal from "../components/goals/AddGoalModal.jsx";
import AddContributionModal from "../components/goals/AddContributionModal.jsx";

export default function Goals() {
  // ── Data ──
  const [goals, setGoals]               = useState([]);
  const [accounts, setAccounts]         = useState([]);
  const [contributions, setContributions] = useState([]);

  // ── View ──
  const [selectedGoal, setSelectedGoal] = useState(null);

  // ── Loading ──
  const [pageLoading, setPageLoading]         = useState(true);
  const [contributionsLoading, setContributionsLoading] = useState(false);

  // ── Modals ──
  const [showAddGoal, setShowAddGoal]               = useState(false);
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [deleteGoalTarget, setDeleteGoalTarget]       = useState(null);
  const [deleteContributionTarget, setDeleteContributionTarget] = useState(null);

  // ── Action loading ──
  const [deletingGoal, setDeletingGoal]               = useState(false);
  const [deletingContribution, setDeletingContribution] = useState(false);

  // ── Load goals + accounts on mount ──
  useEffect(() => {
    const load = async () => {
      const [goalsResult, accountsResult] = await Promise.all([
        GoalsBLL.getAll(),
        AccountsBLL.getAll(),
      ]);
      if (goalsResult.success)   setGoals(goalsResult.goals);
      if (accountsResult.success) setAccounts(accountsResult.accounts);
      setPageLoading(false);
    };
    load();
  }, []);

  // ── Load contributions when a goal is selected ──
  useEffect(() => {
    if (!selectedGoal) return;
    const load = async () => {
      setContributionsLoading(true);
      const result = await GoalsBLL.getContributions(selectedGoal.goal_id);
      if (result.success) setContributions(result.contributions);
      setContributionsLoading(false);
    };
    load();
  }, [selectedGoal]);

  // ── Handlers ──
  const handleGoalCreated = (newGoal) => {
    setGoals((prev) => [newGoal, ...prev]);
    setShowAddGoal(false);
  };

  const handleGoalDeleted = async () => {
    setDeletingGoal(true);
    const result = await GoalsBLL.remove(deleteGoalTarget.goal_id);
    if (result.success) {
      setGoals((prev) => prev.filter(g => g.goal_id !== deleteGoalTarget.goal_id));
      setDeleteGoalTarget(null);
      if (selectedGoal?.goal_id === deleteGoalTarget.goal_id)
        setSelectedGoal(null);
    }
    setDeletingGoal(false);
  };

  const handleContributed = (amount, accountId) => {
    // ── Capture goal_id before any state changes ──
    const goalId = selectedGoal.goal_id;

    // ── Update goal current_amount ──
    setSelectedGoal((prev) => ({
      ...prev,
      current_amount: parseFloat(prev.current_amount) + amount,
    }));
    setGoals((prev) => prev.map(g =>
      g.goal_id === selectedGoal.goal_id
        ? { ...g, current_amount: parseFloat(g.current_amount) + amount }
        : g
    ));

    // ── Update account balance ──
    setAccounts((prev) => prev.map(a =>
      a.account_id === accountId
        ? { ...a, balance: parseFloat(a.balance) - amount }
        : a
    ));

    setShowAddContribution(false);

    // ── Reload contributions list ──
    const reload = async () => {
      setContributionsLoading(true);
      const result = await GoalsBLL.getContributions(goalId);
      if (result.success) setContributions(result.contributions);
      setContributionsLoading(false);
    };
    reload();
  };

  const handleContributionDeleted = async () => {
    setDeletingContribution(true);
    const result = await GoalsBLL.removeContribution(deleteContributionTarget.contribution_id);
    if (result.success) {
      const amount    = parseFloat(deleteContributionTarget.amount);
      const accountId = deleteContributionTarget.account_id;

      // ── Update goal current_amount ──
      setSelectedGoal((prev) => ({
        ...prev,
        current_amount: Math.max(parseFloat(prev.current_amount) - amount, 0),
      }));
      setGoals((prev) => prev.map(g =>
        g.goal_id === selectedGoal.goal_id
          ? { ...g, current_amount: Math.max(parseFloat(g.current_amount) - amount, 0) }
          : g
      ));

      // ── Update account balance ──
      setAccounts((prev) => prev.map(a =>
        a.account_id === accountId
          ? { ...a, balance: parseFloat(a.balance) + amount }
          : a
      ));

      setContributions((prev) =>
        prev.filter(c => c.contribution_id !== deleteContributionTarget.contribution_id)
      );
      setDeleteContributionTarget(null);
    }
    setDeletingContribution(false);
  };

  if (pageLoading) return (
    <div className="flex items-center justify-center h-64 animate-fade-in">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      {!selectedGoal && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-skin-text">My Goals</h1>
            <p className="text-skin-text-secondary text-sm mt-1">
              Track your savings and debt repayment goals.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddGoal(true)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
            iconPosition="left"
          >
            New Goal
          </Button>
        </div>
      )}

      {/* ── View ── */}
      {!selectedGoal ? (
        <GoalsList
          goals={goals}
          onSelectGoal={(goal) => {
            setContributions([]);
            setSelectedGoal(goal);
          }}
          onAddGoal={() => setShowAddGoal(true)}
          onDeleteGoal={setDeleteGoalTarget}
        />
      ) : (
        <GoalDetail
          goal={selectedGoal}
          contributions={contributions}
          loading={contributionsLoading}
          onBack={() => setSelectedGoal(null)}
          onAddContribution={() => setShowAddContribution(true)}
          onDeleteContribution={setDeleteContributionTarget}
          onDeleteGoal={setDeleteGoalTarget}
        />
      )}

      {/* ── Modals ── */}
      {showAddGoal && (
        <AddGoalModal
          onClose={() => setShowAddGoal(false)}
          onCreated={handleGoalCreated}
        />
      )}

      {showAddContribution && (
        <AddContributionModal
          goal={selectedGoal}
          accounts={accounts}
          onClose={() => setShowAddContribution(false)}
          onContributed={handleContributed}
        />
      )}

      {deleteGoalTarget && (
        <Modal
          title="Delete Goal?"
          description={`This will permanently delete "${deleteGoalTarget.goal_name}" and all its contributions.`}
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={deletingGoal}
          onConfirm={handleGoalDeleted}
          onClose={() => setDeleteGoalTarget(null)}
        />
      )}

      {deleteContributionTarget && (
        <Modal
          title="Delete Contribution?"
          description="This will permanently delete this contribution and restore the amount to your account balance."
          showFooter
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={deletingContribution}
          onConfirm={handleContributionDeleted}
          onClose={() => setDeleteContributionTarget(null)}
        />
      )}
    </div>
  );
}