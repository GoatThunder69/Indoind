// Admin authentication with Firebase (syncs across devices)
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_PASSWORD = 'Cfms@7890';
const ADMIN_DOC_ID = 'admin_password';

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

// Initialize admin settings (creates doc if not exists)
export const initializeAdminSettings = async (): Promise<void> => {
  try {
    const docRef = doc(db, 'admin_settings', ADMIN_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        password_hash: hashPassword(DEFAULT_PASSWORD),
        updated_at: new Date().toISOString(),
      });
      console.log('[adminAuth] init: created default password');
    }
  } catch (e) {
    console.log('[adminAuth] init exception:', e);
  }
};

// Validate admin password
export const validateAdminPassword = async (password: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'admin_settings', ADMIN_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('[adminAuth] validate: no doc found; using default fallback');
      return password === DEFAULT_PASSWORD;
    }

    const data = docSnap.data();
    const expectedHash = data.password_hash;
    const providedHash = hashPassword(password);
    const ok = expectedHash === providedHash;

    console.log('[adminAuth] validate:', {
      ok,
      updated_at: data.updated_at,
      expectedHashPrefix: expectedHash?.slice(0, 12),
      providedHashPrefix: providedHash.slice(0, 12),
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
    const docRef = doc(db, 'admin_settings', ADMIN_DOC_ID);
    await setDoc(docRef, {
      password_hash: hashPassword(newPassword),
      updated_at: new Date().toISOString(),
    });

    console.log('[adminAuth] password changed successfully');
    return { success: true };
  } catch (e) {
    console.log('[adminAuth] change exception:', e);
    return { success: false, error: 'Failed to update password' };
  }
};

// Reset to default password
export const resetAdminPassword = async (): Promise<boolean> => {
  try {
    const docRef = doc(db, 'admin_settings', ADMIN_DOC_ID);
    await setDoc(docRef, {
      password_hash: hashPassword(DEFAULT_PASSWORD),
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    console.log('[adminAuth] reset exception:', e);
    return false;
  }
};
