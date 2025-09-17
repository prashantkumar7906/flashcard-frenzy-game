import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { supabase } from '../../../lib/supabaseClient';

// Helper function to advance the question
const advanceToNextQuestion = async (matchId, matchesCollection) => {
  const match = await matchesCollection.findOne({ _id: matchId });
  if (!match) return;

  const nextQuestionIndex = match.currentQuestionIndex + 1;
  const isMatchOver = nextQuestionIndex >= match.questionsAsked.length;

  const updateData = {
    $set: {
      currentQuestionIndex: nextQuestionIndex,
      state: isMatchOver ? 'completed' : 'in_progress',
      questionStartTime: isMatchOver ? null : new Date(), // Reset timer for the next question
    },
  };

  await matchesCollection.updateOne({ _id: matchId }, updateData);

  // Broadcast the update via Supabase
  await supabase.from('matches').update({
    currentQuestionIndex: updateData.$set.currentQuestionIndex,
    state: updateData.$set.state,
  }).eq('id', matchId);
};

export default async function handler(req, res) {
  const { matchId } = req.query;
  const client = await clientPromise;
  const db = client.db('flashcard-frenzy');
  const matchesCollection = db.collection('matches');

  // Handle player answer submission (POST)
  if (req.method === 'POST') {
    const { userId, answer, questionId } = req.body;
    try {
      const match = await matchesCollection.findOne({ _id: matchId });
      if (!match) return res.status(404).json({ error: 'Match not found' });

      // **TIMER VALIDATION**
      const timeElapsed = (new Date() - new Date(match.questionStartTime)) / 1000;
      const timeLimit = 20; // 20-second limit per question
      if (timeElapsed > timeLimit) {
        await advanceToNextQuestion(matchId, matchesCollection);
        return res.status(200).json({ success: false, message: 'Time is up!' });
      }

      // Existing logic to check if point is already claimed and answer is correct
      const isPointClaimed = match.answersGiven.some(ans => ans.questionId === questionId);
      if (isPointClaimed) {
        return res.status(200).json({ success: false, message: 'Point already claimed.' });
      }

      const flashcard = await db.collection('flashcards').findOne({ _id: new ObjectId(questionId) });
      const isCorrect = flashcard?.correctAnswer === answer;

      if (isCorrect) {
        const playerIndex = match.players.findIndex(p => p.userId === userId);
        if (playerIndex === -1) {
          return res.status(400).json({ error: 'Player not in match.' });
        }
        
        const newPlayersArray = [...match.players];
        newPlayersArray[playerIndex].score += 1;
        
        await matchesCollection.findOneAndUpdate(
            { _id: matchId },
            {
                $set: {
                    players: newPlayersArray,
                },
                $push: {
                    answersGiven: { questionId, userId, answer, timestamp: new Date() }
                }
            }
        );

        // Advance the question after a correct answer
        await advanceToNextQuestion(matchId, matchesCollection);
        return res.status(200).json({ success: true, isCorrect: true });
      }

      return res.status(200).json({ success: false, isCorrect: isCorrect });

    } catch (error) {
      console.error('Match update error:', error);
      res.status(500).json({ error: 'Failed to update match' });
    }
  }

  // Handle getting current match state (GET) - No changes needed here
  if (req.method === 'GET') {
    try {
      const match = await matchesCollection.findOne({ _id: matchId });
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      res.status(200).json(match);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch match data' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}