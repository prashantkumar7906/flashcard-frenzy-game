import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collections = await db.listCollections().toArray();

    res.status(200).json({
      success: true,
      db: db.databaseName,
      collections: collections.map((c) => c.name),
    });
  } catch (error: any) {
    console.error("❌ API MongoDB error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
