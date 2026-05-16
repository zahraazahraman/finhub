<?php
require_once __DIR__ . '/../config/database.php';

class ReviewDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function insert(array $data): bool {
        $stmt = $this->db->prepare(
            "INSERT INTO ConsultantReviews
                (inquiry_id, user_id, consultant_id,
                 rating_clarity, rating_responsiveness, rating_actionability,
                 review_text, created_at)
             VALUES
                (:iid, :uid, :cid, :clarity, :responsiveness, :actionability, :text, NOW())"
        );
        return $stmt->execute([
            ':iid'            => $data['inquiry_id'],
            ':uid'            => $data['user_id'],
            ':cid'            => $data['consultant_id'],
            ':clarity'        => $data['rating_clarity'],
            ':responsiveness' => $data['rating_responsiveness'],
            ':actionability'  => $data['rating_actionability'],
            ':text'           => $data['review_text'] ?? null,
        ]);
    }

    // Returns reviews for a consultant, joined with reviewer's name.
    public function getByConsultant(int $consultantId): array {
        $stmt = $this->db->prepare(
            "SELECT cr.review_id, cr.inquiry_id, cr.user_id,
                    cr.rating_clarity, cr.rating_responsiveness, cr.rating_actionability,
                    cr.review_text, cr.created_at,
                    u.first_name AS reviewer_first_name,
                    u.last_name  AS reviewer_last_name
             FROM ConsultantReviews cr
             JOIN Users u ON u.user_id = cr.user_id
             WHERE cr.consultant_id = :cid
             ORDER BY cr.created_at DESC"
        );
        $stmt->execute([':cid' => $consultantId]);
        return $stmt->fetchAll();
    }

    // Returns per-dimension averages and total review count for a consultant.
    public function getAvgByConsultant(int $consultantId): array {
        $stmt = $this->db->prepare(
            "SELECT
                ROUND(AVG(rating_clarity), 1)        AS avg_clarity,
                ROUND(AVG(rating_responsiveness), 1) AS avg_responsiveness,
                ROUND(AVG(rating_actionability), 1)  AS avg_actionability,
                ROUND(AVG(
                    (rating_clarity + rating_responsiveness + rating_actionability) / 3.0
                ), 1) AS avg_overall,
                COUNT(*) AS review_count
             FROM ConsultantReviews
             WHERE consultant_id = :cid"
        );
        $stmt->execute([':cid' => $consultantId]);
        return $stmt->fetch();
    }

    // Used by ReviewBLL eligibility gate — prevents duplicate reviews per inquiry.
    public function existsForInquiry(int $inquiryId): bool {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM ConsultantReviews WHERE inquiry_id = :iid"
        );
        $stmt->execute([':iid' => $inquiryId]);
        return (int)$stmt->fetchColumn() > 0;
    }
}
