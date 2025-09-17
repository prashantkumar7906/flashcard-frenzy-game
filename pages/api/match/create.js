// pages/api/match/create.js
import clientPromise from "../../../lib/mongodb"; // <-- path corrected
import { v4 as uuidv4 } from "uuid";

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const { userId, numCards = 5 } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: "Missing userId in request body" });
    }

    // Fetch flashcards
    const allFlashcards = await db.collection("flashcards").find().toArray();
    if (!allFlashcards || allFlashcards.length === 0) {
      return res.status(500).json({ error: "No flashcards available to create a match" });
    }

    // Shuffle and select cards
    const picked = shuffleArray(allFlashcards).slice(0, Math.min(Number(numCards), allFlashcards.length));

    const cards = picked.map(c => ({
      question: c.question,
      options: Array.isArray(c.options) && c.options.length ? c.options : [c.answer],
      answer: c.answer,
    }));

    // Use UUID string for _id and matchId
    const matchId = uuidv4();

    const matchDoc = {
      _id: matchId,
      matchId,
      hostUserId: userId,
      cards,
      createdAt: new Date(),
      currentCardIndex: 0,
      scores: {},
      players: [userId],
    };

    await db.collection("matches").insertOne(matchDoc);

    return res.status(200).json({ matchId });
  } catch (err) {
    console.error("Error creating match:", err);
    return res.status(500).json({ error: "Failed to create match" });
  }
}
