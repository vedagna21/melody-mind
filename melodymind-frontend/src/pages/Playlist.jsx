
// import React from "react";
// import { useSong } from "../context/SongContext";

// export default function Playlist() {
//   const { uploadedSongs, currentSong, currentMood, setCurrentSong } = useSong();

//   // Recommended songs based on currentMood, excluding currently playing song
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
//         <p>Play a song to see recommendations</p>
//       ) : recommended.length === 0 ? (
//         <p>No songs match the mood: {currentMood}</p>
//       ) : (
//         <div className="scroll-container" style={{ maxHeight: "70vh", overflowY: "auto" }}>
//           <ul className="song-list">
//             {recommended.map((song, index) => (
//               <li key={song._id || index} className="song-item" style={{ marginBottom: "12px" }}>
//                 <strong>{song.title}</strong> — {song.artist} ({song.mood || "Unknown"})
//                 <div>🎶 Genre: {song.genre}</div>
//                 <audio
//                   controls
//                   src={`https://melody-mind-5wqf.onrender.com${song.url}`}
//                   style={{ width: "100%", marginTop: "4px" }}
//                 />
//                 {/* <button
//                   onClick={() => playSong(song)}
//                   style={{
//                     marginTop: "4px",
//                     padding: "4px 8px",
//                     backgroundColor: "#3b82f6",
//                     color: "white",
//                     borderRadius: "4px",
//                     cursor: "pointer",
//                   }}
//                 >
//                   ▶ Play
//                 </button> */}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }
import React from "react";
import { useSong } from "../context/SongContext.jsx";

const API_BASE = "https://melody-mind-5wqf.onrender.com";

export default function Playlist() {
  const { uploadedSongs, currentSong, currentMood, setCurrentSong } = useSong();

  // Recommended songs based on currentMood, excluding currently playing song
  const recommended =
    currentSong && currentMood
      ? uploadedSongs.filter(
          (song) => song.songId !== currentSong.songId && song.mood === currentMood
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
              <li
                key={song.songId || index}
                className="song-item"
                style={{ marginBottom: "12px" }}
              >
                <strong>{song.title}</strong> — {song.artist} ({song.mood || "Unknown"})
                <div>🎶 Genre: {song.genre || "Unknown"}</div>
                <audio
                  controls
                  src={`${API_BASE}${song.url}`}
                  style={{ width: "100%", marginTop: "4px" }}
                />
                {/* Optional play button */}
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
