<?php
require_once __DIR__ . '/../dal/ConsultantApplicationDAL.php';
require_once __DIR__ . '/../dal/ConsultantDAL.php';
require_once __DIR__ . '/../dal/AdminNotificationDAL.php';
require_once __DIR__ . '/../services/Mailer.php';
require_once __DIR__ . '/../services/EmailTemplates.php';

class ConsultantApplicationBLL {
    private ConsultantApplicationDAL $dal;
    private ConsultantDAL            $consultantDal;
    private AdminNotificationDAL     $adminNotifDal;

    public function __construct() {
        $this->dal           = new ConsultantApplicationDAL();
        $this->consultantDal = new ConsultantDAL();
        $this->adminNotifDal = new AdminNotificationDAL();
    }

    public function submit(array $data): array {
        // Validate required fields
        $required = ['first_name', 'last_name', 'email', 'specialization', 'bio', 'motivation'];
        foreach ($required as $field) {
            if (empty(trim($data[$field] ?? ''))) {
                return ['success' => false, 'message' => 'Please fill in all required fields.'];
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Please enter a valid email address.'];
        }

        if (!empty($data['linkedin_url']) && !filter_var($data['linkedin_url'], FILTER_VALIDATE_URL)) {
            return ['success' => false, 'message' => 'Please enter a valid LinkedIn or website URL.'];
        }

        if ($this->dal->hasPendingByEmail($data['email'])) {
            return ['success' => false, 'message' => 'An application with this email is already under review.'];
        }

        $id        = $this->dal->insert($data);
        $firstName = trim($data['first_name']);
        $lastName  = trim($data['last_name']);
        $spec      = trim($data['specialization']);

        // Notify admin
        $this->adminNotifDal->create(
            'consultant_application',
            'New Consultant Application',
            "{$firstName} {$lastName} applied to join as a {$spec} consultant."
        );

        // Send confirmation email to the applicant (non-blocking)
        Mailer::send(
            $data['email'],
            "{$firstName} {$lastName}",
            'Application Received — FinHub Consultant Network',
            EmailTemplates::applicationConfirmation($firstName)
        );

        return ['success' => true, 'application_id' => $id];
    }

    public function updateStatus(int $id, string $status, ?string $adminNote): array {
        if (!in_array($status, ['approved', 'rejected'], true)) {
            return ['success' => false, 'message' => 'Invalid status.'];
        }

        $app = $this->dal->getById($id);
        if (!$app) {
            return ['success' => false, 'message' => 'Application not found.'];
        }
        if ($app['status'] !== 'pending') {
            return ['success' => false, 'message' => 'Application has already been reviewed.'];
        }

        $firstName = trim($app['first_name']);
        $lastName  = trim($app['last_name']);

        if ($status === 'approved') {
            if ($this->consultantDal->emailExists($app['email'])) {
                return ['success' => false, 'message' => 'A consultant with this email already exists.'];
            }

            $tempPassword = bin2hex(random_bytes(6)); // 12-char hex
            $hashedPw     = password_hash($tempPassword, PASSWORD_DEFAULT);

            $consultantId = $this->consultantDal->createFromApplication([
                'first_name'       => $firstName,
                'last_name'        => $lastName,
                'email'            => $app['email'],
                'phone'            => $app['phone'],
                'specialization'   => $app['specialization'],
                'years_experience' => $app['years_experience'],
                'bio'              => $app['bio'],
                'password'         => $hashedPw,
                'application_id'   => $id,
            ]);

            $this->dal->updateStatus($id, 'approved', $adminNote);

            $this->adminNotifDal->create(
                'consultant_added',
                'Consultant Application Approved',
                "{$firstName} {$lastName} has been approved and added as a consultant."
            );

            Mailer::send(
                $app['email'],
                "{$firstName} {$lastName}",
                'Welcome to FinHub — Your Consultant Account is Ready',
                EmailTemplates::applicationApproved($firstName, $app['email'], $tempPassword)
            );

            return ['success' => true, 'consultant_id' => $consultantId];
        }

        // rejected
        $this->dal->updateStatus($id, 'rejected', $adminNote);

        Mailer::send(
            $app['email'],
            "{$firstName} {$lastName}",
            'Update on Your FinHub Consultant Application',
            EmailTemplates::applicationRejected($firstName, $adminNote)
        );

        return ['success' => true];
    }

    public function getAll(): array {
        return ['success' => true, 'applications' => $this->dal->getAll()];
    }

    public function getById(int $id): array {
        $app = $this->dal->getById($id);
        if (!$app) return ['success' => false, 'message' => 'Application not found.'];
        return ['success' => true, 'application' => $app];
    }
}
