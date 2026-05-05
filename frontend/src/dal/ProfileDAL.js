const BASE = '/api/profile';

const ProfileDAL = {
  async getProfile() {
    const res = await fetch(BASE, { credentials: 'include' });
    return res.json();
  },

  async updateName(firstName, lastName) {
    const res = await fetch(BASE, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'name', first_name: firstName, last_name: lastName }),
    });
    return res.json();
  },

  async updatePassword(currentPassword, newPassword, confirmPassword) {
    const res = await fetch(BASE, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'password',
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
    return res.json();
  },

  async updatePreferences(prefs) {
    const res = await fetch(BASE, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'preferences', ...prefs }),
    });
    return res.json();
  },
};

export default ProfileDAL;