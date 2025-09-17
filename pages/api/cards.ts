// pages/api/card.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "./lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { matchId, cardId, answer } = req.body;

    if (!matchId || !cardId || !answer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Incoming request:", { matchId, cardId, answer });

    const client = await clientPromise;
    const db = client.db("flashcardDB"); // 🔹 change if your DB name is different

    let match;
    try {
      match = await db.collection("matches").findOne({ _id: new ObjectId(matchId) });
    } catch (err) {
      console.error("Invalid matchId format:", matchId);
      return res.status(400).json({ error: "Invalid matchId format" });
    }

    if (!match) {
      console.error("Match not found in DB for ID:", matchId);
      return res.status(404).json({ error: "Match not found" });
    }

    console.log("✅ Match found:", match._id.toString());

    // 🔹 Find the card inside match
    const card = match.cards.find((c: any) => c._id.toString() === cardId);
    if (!card) {
      return res.status(404).json({ error: "Card not found in this match" });
    }

    const isCorrect = card.answer.trim().toLowerCase() === answer.trim().toLowerCase();

    // 🔹 Update score if correct
    if (isCorrect) {
      await db.collection("matches").updateOne(
        { _id: new ObjectId(matchId), "cards._id": new ObjectId(cardId) },
        { $inc: { "cards.$.score": 1 } }
      );
    }

    return res.status(200).json({ correct: isCorrect });

  } catch (err) {
    console.error("❌ Error in card.ts:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
