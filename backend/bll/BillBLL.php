<?php
require_once __DIR__ . '/../dal/BillDAL.php';
require_once __DIR__ . '/../dal/ReminderDAL.php';
require_once __DIR__ . '/CategoryBLL.php';
require_once __DIR__ . '/../Mailer.php';
require_once __DIR__ . '/../EmailTemplates.php';

define('MAX_REMINDERS_PER_USER', 10);

class BillBLL {
    private BillDAL $billDal;
    private ReminderDAL $reminderDal;

    public function __construct() {
        $this->billDal     = new BillDAL();
        $this->reminderDal = new ReminderDAL();
    }

    // ── Bills ──────────────────────────────────────────────────────

    public function getByUser(int $userId): array {
        return $this->billDal->getByUser($userId);
    }

    public function getExpenseCategories(): array {
        $categoryBll = new CategoryBLL();
        $categories  = array_values(array_filter(
            $categoryBll->getAll(),
            fn($category) => ($category['type'] ?? '') === 'expense'
        ));

        return ['success' => true, 'categories' => $categories];
    }

    public function create(int $userId, array $data): array {
        $name           = trim($data['name'] ?? '');
        $amount         = (float)($data['amount'] ?? 0);
        $currencyId     = (int)($data['currency_id'] ?? 0);
        $dueDate        = $data['due_date'] ?? '';
        $recurrenceType = $data['recurrence_type'] ?? 'none';
        $categoryId     = !empty($data['category_id']) ? (int)$data['category_id'] : null;

        if (empty($name))
            return ['success' => false, 'message' => 'Bill name is required.'];
        if (strlen($name) > 100)
            return ['success' => false, 'message' => 'Bill name is too long.'];
        if ($amount <= 0)
            return ['success' => false, 'message' => 'Amount must be greater than zero.'];
        if ($currencyId <= 0)
            return ['success' => false, 'message' => 'Please select a currency.'];
        if (empty($dueDate))
            return ['success' => false, 'message' => 'Due date is required.'];
        if (!in_array($recurrenceType, ['monthly', 'yearly', 'none']))
            return ['success' => false, 'message' => 'Invalid recurrence type.'];

        $billId = $this->billDal->create($userId, $name, $amount, $currencyId, $dueDate, $recurrenceType, $categoryId);
        $bill   = $this->billDal->getById($billId);
        return ['success' => true, 'bill' => $bill];
    }

