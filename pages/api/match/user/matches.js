import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('flashcard-frenzy');
    const matchesCollection = db.collection('matches');

    const userMatches = await matchesCollection.find({ 'players.userId': userId, state: 'completed' }).sort({ createdAt: -1 }).toArray();

    res.status(200).json(userMatches);
  } catch (error) {
    console.error('Error fetching user matches:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}