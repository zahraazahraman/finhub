<?php
require_once __DIR__ . '/../dal/InquiryDAL.php';
require_once __DIR__ . '/../dal/MyNotificationDAL.php';

class ConsultantInquiryBLL {
    private InquiryDAL       $dal;
    private MyNotificationDAL $notifDal;

    public function __construct() {
        $this->dal      = new InquiryDAL();
        $this->notifDal = new MyNotificationDAL();
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

        // Notify the user in-app
        $inquiry = $this->dal->getById($inquiryId);
        if ($inquiry) {
            $this->notifDal->create(
                (int)$inquiry['user_id'],
                'consultant_inquiry',
                'Consultant Replied',
                'Your inquiry has received a reply. Go to Consultants → My Inquiries to read it.'
            );
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
