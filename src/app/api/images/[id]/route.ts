import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      SELECT encode(data, 'base64') as base64_data, mime_type
      FROM note_images
      WHERE id = ${parseInt(params.id)}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Image non trouvée" }, { status: 404 });
    }

    const { base64_data, mime_type } = result.rows[0];
    const binaryData = Buffer.from(base64_data, "base64");

    return new Response(binaryData, {
      headers: {
        "Content-Type": mime_type,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Erreur récupération image:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
