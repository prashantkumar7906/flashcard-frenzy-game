// pages/api/match/score.js
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { matchId, userId, score } = req.body;
    if (!matchId || !userId || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const client = await clientPromise;
    const db = client.db("flashcard_frenzy");

    // Upsert score for user in match
    await db.collection("scores").updateOne(
      { matchId, userId },
      { $set: { score, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error saving score:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
