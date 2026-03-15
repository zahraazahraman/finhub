<?php
require_once __DIR__ . '/../dal/CategoryDAL.php';

class CategoryBLL {
    private CategoryDAL $dal;

    public function __construct() {
        $this->dal = new CategoryDAL();
    }

    public function getAll(): array {
        return $this->dal->getAll();
    }

    public function create(array $data): array {
        if (empty($data['name']))
            return ['success' => false, 'message' => 'Category name is required.'];
        if (!in_array($data['type'], ['income', 'expense']))
            return ['success' => false, 'message' => 'Type must be income or expense.'];
        $result = $this->dal->create($data);
        if ($result) return ['success' => true, 'message' => 'Category created successfully.'];
        return ['success' => false, 'message' => 'Failed to create category.'];
    }

    public function delete(int $id): array {
        if ($id <= 0)
            return ['success' => false, 'message' => 'Invalid category ID.'];
        $result = $this->dal->delete($id);
        if ($result) return ['success' => true, 'message' => 'Category deleted successfully.'];
        return ['success' => false, 'message' => 'Failed to delete category.'];
    }
}