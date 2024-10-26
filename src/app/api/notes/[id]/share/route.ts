import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createShareLink } from "@/lib/db";

export async function POST(request: NextRequest, context: any) {
  const { id } = context.params;
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const shareId = await createShareLink(userId, id);

    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Erreur lors de la création du lien de partage:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