    public function update(int $userId, int $billId, array $data): array {
        if ($billId <= 0)
            return ['success' => false, 'message' => 'Invalid bill.'];

        $bill = $this->billDal->getById($billId);
        if (!$bill || (int)$bill['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Bill not found.'];

        $name           = trim($data['name'] ?? '');
        $amount         = (float)($data['amount'] ?? 0);
        $currencyId     = (int)($data['currency_id'] ?? 0);
        $dueDate        = $data['due_date'] ?? '';
        $recurrenceType = $data['recurrence_type'] ?? 'none';
        $categoryId     = !empty($data['category_id']) ? (int)$data['category_id'] : null;

        if (empty($name))
            return ['success' => false, 'message' => 'Bill name is required.'];
        if (strlen($name) > 100)
            return ['success' => false, 'message' => 'Bill name is too long.'];
        if ($amount <= 0)
            return ['success' => false, 'message' => 'Amount must be greater than zero.'];
        if ($currencyId <= 0)
            return ['success' => false, 'message' => 'Please select a currency.'];
        if (empty($dueDate))
            return ['success' => false, 'message' => 'Due date is required.'];
        if (!in_array($recurrenceType, ['monthly', 'yearly', 'none']))
            return ['success' => false, 'message' => 'Invalid recurrence type.'];

        $updated = $this->billDal->update($userId, $billId, $name, $amount, $currencyId, $dueDate, $recurrenceType, $categoryId);
        if (!$updated)
            return ['success' => false, 'message' => 'Failed to update bill.'];

        $freshBill = $this->billDal->getById($billId);
        return ['success' => true, 'bill' => $freshBill];
    }

    public function markAsPaid(int $userId, int $billId): array {
        if ($billId <= 0)
            return ['success' => false, 'message' => 'Invalid bill.'];

        $bill = $this->billDal->getById($billId);
        if (!$bill || (int)$bill['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Bill not found.'];
        if ($bill['is_paid'])
            return ['success' => false, 'message' => 'Bill is already marked as paid.'];

        $this->billDal->markAsPaid($billId);

        // ── Auto-create next bill for recurring ──
        $nextBill = null;
        if ($bill['recurrence_type'] !== 'none') {
            $nextDueDate = $this->computeNextDueDate($bill['due_date'], $bill['recurrence_type']);
            $nextBillId  = $this->billDal->create(
                $userId,
                $bill['name'],
                (float)$bill['amount'],
                (int)$bill['currency_id'],
                $nextDueDate,
                $bill['recurrence_type'],
                !empty($bill['category_id']) ? (int)$bill['category_id'] : null
            );
            $nextBill = $this->billDal->getById($nextBillId);
        }

        return ['success' => true, 'next_bill' => $nextBill];
    }

    public function markAsUnpaid(int $userId, int $billId): array {
        if ($billId <= 0)
            return ['success' => false, 'message' => 'Invalid bill.'];

        $bill = $this->billDal->getById($billId);
        if (!$bill || (int)$bill['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Bill not found.'];

        $this->billDal->markAsUnpaid($billId);
        return ['success' => true];
    }

    public function delete(int $userId, int $billId): array {
        if ($billId <= 0)
            return ['success' => false, 'message' => 'Invalid bill.'];

        $bill = $this->billDal->getById($billId);
        if (!$bill || (int)$bill['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Bill not found.'];

        $this->reminderDal->deleteByBill($billId);
        $this->billDal->delete($billId);
        return ['success' => true];
    }

    // ── Reminders ──────────────────────────────────────────────────

    public function getReminders(int $userId, int $billId): array {
        $bill = $this->billDal->getById($billId);
        if (!$bill || (int)$bill['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Bill not found.'];

        $reminders = $this->reminderDal->getByBill($billId);
        return ['success' => true, 'reminders' => $reminders];
    }

    public function addReminder(int $userId, int $billId, array $data): array {
        $daysBefore = (int)($data['days_before'] ?? 0);

        $bill = $this->billDal->getById($billId);
        if (!$bill || (int)$bill['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Bill not found.'];
        if ($bill['is_paid'])
            return ['success' => false, 'message' => 'Cannot add a reminder to a paid bill.'];
        if (!in_array($daysBefore, [1, 3, 7, 14]))
            return ['success' => false, 'message' => 'Invalid days before value. Choose 1, 3, 7, or 14.'];

        $count = $this->reminderDal->countByUser($userId);
        if ($count >= MAX_REMINDERS_PER_USER)
            return ['success' => false, 'message' => 'You have reached the maximum of ' . MAX_REMINDERS_PER_USER . ' active reminders.'];

        $dueDate      = new DateTime($bill['due_date']);
        $reminderDate = clone $dueDate;
        $reminderDate->modify("-{$daysBefore} days");

        if ($reminderDate <= new DateTime('today'))
            return ['success' => false, 'message' => 'The reminder date would already be in the past. Choose fewer days or a later due date.'];

        $dayWord = $daysBefore === 1 ? 'day' : 'days';
        $message = "Your bill \"{$bill['name']}\" of {$bill['currency_symbol']}"
                 . number_format((float)$bill['amount'], 2)
                 . " is due in {$daysBefore} {$dayWord} on "
                 . date('F j, Y', strtotime($bill['due_date'])) . ".";

        $reminderId = $this->reminderDal->create(
            $userId,
            $billId,
            $message,
            $reminderDate->format('Y-m-d H:i:s'),
            $daysBefore
        );

        $reminder = $this->reminderDal->getById($reminderId);
        return ['success' => true, 'reminder' => $reminder];
    }

    public function deleteReminder(int $userId, int $reminderId): array {
        if ($reminderId <= 0)
            return ['success' => false, 'message' => 'Invalid reminder.'];

        $reminder = $this->reminderDal->getById($reminderId);
        if (!$reminder || (int)$reminder['user_id'] !== $userId)
            return ['success' => false, 'message' => 'Reminder not found.'];

        $this->reminderDal->delete($reminderId);
        return ['success' => true];
    }

    // ── Email: Send due reminders (called on page load) ────────────

    public function sendDueReminders(int $userId, array $user): array {
        $due  = $this->reminderDal->getDueForUser($userId);
        $sent = 0;

        foreach ($due as $reminder) {
            $html    = EmailTemplates::reminder($reminder);
            $subject = "Bill Reminder: {$reminder['bill_name']}";
            $ok      = Mailer::send($user['email'], $user['first_name'] . ' ' . $user['last_name'], $subject, $html);

            $status = $ok ? 'sent' : 'failed';
            $this->reminderDal->logEmail($userId, 'reminder', $status);
            if ($ok) {
                $this->reminderDal->markAsSent((int)$reminder['reminder_id']);
                $sent++;
            }
        }

        return ['success' => true, 'sent' => $sent];
    }

    // ── Email: Weekly summary ──────────────────────────────────────

    public function sendWeeklySummary(int $userId, array $user): array {
        $lastSent = $this->reminderDal->getLastWeeklySummary($userId);
        if ($lastSent) {
            $diff = (new DateTime())->diff(new DateTime($lastSent))->days;
            if ($diff < 7)
                return ['success' => false, 'message' => "Weekly summary was already sent {$diff} day(s) ago. You can send again in " . (7 - $diff) . " day(s)."];
        }

        $bills         = $this->billDal->getByUser($userId);
        $today         = new DateTime('today');
        $upcomingBills = array_values(array_filter($bills, function ($b) use ($today) {
            if ($b['is_paid']) return false;
            $due  = new DateTime($b['due_date']);
            $diff = (int)$today->diff($due)->days;
            return $due >= $today && $diff <= 7;
        }));

        $html = EmailTemplates::weeklySummary($user, $bills, $upcomingBills);
        $ok   = Mailer::send($user['email'], $user['first_name'] . ' ' . $user['last_name'], 'Your FinHub Weekly Summary', $html);

        $this->reminderDal->logEmail($userId, 'weekly_summary', $ok ? 'sent' : 'failed');

        if (!$ok)
            return ['success' => false, 'message' => 'Failed to send email. Please check your Mailtrap configuration.'];
        return ['success' => true];
    }

    // ── Private helpers ────────────────────────────────────────────

    private function computeNextDueDate(string $currentDue, string $recurrenceType): string {
        $date = new DateTime($currentDue);
        $date->modify($recurrenceType === 'yearly' ? '+1 year' : '+1 month');
        return $date->format('Y-m-d');
    }
}