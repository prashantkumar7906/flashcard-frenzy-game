import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const { matchId } = req.query;
  const db = (await clientPromise).db();

  // Use string ID instead of ObjectId
  const match = await db.collection('matches').findOne({ matchId: matchId });

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  res.status(200).json({ cards: match.cards || [] });
}
