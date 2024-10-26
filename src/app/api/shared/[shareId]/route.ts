import { NextRequest, NextResponse } from "next/server";
import { getSharedNote } from "@/lib/db";

export async function GET(request: NextRequest, context: any) {
  const { shareId } = context.params;
  try {
    const note = await getSharedNote(shareId);

    if (!note) {
      return NextResponse.json({ error: "Note non trouvée" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Erreur lors de la récupération de la note partagée:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
