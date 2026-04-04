<?php
class AuthMiddleware {
    public static function requireAdmin(): void {
        if (empty($_SESSION['admin'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
    }

    public static function verifyUser(): void {
        if (empty($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
    }

    public static function getUser(): array {
        return $_SESSION['user'];
    }

}