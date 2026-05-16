<?php
require_once __DIR__ . '/../config/database.php';

class ConsultantApplicationDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function insert(array $data): int {
        $stmt = $this->db->prepare(
            "INSERT INTO ConsultantApplications
                (first_name, last_name, email, phone, specialization,
                 years_experience, bio, motivation, linkedin_url)
             VALUES
                (:first_name, :last_name, :email, :phone, :specialization,
                 :years_experience, :bio, :motivation, :linkedin_url)"
        );
        $stmt->execute([
            ':first_name'       => $data['first_name'],
            ':last_name'        => $data['last_name'],
            ':email'            => $data['email'],
            ':phone'            => $data['phone']        ?: null,
            ':specialization'   => $data['specialization'],
            ':years_experience' => (int)$data['years_experience'],
            ':bio'              => $data['bio'],
            ':motivation'       => $data['motivation'],
            ':linkedin_url'     => $data['linkedin_url'] ?: null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        $stmt = $this->db->query(
            "SELECT application_id, first_name, last_name, email, phone,
                    specialization, years_experience, bio, motivation,
                    linkedin_url, status, admin_note, created_at, reviewed_at
             FROM ConsultantApplications
             ORDER BY
                FIELD(status, 'pending', 'approved', 'rejected'),
                created_at DESC"
        );
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT application_id, first_name, last_name, email, phone,
                    specialization, years_experience, bio, motivation,
                    linkedin_url, status, admin_note, created_at, reviewed_at
             FROM ConsultantApplications
             WHERE application_id = :id"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function updateStatus(int $id, string $status, ?string $adminNote): bool {
        $stmt = $this->db->prepare(
            "UPDATE ConsultantApplications
             SET status = :status, admin_note = :note, reviewed_at = NOW()
             WHERE application_id = :id"
        );
        return $stmt->execute([
            ':status' => $status,
            ':note'   => $adminNote,
            ':id'     => $id,
        ]);
    }

    // Prevent duplicate pending applications from the same email.
    public function hasPendingByEmail(string $email): bool {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM ConsultantApplications
             WHERE email = :email AND status = 'pending'"
        );
        $stmt->execute([':email' => $email]);
        return (int)$stmt->fetchColumn() > 0;
    }
}
