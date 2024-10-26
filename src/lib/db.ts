import { sql } from "@vercel/postgres";

export async function createNote(
  userId: string,
  title: string,
  content: string
) {
  try {
    const result = await sql`
      INSERT INTO notes (user_id, title, content)
      VALUES (${userId}, ${title}, ${content})
      RETURNING id, title, content, created_at, updated_at
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
}

export async function getNotes(userId: string) {
  try {
    const result = await sql`
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
}

export async function getNote(userId: string, noteId: string) {
  try {
    const result = await sql`
      SELECT id, title, content, created_at, updated_at
      FROM notes
      WHERE user_id = ${userId} AND id = ${noteId}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching note:", error);
    throw error;
  }
}

export async function updateNote(
  userId: string,
  noteId: string,
  title: string,
  content: string
) {
  try {
    const result = await sql`
      UPDATE notes
      SET title = ${title}, content = ${content}, updated_at = NOW()
      WHERE user_id = ${userId} AND id = ${noteId}
      RETURNING id, title, content, created_at, updated_at
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
}

export async function deleteNote(userId: string, noteId: string) {
  try {
    await sql`DELETE FROM notes WHERE user_id = ${userId} AND id = ${noteId}`;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}
