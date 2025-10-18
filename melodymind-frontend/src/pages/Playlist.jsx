
// import React from "react";
// import { useSong } from "../context/SongContext";

// export default function Playlist() {
//   const { uploadedSongs, currentSong, currentMood, setCurrentSong } = useSong();

//   const recommended =
//     currentSong && currentMood
//       ? uploadedSongs.filter(
//           (song) => song._id !== currentSong._id && song.mood === currentMood
//         )
//       : [];

//   const playSong = (song) => {
//     setCurrentSong(song);
//   };

//   return (
//     <div className="home-root">
//       <h1>🎧 Recommended Playlist</h1>

//       {!currentSong ? (
//         <p>Play songs to recommend</p>
//       ) : recommended.length === 0 ? (
//         <p>No other songs match the mood: {currentMood}</p>
//       ) : (
//         <ul>
//           {recommended.map((song, index) => (
//             <li key={song._id || index}>
//               {song.title} ({song.mood || "Unknown"})
//               <button
//                 onClick={() => playSong(song)}
//                 className="ml-3 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//               >
//                 ▶ Play
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
import React from "react";
import { useSong } from "../context/SongContext";

export default function Playlist() {
  const { uploadedSongs, currentSong, currentMood, setCurrentSong } = useSong();

  // Recommended songs based on currentMood, excluding currently playing song
  const recommended =
    currentSong && currentMood
      ? uploadedSongs.filter(
          (song) => song._id !== currentSong._id && song.mood === currentMood
        )
      : [];

  const playSong = (song) => {
    setCurrentSong(song);
  };

  return (
    <div className="home-root">
      <h1>🎧 Recommended Playlist</h1>

      {!currentSong ? (
        <p>Play a song to see recommendations</p>
      ) : recommended.length === 0 ? (
        <p>No songs match the mood: {currentMood}</p>
      ) : (
        <div className="scroll-container" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <ul className="song-list">
            {recommended.map((song, index) => (
              <li key={song._id || index} className="song-item" style={{ marginBottom: "12px" }}>
                <strong>{song.title}</strong> — {song.artist} ({song.mood || "Unknown"})
                <div>🎶 Genre: {song.genre}</div>
                <audio
                  controls
                  src={`http://localhost:5000${song.url}`}
                  style={{ width: "100%", marginTop: "4px" }}
                />
                {/* <button
                  onClick={() => playSong(song)}
                  style={{
                    marginTop: "4px",
                    padding: "4px 8px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ▶ Play
                </button> */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
