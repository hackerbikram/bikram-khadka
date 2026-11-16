import bcrypt from 'bcryptjs';
import { db, createUserTable } from '@/app/lib/db';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password securely using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored bcrypt hash.
 * Returns true if they match, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}



export async function registerUser(email: string, plainPassword: string) {
  await createUserTable();
  
  const hashedPassword = await hashPassword(plainPassword);

  try {
    await db.execute({
      sql: 'INSERT INTO users (email, password) VALUES (?, ?)',
      args: [email, hashedPassword],
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Email already exists or database error.' };
  }
}


export async function authenticateUser(email: string, plainPassword: string) {
  await createUserTable();

  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  const user = result.rows[0] as any;
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // Compare input password with stored hash
  const isValid = await verifyPassword(plainPassword, user.password);

  if (!isValid) {
    return { success: false, error: 'Invalid email or password.' };
  }

  return { success: true, user };
}