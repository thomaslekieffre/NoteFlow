import { Operation } from "@/types/editor";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";
import { Note, Tag } from "@/types";

interface SqlResult {
  rowCount: number | null;
  rows: any[];
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
  try {
    console.log("getNote appelé avec:", { userId, noteId });

    interface NoteResult {
      id: number;
      title: string;
      content: string;
      created_at: Date;
      updated_at: Date;
      user_id: string;
    }

    const note = await sql<NoteResult>`
      SELECT DISTINCT n.id, n.title, n.content, n.created_at, n.updated_at, n.user_id
      FROM notes n
      LEFT JOIN note_collaborations nc ON n.id = nc.note_id
      WHERE n.id = ${parseInt(noteId, 10)}
      AND (
        n.user_id = ${userId}
        OR nc.collaborator_id = ${userId}
      )
      LIMIT 1
    `;

    console.log("Résultat de la requête SQL:", note.rows[0]);

    if (!note.rows[0]) return null;

    const noteData: Note = {
      id: note.rows[0].id,
      title: note.rows[0].title,
      content: note.rows[0].content,
      created_at: note.rows[0].created_at,
      updated_at: note.rows[0].updated_at,
    };

    return noteData;
  } catch (error) {
    console.error("Erreur dans getNote:", error);
    throw error;
  }
}

export async function updateNote(
  userId: string,
  noteId: string,
  title: string,
  content: string
): Promise<Note | null> {
  const canEdit = await sql`
    SELECT 1 
    FROM notes n
    LEFT JOIN note_collaborations nc ON n.id = nc.note_id
    WHERE (n.user_id = ${userId} OR nc.collaborator_id = ${userId})
    AND n.id = ${parseInt(noteId, 10)}
  `;

  if (canEdit.rows.length === 0) {
    throw new Error("Non autorisé");
  }

  const result = await sql<Note>`
    UPDATE notes
    SET title = ${title}, content = ${content}, updated_at = NOW()
    WHERE id = ${noteId}
    RETURNING id, title, content, created_at, updated_at
  `;

  return result.rows[0] || null;
}

