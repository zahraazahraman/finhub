<?php
require_once __DIR__ . '/../dal/InquiryDAL.php';
require_once __DIR__ . '/../dal/MyNotificationDAL.php';
require_once __DIR__ . '/../dal/UserDAL.php';
require_once __DIR__ . '/../services/Mailer.php';
require_once __DIR__ . '/../services/EmailTemplates.php';

class ConsultantInquiryBLL {
    private InquiryDAL        $dal;
    private MyNotificationDAL $notifDal;
    private UserDAL           $userDal;

    public function __construct() {
        $this->dal      = new InquiryDAL();
        $this->notifDal = new MyNotificationDAL();
        $this->userDal  = new UserDAL();
    }

    public function getInbox(int $consultantId): array {
        return ['success' => true, 'inquiries' => $this->dal->getByConsultant($consultantId)];
    }

    public function getStats(int $consultantId): array {
        return ['success' => true, 'stats' => $this->dal->getConsultantStats($consultantId)];
    }

    public function reply(int $consultantId, int $inquiryId, string $replyText): array {
        if (trim($replyText) === '') {
            return ['success' => false, 'message' => 'Reply text cannot be empty.'];
        }

        $ok = $this->dal->reply($inquiryId, $consultantId, trim($replyText));
        if (!$ok) {
            return ['success' => false, 'message' => 'Could not send reply. The inquiry may already have been responded to.'];
        }

        // Notify the user in-app + send email
        $inquiry = $this->dal->getById($inquiryId);
        if ($inquiry) {
            $userId = (int)$inquiry['user_id'];

            $this->notifDal->create(
                $userId,
                'consultant_inquiry',
                'Consultant Replied',
                'Your inquiry has received a reply. Go to Consultants → My Inquiries to read it.'
            );

            $user       = $this->userDal->getById($userId);
            $consultant = $_SESSION['consultant'] ?? [];
            if ($user && !empty($user['email'])) {
                $html = EmailTemplates::inquiryReplied(
                    $user['first_name'],
                    $consultant['first_name']    ?? '',
                    $consultant['last_name']     ?? '',
                    $consultant['specialization'] ?? '',
                    $replyText
                );
                Mailer::send(
                    $user['email'],
                    "{$user['first_name']} {$user['last_name']}",
                    'Your consultant has replied on FinHub',
                    $html
                );
            }
        }

        return ['success' => true];
    }

    public function close(int $consultantId, int $inquiryId): array {
        $ok = $this->dal->close($inquiryId, $consultantId);
        if (!$ok) {
            return ['success' => false, 'message' => 'Could not close inquiry. It may not be in the responded state.'];
        }
        return ['success' => true];
    }
}
