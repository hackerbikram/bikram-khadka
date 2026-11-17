'use server';

import { db } from '@/app/lib/db';

async function ensureContactTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      confirm INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
}

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createContact(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const message = formData.get('message')?.toString().trim();

  if (!name || !email || !message) {
    return {
      success: false,
      message: 'All fields are required.',
    };
  }

  try {
    // Ensures the table exists on Turso before inserting
    await ensureContactTable();

    // Parameterized query using @libsql/client
    await db.execute({
      sql: `
        INSERT INTO contacts (name, email, message, confirm, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [name, email, message, 0, new Date().toISOString()],
    });

    return {
      success: true,
      message: 'Your message has been sent successfully!',
    };
  } catch (error: unknown) {
    console.error('Turso Error:', error);

    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('SQLITE_CONSTRAINT')) {
      return {
        success: false,
        message: 'A database constraint error occurred.',
      };
    }

    return {
      success: false,
      message: 'An unexpected database error occurred. Please try again later.',
    };
  }
}