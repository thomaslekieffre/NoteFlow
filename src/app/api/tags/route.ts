import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createTag, getUserTags } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, color } = await request.json();
    if (!name || !color) {
      return NextResponse.json(
        { error: "Le nom et la couleur sont requis" },
        { status: 400 }
      );
    }

    const tag = await createTag(userId, name, color);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du tag:", error);
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

    const tags = await getUserTags(userId);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
