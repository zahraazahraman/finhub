<?php
require_once __DIR__ . '/../dal/ConsultantDAL.php';

class ConsultantBLL {
    private ConsultantDAL $dal;

    public function __construct() {
        $this->dal = new ConsultantDAL();
    }

    private function validate(array $data): array {
        $errors = [];
        if (empty($data['first_name'])) $errors[] = 'First name is required.';
        if (empty($data['last_name']))  $errors[] = 'Last name is required.';
        if (empty($data['email']))      $errors[] = 'Email is required.';
        elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL))
            $errors[] = 'Invalid email address.';
        if (empty($data['specialization'])) $errors[] = 'Specialization is required.';
        if (isset($data['rating']) && $data['rating'] !== null) {
            if ($data['rating'] < 0 || $data['rating'] > 5)
                $errors[] = 'Rating must be between 0 and 5.';
        }
        return $errors;
    }

    public function getAll(): array {
        return $this->dal->getAll();
    }

    public function create(array $data): array {
        $errors = $this->validate($data);
        if (!empty($errors))
            return ['success' => false, 'message' => implode(' ', $errors)];
        $result = $this->dal->create($data);
        if ($result) return ['success' => true, 'message' => 'Consultant created successfully.'];
        return ['success' => false, 'message' => 'Failed to create consultant.'];
    }

    public function update(int $id, array $data): array {
        $errors = $this->validate($data);
        if (!empty($errors))
            return ['success' => false, 'message' => implode(' ', $errors)];
        $result = $this->dal->update($id, $data);
        if ($result) return ['success' => true, 'message' => 'Consultant updated successfully.'];
        return ['success' => false, 'message' => 'Failed to update consultant.'];
    }

    public function delete(int $id): array {
        if ($id <= 0) return ['success' => false, 'message' => 'Invalid consultant ID.'];
        $result = $this->dal->delete($id);
        if ($result) return ['success' => true, 'message' => 'Consultant deleted successfully.'];
        return ['success' => false, 'message' => 'Failed to delete consultant.'];
    }
}