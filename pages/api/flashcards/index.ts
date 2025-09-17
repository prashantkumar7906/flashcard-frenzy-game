// pages/api/flashcards/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get 10 random flashcards
    const flashcards = await db
      .collection("flashcards")
      .aggregate([{ $sample: { size: 10 } }])
      .toArray();

    res.status(200).json(flashcards);
  } catch (error) {
    console.error("Failed to fetch flashcards:", error);
    res.status(500).json({ error: "Failed to fetch flashcards" });
  }
}
