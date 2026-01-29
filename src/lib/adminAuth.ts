// Admin authentication with Supabase
import { supabase } from '@/integrations/supabase/client';

export interface AdminSettings {
  id: string;
  password_hash: string;
  updated_at: string;
}

// Simple hash function (for demo - in production use bcrypt via edge function)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16) + '_' + password.length;
};

// Initialize admin settings if not exists
export const initializeAdminSettings = async (): Promise<void> => {
  try {
    // Use maybeSingle so we don't error when the table is empty.
    const { data, error } = await supabase
      .from('admin_settings')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Some PostgREST setups still return an array when using limit(1).
    const row = Array.isArray(data) ? data[0] : data;

    // If the table is missing (or any other error), just skip initialization.
    // validateAdminPassword() already has a safe fallback.
    if (error) return;

    if (!row) {
      // Create default admin password
      const defaultPassword = 'Cfms@7890';
      await supabase.from('admin_settings').insert({
        password_hash: hashPassword(defaultPassword),
        updated_at: new Date().toISOString(),
      });
    }
  } catch {
    // Ignore initialization failures; login can still fallback to default.
  }
};

// Validate admin password
export const validateAdminPassword = async (password: string): Promise<boolean> => {
  try {
    // Be resilient to 0 rows / multiple rows by always selecting the latest record.
    const { data, error } = await supabase
      .from('admin_settings')
      .select('password_hash')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Some PostgREST setups still return an array when using limit(1).
    const row = Array.isArray(data) ? data[0] : data;

    if (error || !row) {
      // Fallback to default if table doesn't exist yet
      console.log('Using default password (table not found)');
      return password === 'Cfms@7890';
    }

    return row.password_hash === hashPassword(password);
  } catch (err) {
    // If any error, fallback to default password
    console.log('Using default password (error occurred)');
    return password === 'Cfms@7890';
  }
};

// Change admin password
export const changeAdminPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  // Validate current password first
  const isValid = await validateAdminPassword(currentPassword);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Validate new password
  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters' };
  }

  // Update password
  const { error } = await supabase
    .from('admin_settings')
    .update({
      password_hash: hashPassword(newPassword),
      updated_at: new Date().toISOString(),
    })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

  if (error) {
    return { success: false, error: 'Failed to update password' };
  }

  return { success: true };
};
