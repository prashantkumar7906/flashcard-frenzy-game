import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get top 10 scores across all matches
    const leaderboard = await db
      .collection('matchScores')
      .find({})
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    res.status(200).json(
      leaderboard.map((item) => ({
        email: item.email,
        score: item.score,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
  
}
