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
      .select('password_hash, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.log('[adminAuth] init: table check failed:', error.message);
      return;
    }

    // If no rows exist, create default
    if (!data) {
      const { error: insertError } = await supabase.from('admin_settings').insert({
        password_hash: hashPassword(DEFAULT_PASSWORD),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.log('[adminAuth] init: insert failed:', insertError.message);
      }
    }
  } catch (e) {
    console.log('[adminAuth] init exception:', e);
  }
};

// Validate admin password
export const validateAdminPassword = async (password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('password_hash, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.log('[adminAuth] validate: query error:', error.message);
      // Fallback to default password if table doesn't exist
      return password === DEFAULT_PASSWORD;
    }

    // No rows - use default
    if (!data) {
      console.log('[adminAuth] validate: no rows found; using default fallback');
      return password === DEFAULT_PASSWORD;
    }

    const expectedHash = data.password_hash;
    const providedHash = hashPassword(password);
    const ok = expectedHash === providedHash;

    console.log('[adminAuth] validate:', {
      ok,
      updated_at: data.updated_at,
      expectedHashPrefix: expectedHash?.slice(0, 12),
      providedHashPrefix: providedHash.slice(0, 12),
      passwordLength: password.length,
    });

    return ok;
  } catch (e) {
    console.log('[adminAuth] validate exception:', e);
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
    // Insert a new row; validate always reads the latest by updated_at.
    const { error } = await supabase.from('admin_settings').insert({
      password_hash: hashPassword(newPassword),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.log('[adminAuth] change: insert failed:', error.message);
      return { success: false, error: 'Failed to update password' };
    }

    return { success: true };
  } catch (e) {
    console.log('[adminAuth] change exception:', e);
    return { success: false, error: 'Failed to update password' };
  }
};

// Reset to default password
export const resetAdminPassword = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('admin_settings').insert({
      password_hash: hashPassword(DEFAULT_PASSWORD),
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch (e) {
    return false;
  }
};
