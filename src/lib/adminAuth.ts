// Admin authentication with localStorage (simple, reliable)

const STORAGE_KEY = 'cfms_admin_settings';
const DEFAULT_PASSWORD = 'Cfms@7890';

interface AdminSettings {
  passwordHash: string;
  updatedAt: string;
}

// Simple hash function
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16) + '_' + password.length;
};

// Get stored settings
const getSettings = (): AdminSettings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

// Save settings
const saveSettings = (settings: AdminSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

// Initialize admin settings if not exists
export const initializeAdminSettings = (): void => {
  const settings = getSettings();
  if (!settings) {
    saveSettings({
      passwordHash: hashPassword(DEFAULT_PASSWORD),
      updatedAt: new Date().toISOString(),
    });
  }
};

// Validate admin password
export const validateAdminPassword = (password: string): boolean => {
  const settings = getSettings();
  
  if (!settings) {
    // First run - initialize and check against default
    initializeAdminSettings();
    return password === DEFAULT_PASSWORD;
  }
  
  return settings.passwordHash === hashPassword(password);
};

// Change admin password
export const changeAdminPassword = (
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } => {
  // Validate current password first
  if (!validateAdminPassword(currentPassword)) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Validate new password
  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters' };
  }

  // Update password
  saveSettings({
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
};

// Reset to default password (for recovery)
export const resetAdminPassword = (): void => {
  saveSettings({
    passwordHash: hashPassword(DEFAULT_PASSWORD),
    updatedAt: new Date().toISOString(),
  });
};
