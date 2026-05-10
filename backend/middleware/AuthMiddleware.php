<?php
class AuthMiddleware {

    /**
     * Attempts to re-hydrate $_SESSION['user'] from a persistent token cookie.
     * Called automatically by requireUser() / requireUser() before the session check,
     * so a user whose PHP session expired is transparently re-authenticated as long as
     * their 30-day token is still valid.
     */
    public static function refreshFromToken(): void {
        // Already have an active session — nothing to do.
        if (!empty($_SESSION['user'])) return;

        $token = $_COOKIE['finhub_token'] ?? null;
        if (!$token) return;

        // Database class is always available through config.php, but guard just in case.
        if (!class_exists('Database')) {
            require_once __DIR__ . '/../config/database.php';
        }

        try {
            $db   = Database::getInstance();
            $stmt = $db->prepare(
                "SELECT us.user_id,
                        u.first_name, u.last_name, u.email, u.status,
                        u.preferred_currency_id, u.ai_tone,
                        u.ai_data_sharing, u.weekly_summary_enabled
                 FROM   UserSessions us
                 JOIN   Users u ON u.user_id = us.user_id
                 WHERE  us.session_token = :token
                   AND  us.expires_at    > NOW()
                 LIMIT  1"
            );
            $stmt->execute([':token' => $token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Reject if token not found, expired, or account not active.
            if (!$user || $user['status'] !== 'active') return;

            // Re-hydrate the session with the same shape as user-login.php.
            $_SESSION['user'] = [
                'user_id'                => (int) $user['user_id'],
                'first_name'             => $user['first_name'],
                'last_name'              => $user['last_name'],
                'email'                  => $user['email'],
                'preferred_currency_id'  => (int) ($user['preferred_currency_id'] ?? 1),
                'ai_tone'                => $user['ai_tone']               ?? 'professional',
                'ai_data_sharing'        => (int) ($user['ai_data_sharing']        ?? 1),
                'weekly_summary_enabled' => (int) ($user['weekly_summary_enabled'] ?? 1),
            ];
        } catch (Exception $e) {
            // Non-fatal: if the token lookup fails for any reason, let the
            // session check below handle it and return 401 normally.
        }
    }

    /**
     * Protects admin-only endpoints.
     */
    public static function requireAdmin(): void {
        if (empty($_SESSION['admin'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
    }

    /**
     * Protects user-only endpoints.
     * Tries to restore the session from a persistent token first, so the user
     * is never logged out just because the PHP session timed out.
     */
    public static function requireUser(): void {
        self::refreshFromToken();
        if (empty($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
    }

    public static function getUser(): array {
        return $_SESSION['user'];
    }

    public static function isAdmin(): bool {
        return !empty($_SESSION['admin']);
    }

    public static function isUser(): bool {
        return !empty($_SESSION['user']);
    }
}