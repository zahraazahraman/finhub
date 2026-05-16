<?php
require_once __DIR__ . '/../config/database.php';

class ConsultantProfileBLL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function get(int $consultantId): array {
        $stmt = $this->db->prepare(
            "SELECT consultant_id, first_name, last_name, email, phone,
                    specialization, years_experience, bio, rating
             FROM Consultants
             WHERE consultant_id = :id"
        );
        $stmt->execute([':id' => $consultantId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return ['success' => false, 'message' => 'Consultant not found.'];
        return ['success' => true, 'profile' => $row];
    }

    public function update(int $consultantId, array $data): array {
        $firstName  = trim($data['first_name']  ?? '');
        $lastName   = trim($data['last_name']   ?? '');
        $phone      = trim($data['phone']        ?? '');
        $spec       = trim($data['specialization'] ?? '');
        $bio        = trim($data['bio']          ?? '');
        $experience = (int)($data['years_experience'] ?? 0);

        if (!$firstName || !$lastName || !$spec) {
            return ['success' => false, 'message' => 'First name, last name and specialization are required.'];
        }

        $stmt = $this->db->prepare(
            "UPDATE Consultants
             SET first_name = :first_name, last_name = :last_name,
                 phone = :phone, specialization = :spec,
                 bio = :bio, years_experience = :exp
             WHERE consultant_id = :id"
        );
        $stmt->execute([
            ':first_name' => $firstName,
            ':last_name'  => $lastName,
            ':phone'      => $phone ?: null,
            ':spec'       => $spec,
            ':bio'        => $bio ?: null,
            ':exp'        => $experience,
            ':id'         => $consultantId,
        ]);

        return ['success' => true, 'updated' => [
            'first_name'       => $firstName,
            'last_name'        => $lastName,
            'specialization'   => $spec,
        ]];
    }
}
