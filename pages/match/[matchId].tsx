import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  question: string;
  options: string[];
  answer: string;
}

export default function MatchPage() {
  const router = useRouter();
  const { matchId } = router.query as { matchId: string };

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchCards = async () => {
      try {
        const res = await fetch(`/api/match/cards?matchId=${matchId}`);
        const data = await res.json();
        if (res.ok) {
          setCards(data.cards);
        } else {
          setError(data.error || "Failed to fetch cards");
        }
      } catch {
        setError("Failed to fetch cards");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [matchId]);

  useEffect(() => {
    if (loading || error || cards.length === 0) return;
    if (timeLeft <= 0) {
      router.push("/dashboard");
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, error, cards, router]);

  const handleAnswer = async (opt: string) => {
    if (!cards[currentIndex]) return;

    setSelected(opt);
    const correct = opt === cards[currentIndex].answer;
    if (correct) setScore((prev) => prev + 1);

    try {
      await fetch("/api/match/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, score: correct ? score + 1 : score }),
      });
    } catch (err) {
      console.error("Error saving score:", err);
    }

    setTimeout(() => {
      setSelected(null);
      const nextIndex = currentIndex + 1;
      if (nextIndex < cards.length) {
        setCurrentIndex(nextIndex);
      } else {
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white text-2xl font-bold animate-pulse">
        ⚡ Loading the battlefield...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-red-500 text-2xl font-bold">
        ❌ {error}
      </div>
    );
  }
  if (cards.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white text-2xl">
        📭 No flashcards available.
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-6">
      {/* Top Info Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <div className="px-4 py-2 bg-gray-800 text-yellow-400 rounded-lg border border-yellow-500 font-mono shadow-md">
          Match: {matchId}
        </div>
        <div
          className={`px-4 py-2 rounded-lg font-bold shadow-md ${
            timeLeft <= 10 ? "bg-red-600 animate-pulse" : "bg-green-600"
          }`}
        >
          ⏳ {timeLeft}s
        </div>
        <div className="px-4 py-2 bg-gray-800 rounded-lg shadow-md font-bold text-yellow-300">
          🏆 {score}
        </div>
      </div>

      {/* Flashcard */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl p-10 bg-gray-800 rounded-2xl shadow-xl border border-gray-700"
      >
        <h1 className="text-3xl font-extrabold text-center mb-6 text-indigo-400">
          ⚡ Flashcard Frenzy
        </h1>
        <p className="text-lg text-gray-300 text-center mb-8">
          Question {currentIndex + 1} of {cards.length}
        </p>
        <p className="text-2xl font-bold text-center mb-8">{card?.question}</p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {card?.options?.map((opt, idx) => {
            const isCorrect = opt === card.answer;
            const isSelected = selected === opt;

            let btnClass =
              "p-4 rounded-xl font-bold text-lg shadow-md transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl";
            if (selected) {
              if (isSelected && isCorrect) {
                btnClass += " bg-green-600 text-white";
              } else if (isSelected && !isCorrect) {
                btnClass += " bg-red-600 text-white animate-shake";
              } else if (!isSelected && isCorrect) {
                btnClass += " bg-green-500/70";
              } else {
                btnClass += " bg-gray-700 text-gray-400";
              }
            } else {
              btnClass += " bg-blue-600 hover:bg-blue-700";
            }

            return (
              <button
                key={idx}
                onClick={() => !selected && handleAnswer(opt)}
                className={btnClass}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {currentIndex === cards.length - 1 && selected && (
          <p className="mt-6 text-center text-green-400 font-bold text-lg animate-pulse">
            ✅ Game Over! Redirecting...
          </p>
        )}
      </motion.div>
    </div>
  );
}
