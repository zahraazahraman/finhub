<?php
require_once __DIR__ . '/../dal/AdminDAL.php';

class AdminBLL {
    private AdminDAL $dal;

    public function __construct() {
        $this->dal = new AdminDAL();
    }

    public function login(string $email, string $password): array {
        if (empty($email) || empty($password)) {
            return ['success' => false, 'message' => 'Email and password are required.'];
        }

        $admin = $this->dal->findByEmail($email);

        if (!$admin) {
            return ['success' => false, 'message' => 'Invalid credentials.'];
        }

        if (!password_verify($password, $admin['password_hash'])) {
            return ['success' => false, 'message' => 'Invalid credentials.'];
        }

        return [
            'success' => true,
            'user' => [
                'admin_id' => $admin['admin_id'],
                'email'    => $admin['email'],
            ]
        ];
    }
}