export async function deleteNote(
  userId: string,
  noteId: string
): Promise<boolean> {
  const result: SqlResult = await sql`
    DELETE FROM notes
    WHERE id = ${noteId} AND user_id = ${userId}
    RETURNING id
  `;

  return result && (result.rowCount ?? 0) > 0;
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

export async function generateCollaborationCode(): Promise<string> {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code: string;

  do {
    code = Array.from({ length: 6 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");

    const existing = await sql`
      SELECT collaboration_code
      FROM note_collaborations
      WHERE collaboration_code = ${code}
    `;

    if (existing.rows.length === 0) break;
  } while (true);

  return code;
}

export async function createCollaboration(
  userId: string,
  noteId: string
): Promise<string> {
  const code = await generateCollaborationCode();

  await sql`
    INSERT INTO note_collaborations (
      note_id,
      owner_id,
      collaboration_code,
      expires_at
    )
    VALUES (
      ${noteId},
      ${userId},
      ${code},
      NOW() + INTERVAL '24 hours'
    )
  `;

  return code;
}

export async function joinCollaboration(
  userId: string,
  code: string
): Promise<{ noteId: string } | null> {
  interface CollabResult {
    noteid: string;
  }

  const result = await sql<CollabResult>`
    UPDATE note_collaborations
    SET collaborator_id = ${userId}
    WHERE collaboration_code = ${code}
    AND expires_at > NOW()
    AND collaborator_id IS NULL
    RETURNING note_id::text as noteid
  `;

  if (result.rows.length === 0) {
    return null;
  }

  await addCollaborator(result.rows[0].noteid, userId);
  return { noteId: result.rows[0].noteid };
}

export async function addCollaborator(
  noteId: string,
  userId: string
): Promise<void> {
  await sql`
    INSERT INTO note_collaborators (note_id, user_id)
    VALUES (${noteId}, ${userId})
    ON CONFLICT (note_id, user_id)
    DO UPDATE SET is_active = true
  `;
}

export async function getActiveCollaborators(
  noteId: string
): Promise<Array<{ userId: string; joinedAt: Date }>> {
  const result = await sql`
    SELECT user_id, joined_at
    FROM note_collaborators
    WHERE note_id = ${noteId}
    AND is_active = true
  `;
  return result.rows.map((row) => ({
    userId: row.user_id,
    joinedAt: row.joined_at,
  }));
}

export async function updateCollaboratorStatus(
  noteId: string,
  userId: string,
  isActive: boolean
): Promise<void> {
  await sql`
    UPDATE note_collaborators
    SET is_active = ${isActive}
    WHERE note_id = ${noteId} AND user_id = ${userId}
  `;
}

export async function saveOperation(
  noteId: string,
  userId: string,
  operation: Operation,
  version: number
): Promise<void> {
  await sql`
    INSERT INTO note_operations (
      note_id,
      user_id,
      operation_type,
      position,
      content,
      timestamp,
      version
    )
    VALUES (
      ${noteId},
      ${userId},
      ${operation.type},
      ${operation.position},
      ${operation.text},
      ${operation.timestamp},
      ${version}
    )
  `;
}

export async function getOperationHistory(
  noteId: string,
  fromVersion?: number
): Promise<Operation[]> {
  const query = fromVersion
    ? sql`
      SELECT * FROM note_operations
      WHERE note_id = ${noteId}
      AND version > ${fromVersion}
      ORDER BY version ASC
    `
    : sql`
      SELECT * FROM note_operations
      WHERE note_id = ${noteId}
      ORDER BY version ASC
    `;

  const result = await query;

  return result.rows.map((row) => ({
    type: row.operation_type as "insert" | "delete" | "replace",
    position: row.position,
    text: row.content,
    userId: row.user_id,
    timestamp: row.timestamp,
  }));
}

export async function createTag(
  userId: string,
  name: string,
  color: string
): Promise<Tag> {
  const result = await sql<Tag>`
    INSERT INTO tags (user_id, name, color)
    VALUES (${userId}, ${name}, ${color})
    RETURNING id, name, color
  `;
  return result.rows[0];
}

export async function getUserTags(userId: string): Promise<Tag[]> {
  const result = await sql<Tag>`
    SELECT id, name, color
    FROM tags
    WHERE user_id = ${userId}
    ORDER BY name ASC
  `;
  return result.rows;
}

export async function addTagsToNote(
  noteId: number,
  tagIds: number[]
): Promise<void> {
  const tagIdsString = tagIds.join(",");

  await sql`
    INSERT INTO note_tags (note_id, tag_id)
    SELECT ${noteId}, unnest(string_to_array(${tagIdsString}, ',')::int[])
    ON CONFLICT DO NOTHING
  `;
}

export async function getNotesTags(noteId: number): Promise<Tag[]> {
  const result = await sql<Tag>`
    SELECT t.id, t.name, t.color
    FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ${noteId}
  `;
  return result.rows.map((tag) => ({
    ...tag,
    id: tag.id.toString(),
  }));
}

export async function addTagToNote(
  noteId: number,
  tagId: number
): Promise<void> {
  await sql`
    INSERT INTO note_tags (note_id, tag_id)
    VALUES (${noteId}, ${tagId})
    ON CONFLICT DO NOTHING
  `;
}

export async function removeTagFromNote(
  noteId: number,
  tagId: number
): Promise<void> {
  await sql`
    DELETE FROM note_tags
    WHERE note_id = ${noteId} AND tag_id = ${tagId}
  `;
}

export async function getNoteTags(noteId: number): Promise<Tag[]> {
  const result = await sql<Tag>`
    SELECT t.id, t.name, t.color
    FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ${noteId}
  `;
  return result.rows.map((tag) => ({
    ...tag,
    id: tag.id.toString(),
  }));
}

export async function deleteTag(tagId: number) {
  await sql`
    DELETE FROM note_tags 
    WHERE tag_id = ${tagId}
  `;

  await sql`
    DELETE FROM tags 
    WHERE id = ${tagId}
  `;

  return true;
}

export async function cleanupOrphanedImages() {
  try {
    await sql`
      DELETE FROM note_images
      WHERE note_id NOT IN (
        SELECT id FROM notes
      )
    `;
  } catch (error) {
    console.error("Erreur nettoyage images:", error);
    throw error;
  }
}

export { sql };
