import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { matchId, userId } = req.body;
  if (!matchId || !userId) {
    return res.status(400).json({ error: 'Match ID and User ID are required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('flashcard-frenzy');
    const matchesCollection = db.collection('matches');

    const match = await matchesCollection.findOne({ _id: matchId });
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if player is already in the match
    const isPlayerInMatch = match.players.some(p => p.userId === userId);
    if (isPlayerInMatch) {
      return res.status(200).json({ message: 'Player already in match' });
    }

    // Add new player to the match
    await matchesCollection.updateOne(
      { _id: matchId },
      { $push: { players: { userId, score: 0 } } }
    );

    // Broadcast the update via Supabase (if needed)
    // Supabase real-time is already watching the 'matches' table, so an update here will trigger it

    res.status(200).json({ message: 'Player joined successfully' });
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}