<?php
require_once __DIR__ . '/../dal/ReviewDAL.php';
require_once __DIR__ . '/../dal/InquiryDAL.php';

class ReviewBLL {
    private ReviewDAL  $dal;
    private InquiryDAL $inquiryDal;

    public function __construct() {
        $this->dal        = new ReviewDAL();
        $this->inquiryDal = new InquiryDAL();
    }

    // ── Submit a review ──
    // Three server-side eligibility gates (never rely on frontend-only checks):
    //   1. The inquiry must belong to the current user.
    //   2. The inquiry status must be 'responded' or 'closed'.
    //   3. No review may already exist for this inquiry (UNIQUE KEY backs this up at DB level).
    public function submitReview(int $userId, array $data): array {
        $inquiryId    = (int)($data['inquiry_id']             ?? 0);
        $clarity      = (int)($data['rating_clarity']         ?? 0);
        $responsiveness = (int)($data['rating_responsiveness'] ?? 0);
        $actionability  = (int)($data['rating_actionability']  ?? 0);
        $reviewText   = trim($data['review_text'] ?? '');

        if ($inquiryId <= 0) {
            return ['success' => false, 'message' => 'Invalid inquiry.'];
        }

        foreach ([$clarity, $responsiveness, $actionability] as $r) {
            if ($r < 1 || $r > 5) {
                return ['success' => false, 'message' => 'All ratings must be between 1 and 5.'];
            }
        }

        // Gate 1 — ownership
        $inquiry = $this->inquiryDal->getById($inquiryId);
        if (!$inquiry || (int)$inquiry['user_id'] !== $userId) {
            return ['success' => false, 'message' => 'Inquiry not found.'];
        }

        // Gate 2 — status
        if (!in_array($inquiry['status'], ['responded', 'closed'])) {
            return ['success' => false, 'message' => 'You can only leave a review after the consultant has responded.'];
        }

        // Gate 3 — duplicate
        if ($this->dal->existsForInquiry($inquiryId)) {
            return ['success' => false, 'message' => 'You have already reviewed this consultation.'];
        }

        $this->dal->insert([
            'inquiry_id'             => $inquiryId,
            'user_id'                => $userId,
            'consultant_id'          => (int)$inquiry['consultant_id'],
            'rating_clarity'         => $clarity,
            'rating_responsiveness'  => $responsiveness,
            'rating_actionability'   => $actionability,
            'review_text'            => $reviewText !== '' ? $reviewText : null,
        ]);

        return ['success' => true];
    }

    // Returns reviews array + per-dimension averages for a consultant.
    public function getByConsultant(int $consultantId): array {
        $reviews = $this->dal->getByConsultant($consultantId);
        $avg     = $this->dal->getAvgByConsultant($consultantId);
        return [
            'success' => true,
            'reviews' => $reviews,
            'avg'     => $avg,
        ];
    }
}
