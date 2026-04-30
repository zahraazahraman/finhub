<?php
require_once __DIR__ . '/../config/database.php';

class UserConsultantDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(?string $specialization): array {
        if ($specialization) {
            $stmt = $this->db->prepare(
                "SELECT consultant_id, first_name, last_name, email, phone, specialization, rating
                 FROM Consultants
                 WHERE specialization = :spec
                 ORDER BY rating DESC, first_name ASC"
            );
            $stmt->execute([':spec' => $specialization]);
        } else {
            $stmt = $this->db->prepare(
                "SELECT consultant_id, first_name, last_name, email, phone, specialization, rating
                 FROM Consultants
                 ORDER BY rating DESC, first_name ASC"
            );
            $stmt->execute();
        }
        return $stmt->fetchAll();
    }

    public function getSpecializations(): array {
        $stmt = $this->db->prepare(
            "SELECT DISTINCT specialization
             FROM Consultants
             WHERE specialization IS NOT NULL
             ORDER BY specialization ASC"
        );
        $stmt->execute();
        return array_column($stmt->fetchAll(), 'specialization');
    }
}