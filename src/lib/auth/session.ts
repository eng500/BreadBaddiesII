import { cookies } from 'next/headers';
import { getDb, generateId } from '@/lib/db';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .run(sessionId, userId, expiresAt.toISOString());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return sessionId;
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const db = getDb();

  // Check if session exists and is valid
  const session = db.prepare(`
    SELECT s.*, u.id, u.email, u.full_name, u.avatar_url
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `).get(sessionId) as any;

  if (!session) {
    // Session expired or doesn't exist
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return {
    id: session.id,
    email: session.email,
    full_name: session.full_name,
    avatar_url: session.avatar_url,
  };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getSession();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
