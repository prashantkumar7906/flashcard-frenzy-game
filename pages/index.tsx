// pages/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

// Define a type for the user state
type User = {
  id: string;
  email: string | null;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [matchIdInput, setMatchIdInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? null });
        } else {
          router.push('/login');
        }
      } catch (err: unknown) {
        console.error('Error checking session:', err);
        if (err && typeof err === 'object' && 'message' in err) {
          setError((err as { message?: string }).message || 'Failed to verify session');
        } else {
          setError('Failed to verify session');
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // Create a new match
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
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to create match');
      } else {
        setError('Failed to create match');
      }
    } finally {
      setCreatingMatch(false);
    }
  };

  // Join an existing match
  const handleJoinMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedId = matchIdInput.trim();
    if (trimmedId) {
      router.push(`/match/${trimmedId}`);
    } else {
      setError('Please enter a valid match ID.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome, {user?.email}</h1>

      <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-md space-y-6">
        {error && (
          <div className="bg-red-600 p-3 rounded text-white font-bold text-center">
            {error}
          </div>
        )}

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

        <div className="flex flex-col space-y-4">
          <h2 className="text-2xl font-semibold text-center">
            Or Join an Existing Match
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
      </div>
    </div>
  );
}
