'use server';

import { db } from '@/app/lib/db';

export type ContactRecord = {
  id: number;
  name: string;
  email: string;
  message: string;
  confirm: number; // 0 = false, 1 = true
  created_at: string;
};

/**
 * 1. Get all contact messages ordered by newest first
 */
export async function getAllContacts(): Promise<ContactRecord[]> {
  try {
    const result = await db.execute('SELECT * FROM contacts ORDER BY id DESC');
    return result.rows as unknown as ContactRecord[];
  } catch (error) {
    console.error('Error fetching all contacts:', error);
    return [];
  }
}

/**
 * 2. Get only unconfirmed (confirm = 0) contact messages
 */
export async function getPendingContacts(): Promise<ContactRecord[]> {
  try {
    const result = await db.execute(
      'SELECT * FROM contacts WHERE confirm = 0 ORDER BY id DESC'
    );
    return result.rows as unknown as ContactRecord[];
  } catch (error) {
    console.error('Error fetching pending contacts:', error);
    return [];
  }
}

/**
 * 3. Get total count of unconfirmed messages (for badge notifications)
 */
/**
 * 3. Get total count of unconfirmed messages (for badge notifications)
 */
export async function getPendingCount(): Promise<number> {
  try {
    const result = await db.execute(
      'SELECT COUNT(*) as count FROM contacts WHERE confirm = 0'
    );
    
    // Cast through unknown to satisfy TypeScript's strict type checking
    const row = result.rows[0] as unknown as { count: number };
    
    return row ? Number(row.count) : 0;
  } catch (error) {
    console.error('Error fetching pending count:', error);
    return 0;
  }
}

/**
 * 4. Toggle confirm status (set confirm = 1 or revert back to 0)
 */
export async function toggleContactConfirm(id: number, currentConfirm: number): Promise<{ success: boolean; message: string }> {
  try {
    const newConfirmStatus = currentConfirm === 1 ? 0 : 1;

    await db.execute({
      sql: 'UPDATE contacts SET confirm = ? WHERE id = ?',
      args: [newConfirmStatus, id],
    });

    return {
      success: true,
      message: `Contact status updated successfully.`,
    };
  } catch (error) {
    console.error('Error updating contact status:', error);
    return {
      success: false,
      message: 'Failed to update status.',
    };
  }
}

/**
 * 5. Delete a contact message
 */
export async function deleteContact(id: number): Promise<{ success: boolean; message: string }> {
  try {
    await db.execute({
      sql: 'DELETE FROM contacts WHERE id = ?',
      args: [id],
    });

    return {
      success: true,
      message: 'Contact deleted successfully.',
    };
  } catch (error) {
    console.error('Error deleting contact:', error);
    return {
      success: false,
      message: 'Failed to delete contact.',
    };
  }
}