import ProfileDAL from '../dal/ProfileDAL.js';

const ProfileBLL = {

  async getProfile() {
    return ProfileDAL.getProfile();
  },

  async updateName(firstName, lastName) {
    firstName = firstName.trim();
    lastName  = lastName.trim();

    if (!firstName) return { success: false, message: 'First name is required.' };
    if (!lastName)  return { success: false, message: 'Last name is required.' };
    if (firstName.length > 100) return { success: false, message: 'First name is too long.' };
    if (lastName.length  > 100) return { success: false, message: 'Last name is too long.' };

    return ProfileDAL.updateName(firstName, lastName);
  },

  async updatePassword(currentPassword, newPassword, confirmPassword) {
    if (!currentPassword) return { success: false, message: 'Current password is required.' };
    if (!newPassword)     return { success: false, message: 'New password is required.' };
    if (newPassword.length < 8)
      return { success: false, message: 'New password must be at least 8 characters.' };
    if (newPassword !== confirmPassword)
      return { success: false, message: 'Passwords do not match.' };

    return ProfileDAL.updatePassword(currentPassword, newPassword, confirmPassword);
  },

  async updatePreferences(prefs) {
    if (!prefs.preferred_currency_id || prefs.preferred_currency_id <= 0)
      return { success: false, message: 'Please select a currency.' };
    if (!['simple', 'professional'].includes(prefs.ai_tone))
      return { success: false, message: 'Invalid AI tone.' };

    return ProfileDAL.updatePreferences(prefs);
  },
};

export default ProfileBLL;