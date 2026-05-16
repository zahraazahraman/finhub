<?php
require_once __DIR__ . '/../config/database.php';

class InquiryDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function insert(int $userId, int $consultantId, string $brief, string $note, string $situationTag): int {
        $stmt = $this->db->prepare(
            "INSERT INTO ConsultantInquiries
                (user_id, consultant_id, brief_text, user_note, situation_tag, status, created_at)
             VALUES
                (:uid, :cid, :brief, :note, :tag, 'pending', NOW())"
        );
        $stmt->execute([
            ':uid'   => $userId,
            ':cid'   => $consultantId,
            ':brief' => $brief !== '' ? $brief : null,
            ':note'  => $note  !== '' ? $note  : null,
            ':tag'   => $situationTag !== '' ? $situationTag : null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    // Returns inquiries for the user joined with consultant name and specialization.
    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT ci.inquiry_id, ci.consultant_id, ci.brief_text, ci.user_note,
                    ci.situation_tag, ci.consultant_reply, ci.replied_at,
                    ci.status, ci.created_at,
                    c.first_name  AS consultant_first_name,
                    c.last_name   AS consultant_last_name,
                    c.specialization AS consultant_specialization
             FROM ConsultantInquiries ci
             JOIN Consultants c ON c.consultant_id = ci.consultant_id
             WHERE ci.user_id = :uid
             ORDER BY ci.created_at DESC"
        );
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll();
    }

    // Returns true if a pending inquiry already exists for this user+consultant pair.
    public function checkDuplicate(int $userId, int $consultantId): bool {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM ConsultantInquiries
             WHERE user_id = :uid AND consultant_id = :cid AND status = 'pending'"
        );
        $stmt->execute([':uid' => $userId, ':cid' => $consultantId]);
        return (int)$stmt->fetchColumn() > 0;
    }

    // Single inquiry fetch — used by ReviewBLL to verify ownership and status.
    public function getById(int $inquiryId): ?array {
        $stmt = $this->db->prepare(
            "SELECT inquiry_id, user_id, consultant_id, brief_text, user_note,
                    situation_tag, status, created_at
             FROM ConsultantInquiries
             WHERE inquiry_id = :id"
        );
        $stmt->execute([':id' => $inquiryId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // Returns all inquiries for a consultant, joined with user info.
    public function getByConsultant(int $consultantId): array {
        $stmt = $this->db->prepare(
            "SELECT ci.inquiry_id, ci.user_id, ci.brief_text, ci.user_note,
                    ci.situation_tag, ci.consultant_reply, ci.replied_at,
                    ci.status, ci.created_at,
                    u.first_name AS user_first_name,
                    u.last_name  AS user_last_name,
                    u.email      AS user_email
             FROM ConsultantInquiries ci
             JOIN Users u ON u.user_id = ci.user_id
             WHERE ci.consultant_id = :cid
             ORDER BY
                FIELD(ci.status, 'pending', 'responded', 'closed'),
                ci.created_at DESC"
        );
        $stmt->execute([':cid' => $consultantId]);
        return $stmt->fetchAll();
    }

    public function reply(int $inquiryId, int $consultantId, string $replyText): bool {
        $stmt = $this->db->prepare(
            "UPDATE ConsultantInquiries
             SET consultant_reply = :reply, replied_at = NOW(), status = 'responded'
             WHERE inquiry_id = :id AND consultant_id = :cid AND status = 'pending'"
        );
        return $stmt->execute([
            ':reply' => $replyText,
            ':id'    => $inquiryId,
            ':cid'   => $consultantId,
        ]) && $stmt->rowCount() > 0;
    }

    public function close(int $inquiryId, int $consultantId): bool {
        $stmt = $this->db->prepare(
            "UPDATE ConsultantInquiries
             SET status = 'closed'
             WHERE inquiry_id = :id AND consultant_id = :cid AND status = 'responded'"
        );
        return $stmt->execute([':id' => $inquiryId, ':cid' => $consultantId])
            && $stmt->rowCount() > 0;
    }

    public function getConsultantStats(int $consultantId): array {
        $stmt = $this->db->prepare(
            "SELECT
                SUM(status = 'pending')   AS pending,
                SUM(status = 'responded') AS responded,
                SUM(status = 'closed')    AS closed,
                COUNT(*)                  AS total
             FROM ConsultantInquiries
             WHERE consultant_id = :cid"
        );
        $stmt->execute([':cid' => $consultantId]);
        return $stmt->fetch() ?: ['pending' => 0, 'responded' => 0, 'closed' => 0, 'total' => 0];
    }

    // Returns the inquiry_id of an inquiry that is responded/closed and has no review yet.
    // Used by checkEligibility to determine if the user can leave a review.
    public function getReviewableInquiry(int $userId, int $consultantId): ?int {
        $stmt = $this->db->prepare(
            "SELECT ci.inquiry_id
             FROM ConsultantInquiries ci
             LEFT JOIN ConsultantReviews cr ON cr.inquiry_id = ci.inquiry_id
             WHERE ci.user_id       = :uid
               AND ci.consultant_id = :cid
               AND ci.status        IN ('responded', 'closed')
               AND cr.review_id     IS NULL
             LIMIT 1"
        );
        $stmt->execute([':uid' => $userId, ':cid' => $consultantId]);
        $val = $stmt->fetchColumn();
        return $val !== false ? (int)$val : null;
    }
}
