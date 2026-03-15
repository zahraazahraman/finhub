<?php
require_once __DIR__ . '/../config/database.php';

class ConsultantDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        $stmt = $this->db->query(
            "SELECT consultant_id, first_name, last_name, email, 
                    phone, specialization, rating 
             FROM Consultants 
             ORDER BY consultant_id DESC"
        );
        return $stmt->fetchAll();
    }

    public function create(array $data): bool {
        $stmt = $this->db->prepare(
            "INSERT INTO Consultants (first_name, last_name, email, phone, specialization, rating)
             VALUES (:first_name, :last_name, :email, :phone, :specialization, :rating)"
        );
        return $stmt->execute([
            ':first_name'     => $data['first_name'],
            ':last_name'      => $data['last_name'],
            ':email'          => $data['email'],
            ':phone'          => $data['phone'],
            ':specialization' => $data['specialization'],
            ':rating'         => $data['rating'] ?? null,
        ]);
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare(
            "UPDATE Consultants 
             SET first_name = :first_name, last_name = :last_name,
                 email = :email, phone = :phone,
                 specialization = :specialization, rating = :rating
             WHERE consultant_id = :id"
        );
        return $stmt->execute([
            ':first_name'     => $data['first_name'],
            ':last_name'      => $data['last_name'],
            ':email'          => $data['email'],
            ':phone'          => $data['phone'],
            ':specialization' => $data['specialization'],
            ':rating'         => $data['rating'] ?? null,
            ':id'             => $id,
        ]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM Consultants WHERE consultant_id = :id"
        );
        return $stmt->execute([':id' => $id]);
    }
}