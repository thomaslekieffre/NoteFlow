import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} from "@/lib/db";

export async function POST(request: NextRequest) {
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

export async function GET(request: NextRequest, context: any) {
  const { id } = context.params;
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const note = await getNote(userId, id);

    if (!note) {
      return NextResponse.json({ error: "Note non trouvée" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Erreur lors de la récupération de la note:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: any) {
  const { id } = context.params;
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

    const updatedNote = await updateNote(userId, id, title, content);

    if (!updatedNote) {
      return NextResponse.json({ error: "Note non trouvée" }, { status: 404 });
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la note:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const { id } = context.params;
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await deleteNote(userId, id);

    return NextResponse.json({ message: "Note supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la note:", error);
    if (error instanceof Error && error.message === "Note non trouvée") {
      return NextResponse.json({ error: "Note non trouvée" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
