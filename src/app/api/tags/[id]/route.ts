import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteTag } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await deleteTag(parseInt(params.id, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur de suppression du tag:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
