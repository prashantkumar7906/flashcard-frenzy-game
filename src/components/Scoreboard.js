export default function Scoreboard({ players, profiles, lastScorerId }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-4">Scoreboard</h2>
      <ul className="space-y-4">
        {sortedPlayers.map((player) => {
          const profile = profiles[player.userId] || { username: 'Guest' };
          return (
            <li
              key={player.userId}
              className={`flex justify-between items-center p-4 rounded-lg shadow transition-colors duration-500
                ${player.userId === lastScorerId ? 'bg-yellow-500 text-black animate-pulse' : 'bg-gray-700 text-white'}`
              }
            >
              <div className="flex items-center space-x-3">
                <img
                  src={profile.avatar_url || 'https://via.placeholder.com/40'}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-semibold text-lg">{profile.username}</span>
              </div>
              <span className="text-2xl font-bold">{player.score}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}