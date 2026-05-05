
<?php
require_once __DIR__ . '/../config/database.php';

class ProfileDAL {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getProfile(int $userId): ?array {
        $stmt = $this->db->prepare(
            "SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone_number,
                    u.preferred_currency_id, u.ai_tone, u.ai_data_sharing, u.weekly_summary_enabled,
                    c.code AS preferred_currency_code, c.symbol AS preferred_currency_symbol
             FROM Users u
             LEFT JOIN Currencies c ON c.currency_id = u.preferred_currency_id
             WHERE u.user_id = :user_id
             LIMIT 1"
        );
        $stmt->execute([':user_id' => $userId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getPasswordHash(int $userId): ?string {
        $stmt = $this->db->prepare(
            "SELECT password_hash FROM Users WHERE user_id = :user_id LIMIT 1"
        );
        $stmt->execute([':user_id' => $userId]);
        $row = $stmt->fetch();
        return $row ? $row['password_hash'] : null;
    }

    public function updateName(int $userId, string $firstName, string $lastName): bool {
        $stmt = $this->db->prepare(
            "UPDATE Users SET first_name = :first_name, last_name = :last_name
             WHERE user_id = :user_id"
        );
        return $stmt->execute([
            ':first_name' => $firstName,
            ':last_name'  => $lastName,
            ':user_id'    => $userId,
        ]);
    }

    public function updatePassword(int $userId, string $newHash): bool {
        $stmt = $this->db->prepare(
            "UPDATE Users SET password_hash = :hash WHERE user_id = :user_id"
        );
        return $stmt->execute([':hash' => $newHash, ':user_id' => $userId]);
    }

    public function updatePreferences(
        int    $userId,
        int    $currencyId,
        string $aiTone,
        int    $aiDataSharing,
        int    $weeklySummaryEnabled
    ): bool {
        $stmt = $this->db->prepare(
            "UPDATE Users
             SET preferred_currency_id  = :currency_id,
                 ai_tone                = :ai_tone,
                 ai_data_sharing        = :ai_data_sharing,
                 weekly_summary_enabled = :weekly_summary_enabled
             WHERE user_id = :user_id"
        );
        return $stmt->execute([
            ':currency_id'            => $currencyId,
            ':ai_tone'                => $aiTone,
            ':ai_data_sharing'        => $aiDataSharing,
            ':weekly_summary_enabled' => $weeklySummaryEnabled,
            ':user_id'                => $userId,
        ]);
    }
}