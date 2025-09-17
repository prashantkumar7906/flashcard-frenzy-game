// pages/api/match/history.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const matches = await db
    .collection("matches")
    .find({ "players.userId": userId })
    .toArray();

  res.status(200).json({ matches });
}
