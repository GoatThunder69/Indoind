// Admin authentication with Supabase (syncs across devices)
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_PASSWORD = 'Cfms@7890';

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

// Initialize admin settings (creates row if not exists)
export const initializeAdminSettings = async (): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('id')
      .limit(1);

    if (error) {
      console.log('Admin settings table check failed:', error.message);
      return;
    }

    // If no rows exist, create default
    if (!data || data.length === 0) {
      await supabase.from('admin_settings').insert({
        password_hash: hashPassword(DEFAULT_PASSWORD),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.log('Init admin settings error:', e);
  }
};

// Validate admin password
export const validateAdminPassword = async (password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('password_hash')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.log('Validate error:', error.message);
      // Fallback to default password if table doesn't exist
      return password === DEFAULT_PASSWORD;
    }

    // No rows - use default
    if (!data || data.length === 0) {
      return password === DEFAULT_PASSWORD;
    }

    const row = data[0];
    return row.password_hash === hashPassword(password);
  } catch (e) {
    console.log('Validate exception:', e);
    return password === DEFAULT_PASSWORD;
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

  try {
    // Delete all existing rows and insert new one (ensures single row)
    await supabase.from('admin_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    const { error } = await supabase.from('admin_settings').insert({
      password_hash: hashPassword(newPassword),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.log('Change password error:', error.message);
      return { success: false, error: 'Failed to update password' };
    }

    return { success: true };
  } catch (e) {
    console.log('Change password exception:', e);
    return { success: false, error: 'Failed to update password' };
  }
};

// Reset to default password
export const resetAdminPassword = async (): Promise<boolean> => {
  try {
    await supabase.from('admin_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    const { error } = await supabase.from('admin_settings').insert({
      password_hash: hashPassword(DEFAULT_PASSWORD),
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch (e) {
    return false;
  }
};
