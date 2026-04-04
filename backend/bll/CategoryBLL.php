<?php
require_once __DIR__ . '/../dal/CategoryDAL.php';
require_once __DIR__ . '/../bll/AdminNotificationBLL.php';

class CategoryBLL {
    private CategoryDAL $dal;
    private AdminNotificationBLL $notifier;

    public function __construct() {
        $this->dal      = new CategoryDAL();
        $this->notifier = new AdminNotificationBLL();
    }

    public function getAll(): array {
        return $this->dal->getAll();
    }

    public function create(array $data): array {
        if (empty($data['name']))
            return ['success' => false, 'message' => 'Category name is required.'];
        if (!in_array($data['type'], ['income', 'expense']))
            return ['success' => false, 'message' => 'Type must be income or expense.'];

        if ($this->dal->nameTypeExists($data['name'], $data['type']))
            return ['success' => false, 'message' => 'A category with this name and type already exists.'];

        $result = $this->dal->create($data);
        if ($result) {
            $this->notifier->notify(
                'category_added',
                'New Category Added',
                "Category \"{$data['name']}\" ({$data['type']}) was created."
            );
            return ['success' => true, 'message' => 'Category created successfully.'];
        }
        return ['success' => false, 'message' => 'Failed to create category.'];
    }

    public function delete(int $id): array {
        if ($id <= 0)
            return ['success' => false, 'message' => 'Invalid category ID.'];

        // Get category info before deleting
        $categories = $this->dal->getAll();
        $category   = array_filter($categories, fn($c) => $c['category_id'] == $id);
        $category   = array_values($category)[0] ?? null;

        $result = $this->dal->delete($id);
        if ($result) {
            if ($category) {
                $this->notifier->notify(
                    'category_deleted',
                    'Category Deleted',
                    "Category \"{$category['name']}\" was deleted."
                );
            }
            return ['success' => true, 'message' => 'Category deleted successfully.'];
        }
        return ['success' => false, 'message' => 'Failed to delete category.'];
    }
}
