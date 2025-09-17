import { useState, useEffect } from 'react';

export default function Flashcard({ question, onAnswer }) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Trigger a flip animation whenever the question changes
    setIsFlipped(true);
    const timer = setTimeout(() => {
      setIsFlipped(false);
    }, 500); // Duration of the flip animation
    return () => clearTimeout(timer);
  }, [question]);

  if (!question) {
    return <div>No question available.</div>;
  }

  return (
    <div className={`relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
      <div className="w-full h-full bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onAnswer(choice)}
              className="p-4 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}