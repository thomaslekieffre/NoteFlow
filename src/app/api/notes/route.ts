import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createNote, getNotes, getNoteTags } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Le titre et le contenu sont requis" },
        { status: 400 }
      );
    }

    const newNote = await createNote(userId, title, content);

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la note:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const notes = await getNotes(userId);
    const count = notes.length;

    const recentNotesWithTags = await Promise.all(
      notes.slice(0, 3).map(async (note) => {
        const tags = await getNoteTags(note.id);
        return {
          id: note.id,
          title: note.title,
          content: note.content,
          updatedAt: note.updated_at
            ? note.updated_at.toISOString()
            : new Date().toISOString(),
          tags,
        };
      })
    );

    return NextResponse.json(
      { count, recentNotes: recentNotesWithTags },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
