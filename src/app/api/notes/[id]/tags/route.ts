import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addTagToNote, removeTagFromNote, getNoteTags } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const tags = await getNoteTags(parseInt(params.id, 10));
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { tagId } = await request.json();

    // Vérifier si le tag existe déjà
    const existingTags = await getNoteTags(parseInt(params.id, 10));
    if (existingTags.some((tag) => tag.id === tagId)) {
      return NextResponse.json(
        { error: "Ce tag est déjà ajouté à la note" },
        { status: 400 }
      );
    }

    await addTagToNote(parseInt(params.id, 10), tagId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
