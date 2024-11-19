import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await sql`
            DELETE FROM note_collaborations
            WHERE expires_at < NOW();
        `;
    res.status(200).json({ deletedCount: result.rowCount });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des collaborations expirées:",
      error
    );
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
