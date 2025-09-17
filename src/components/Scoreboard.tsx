// src/components/Scoreboard.js
import Image from 'next/image';
import React from 'react';

export default function Scoreboard({ scores }: { scores: { name: string; score: number }[] }) {
  return (
    <div>
      <h2>Scoreboard</h2>
      <ul>
        {scores.map((player, index) => (
          <li key={index}>
            <Image src="/trophy.png" alt="Trophy" width={24} height={24} />
            {player.name}: {player.score}
          </li>
        ))}
      </ul>
    </div>
  );
}
