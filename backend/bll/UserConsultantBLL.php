<?php
require_once __DIR__ . '/../dal/UserConsultantDAL.php';

class UserConsultantBLL {
    private UserConsultantDAL $dal;

    public function __construct() {
        $this->dal = new UserConsultantDAL();
    }

    public function getAll(?string $specialization): array {
        $spec = ($specialization && strtolower($specialization) !== 'all')
            ? trim($specialization)
            : null;

        $consultants = $this->dal->getAll($spec);
        return ['success' => true, 'consultants' => $consultants];
    }

    public function getSpecializations(): array {
        $specializations = $this->dal->getSpecializations();
        return ['success' => true, 'specializations' => $specializations];
    }
}