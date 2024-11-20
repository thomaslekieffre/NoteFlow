import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const noteId = formData.get("noteId") as string;

    if (!file || !noteId) {
      return NextResponse.json(
        { error: "Image et noteId requis" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const filename = `${uuidv4()}-${file.name}`;

    // Conversion en base64 pour le stockage
    const base64Data = Buffer.from(buffer).toString("base64");

    const result = await sql`
      INSERT INTO note_images (note_id, user_id, filename, data, mime_type)
      VALUES (
        ${parseInt(noteId)}, 
        ${userId}, 
        ${filename}, 
        decode(${base64Data}, 'base64'), 
        ${file.type}
      )
      RETURNING id;
    `;

    const imageId = result.rows[0].id;
    const imageUrl = `/api/images/${imageId}`;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Erreur upload:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
