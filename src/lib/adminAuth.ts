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
  const { data } = await supabase
    .from('admin_settings')
    .select('id')
    .single();

  if (!data) {
    // Create default admin password
    const defaultPassword = 'Cfms@7890';
    await supabase.from('admin_settings').insert({
      password_hash: hashPassword(defaultPassword),
    });
  }
};

// Validate admin password
export const validateAdminPassword = async (password: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('password_hash')
    .single();

  if (error || !data) {
    // Fallback to default if table doesn't exist yet
    return password === 'Cfms@7890';
  }

  return data.password_hash === hashPassword(password);
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
