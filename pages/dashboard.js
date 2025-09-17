import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [matchIdInput, setMatchIdInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [error, setError] = useState('');
  const [scores, setScores] = useState([]);
  const router = useRouter();

  // Get user session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Failed to verify session. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // Fetch leaderboard
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('/api/match/leaderboard');
        const data = await res.json();
        if (Array.isArray(data)) setScores(data);
        else setScores([]);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
    fetchScores();
  }, []);

  const handleCreateMatch = async () => {
    if (!user || creatingMatch) return;
    setCreatingMatch(true);
    setError('');
    try {
      const response = await fetch('/api/match/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      if (response.ok && data.matchId) {
        router.push(`/match/${data.matchId}`);
      } else {
        throw new Error(data.error || 'Failed to create match');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCreatingMatch(false);
    }
  };

  const handleJoinMatch = (e) => {
    e.preventDefault();
    const trimmedId = matchIdInput.trim();
    if (trimmedId) {
      router.push(`/match/${trimmedId}`);
    } else {
      setError('Please enter a valid match ID.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white text-2xl font-bold animate-pulse">
        ⚡ Loading your arena...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-400 drop-shadow-md">
            Welcome, {user?.email}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors font-bold"
          >
            Log Out
          </button>
        </div>

        {error && (
          <div className="bg-red-600 p-3 rounded mb-6 text-center font-bold">
            {error}
          </div>
        )}

        {/* Create Match */}
        <div className="mb-6">
          <button
            onClick={handleCreateMatch}
            disabled={creatingMatch}
            className={`w-full p-4 text-xl font-bold rounded-lg transition-colors ${
              creatingMatch
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {creatingMatch ? 'Creating...' : 'Create New Match'}
          </button>
        </div>

        {/* Join Match */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-2 text-yellow-300">
            Join Existing Match
          </h2>
          <form onSubmit={handleJoinMatch} className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter Match ID"
              value={matchIdInput}
              onChange={(e) => setMatchIdInput(e.target.value)}
              className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-bold"
            >
              Join
            </button>
          </form>
        </div>

        {/* Leaderboard */}
        <div className="w-full bg-gray-800 p-6 rounded-2xl shadow-xl mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">
            Leaderboard
          </h2>
          {scores.length === 0 ? (
            <p className="text-center text-gray-400">No scores yet.</p>
          ) : (
            <ul className="space-y-2">
              {scores.map((s, idx) => (
                <li
                  key={idx}
                  className={`flex justify-between p-3 rounded-lg ${
                    s.userId === user?.id
                      ? 'bg-yellow-600 text-black font-bold'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <span>{s.email}</span>
                  <span>{s.score}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
