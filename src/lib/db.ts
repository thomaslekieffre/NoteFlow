import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export async function createNote(
  userId: string,
  title: string,
  content: string
): Promise<Note> {
  const result = await sql<Note>`
    INSERT INTO notes (user_id, title, content)
    VALUES (${userId}, ${title}, ${content})
    RETURNING id, title, content, created_at, updated_at
  `;
  return result.rows[0];
}

export async function getNotes(userId: string): Promise<Note[]> {
  const result = await sql<Note>`
    SELECT id, title, content, created_at, updated_at
    FROM notes
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;
  return result.rows;
}

export async function getNote(
  userId: string,
  noteId: string
): Promise<Note | null> {
  const result = await sql<Note>`
    SELECT id, title, content, created_at, updated_at
    FROM notes
    WHERE user_id = ${userId} AND id = ${noteId}
  `;
  return result.rows[0] || null;
}

export async function updateNote(
  userId: string,
  noteId: string,
  title: string,
  content: string
): Promise<Note | null> {
  const result = await sql<Note>`
    UPDATE notes
    SET title = ${title}, content = ${content}, updated_at = NOW()
    WHERE user_id = ${userId} AND id = ${noteId}
    RETURNING id, title, content, created_at, updated_at
  `;
  return result.rows[0] || null;
}

export async function deleteNote(
  userId: string,
  noteId: string
): Promise<void> {
  await sql`DELETE FROM notes WHERE user_id = ${userId} AND id = ${noteId}`;
}

export async function createShareLink(
  userId: string,
  noteId: string
): Promise<string> {
  const shareId = uuidv4();
  await sql`
    INSERT INTO shared_notes (share_id, user_id, note_id)
    VALUES (${shareId}, ${userId}, ${noteId})
  `;
  return shareId;
}

export async function getSharedNote(shareId: string): Promise<Note | null> {
  const result = await sql<Note>`
    SELECT n.id, n.title, n.content, n.created_at, n.updated_at
    FROM notes n
    JOIN shared_notes sn ON n.id = sn.note_id
    WHERE sn.share_id = ${shareId}
  `;
  return result.rows[0] || null;
}
