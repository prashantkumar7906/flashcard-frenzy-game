// pages/api/test-mongo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) {
  try {
    const client = await clientPromise;
    const db = client.db('flashcardFrenzy');
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: 'ok' });

    res.status(200).json({ message: 'MongoDB connection successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'MongoDB connection failed' });
  }
}
