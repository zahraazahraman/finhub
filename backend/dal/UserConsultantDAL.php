<?php
require_once __DIR__ . '/../config/database.php';

class UserConsultantDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // ── List all consultants (optional specialization filter) ──
    // Returns basic columns only — sufficient for card grid.
    // New visual fields (is_verified, availability_status, is_featured) are
    // included here after the Phase 1 migration has been applied.
    public function getAll(?string $specialization): array {
        if ($specialization) {
            $stmt = $this->db->prepare(
                "SELECT consultant_id, first_name, last_name, email, phone,
                        specialization, rating, is_verified, availability_status, is_featured
                 FROM Consultants
                 WHERE specialization = :spec
                 ORDER BY is_featured DESC, rating DESC, first_name ASC"
            );
            $stmt->execute([':spec' => $specialization]);
        } else {
            $stmt = $this->db->prepare(
                "SELECT consultant_id, first_name, last_name, email, phone,
                        specialization, rating, is_verified, availability_status, is_featured
                 FROM Consultants
                 ORDER BY is_featured DESC, rating DESC, first_name ASC"
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

    // ── Full profile for a single consultant ──
    // JSON fields are decoded before returning to BLL.
    public function getById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT consultant_id, first_name, last_name, email, phone,
                    specialization, rating, bio, sub_skills, languages,
                    years_experience, availability_status, fee_structure,
                    is_verified, is_featured, case_studies
             FROM Consultants
             WHERE consultant_id = :id"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) return null;

        $row['sub_skills']    = $row['sub_skills']    ? json_decode($row['sub_skills'],    true) : [];
        $row['languages']     = $row['languages']     ? json_decode($row['languages'],     true) : [];
        $row['fee_structure'] = $row['fee_structure'] ? json_decode($row['fee_structure'], true) : null;
        $row['case_studies']  = $row['case_studies']  ? json_decode($row['case_studies'],  true) : [];

        return $row;
    }

    // ── Consultants filtered by specialization, available only ──
    // Used by matchByNeed and getTopBySpecialization.
    public function getBySpecialization(string $spec): array {
        $stmt = $this->db->prepare(
            "SELECT consultant_id, first_name, last_name, email, phone,
                    specialization, rating, is_verified, availability_status, is_featured
             FROM Consultants
             WHERE specialization = :spec
               AND availability_status != 'unavailable'
             ORDER BY is_featured DESC, rating DESC"
        );
        $stmt->execute([':spec' => $spec]);
        return $stmt->fetchAll();
    }

    // ── All consultants sorted by featured then rating ──
    // Fallback when no keyword matches in matchByNeed.
    public function getAllSorted(): array {
        $stmt = $this->db->prepare(
            "SELECT consultant_id, first_name, last_name, email, phone,
                    specialization, rating, is_verified, availability_status, is_featured
             FROM Consultants
             ORDER BY is_featured DESC, rating DESC"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
