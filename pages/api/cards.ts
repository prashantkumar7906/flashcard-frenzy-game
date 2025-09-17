// pages/api/cards.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export type Card = {
  question: string;
  answer: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Card[] | { error: string }>
) {
  try {
    const client = await clientPromise;
    const db = client.db('flashcardFrenzy');
    const cards = await db.collection<Card>('cards').find({}).toArray();
    res.status(200).json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
}
