<?php
require_once __DIR__ . '/../dal/ProfileDAL.php';

class ProfileBLL {
    private ProfileDAL $dal;

    public function __construct() {
        $this->dal = new ProfileDAL();
    }

    // ── GET profile ──
    public function getProfile(int $userId): array {
        $profile = $this->dal->getProfile($userId);
        if (!$profile)
            return ['success' => false, 'message' => 'Profile not found.'];

        return ['success' => true, 'profile' => $profile];
    }

    // ── UPDATE name ──
    public function updateName(int $userId, string $firstName, string $lastName): array {
        $firstName = trim($firstName);
        $lastName  = trim($lastName);

        if (empty($firstName))
            return ['success' => false, 'message' => 'First name is required.'];
        if (empty($lastName))
            return ['success' => false, 'message' => 'Last name is required.'];
        if (strlen($firstName) > 100)
            return ['success' => false, 'message' => 'First name is too long (max 100 characters).'];
        if (strlen($lastName) > 100)
            return ['success' => false, 'message' => 'Last name is too long (max 100 characters).'];

        $ok = $this->dal->updateName($userId, $firstName, $lastName);
        if (!$ok)
            return ['success' => false, 'message' => 'Failed to update name.'];

        return [
            'success'    => true,
            'message'    => 'Name updated successfully.',
            'first_name' => $firstName,
            'last_name'  => $lastName,
        ];
    }

    // ── UPDATE password ──
    public function updatePassword(
        int    $userId,
        string $currentPassword,
        string $newPassword,
        string $confirmPassword
    ): array {
        if (empty($currentPassword))
            return ['success' => false, 'message' => 'Current password is required.'];
        if (empty($newPassword))
            return ['success' => false, 'message' => 'New password is required.'];
        if (strlen($newPassword) < 8)
            return ['success' => false, 'message' => 'New password must be at least 8 characters.'];
        if ($newPassword !== $confirmPassword)
            return ['success' => false, 'message' => 'Passwords do not match.'];

        $hash = $this->dal->getPasswordHash($userId);
        if (!$hash || !password_verify($currentPassword, $hash))
            return ['success' => false, 'message' => 'Current password is incorrect.'];

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $ok      = $this->dal->updatePassword($userId, $newHash);
        if (!$ok)
            return ['success' => false, 'message' => 'Failed to update password.'];

        return ['success' => true, 'message' => 'Password updated successfully.'];
    }

    // ── UPDATE preferences ──
    public function updatePreferences(int $userId, array $data): array {
        $currencyId           = (int)($data['preferred_currency_id'] ?? 1);
        $aiTone               = $data['ai_tone'] ?? 'professional';
        $aiDataSharing        = isset($data['ai_data_sharing'])        ? (int)(bool)$data['ai_data_sharing']        : 1;
        $weeklySummaryEnabled = isset($data['weekly_summary_enabled']) ? (int)(bool)$data['weekly_summary_enabled'] : 1;

        if ($currencyId <= 0)
            return ['success' => false, 'message' => 'Please select a valid currency.'];
        if (!in_array($aiTone, ['simple', 'professional']))
            return ['success' => false, 'message' => 'Invalid AI tone value.'];

        $ok = $this->dal->updatePreferences($userId, $currencyId, $aiTone, $aiDataSharing, $weeklySummaryEnabled);
        if (!$ok)
            return ['success' => false, 'message' => 'Failed to save preferences.'];

        return [
            'success'                => true,
            'message'                => 'Preferences saved successfully.',
            'preferred_currency_id'  => $currencyId,
            'ai_tone'                => $aiTone,
            'ai_data_sharing'        => $aiDataSharing,
            'weekly_summary_enabled' => $weeklySummaryEnabled,
        ];
    }
}