// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function Favorites() {
//   const [favorites, setFavorites] = useState([]);
//   const [songs, setSongs] = useState([]);

//   // Initialize favorites and songs on mount
//   useEffect(() => {
//     const savedFavs = JSON.parse(localStorage.getItem("favorites")) || [];
//     setFavorites(savedFavs);

//     axios
//       .get("http://localhost:5000/api/songs")
//       .then((res) => setSongs(res.data))
//       .catch((err) => console.error("Fetch songs error:", err));
//   }, []);

//   // Listen for changes to localStorage
//   useEffect(() => {
//     const handleStorageChange = () => {
//       const savedFavs = JSON.parse(localStorage.getItem("favorites")) || [];
//       setFavorites(savedFavs);
//     };

//     window.addEventListener("storage", handleStorageChange);

//     // Custom event listener for same-tab updates
//     window.addEventListener("localStorageUpdate", handleStorageChange);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//       window.removeEventListener("localStorageUpdate", handleStorageChange);
//     };
//   }, []);

//   // Filter favorite songs
//   const favoriteSongs = songs.filter((s) => favorites.includes(s.songId));

//   return (
//     <div className="favorites-content">
//       <h2>❤ Your Favorites</h2>
//       {favoriteSongs.length > 0 ? (
//         <ul className="song-list">
//           {favoriteSongs.map((song) => (
//             <li key={song.songId} className="song-item">
//               <h4>{song.title}</h4>
//               <p>
//                 {song.artist} | {song.genre} | Mood: {song.mood}
//                 {song.tempo ? ` [~${Math.round(song.tempo)} BPM]` : ""}
//               </p>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No favorite songs yet.</p>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaHeart,
} from "react-icons/fa";

const API_BASE = "https://melody-mind-5wqf.onrender.com";

export default function Favorites({ currentUserId }) {
  const [favorites, setFavorites] = useState([]);
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());

  // Load all songs and favorites
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavs);

    axios
      .get(`${API_BASE}/api/songs`)
      .then((res) => setSongs(res.data || []))
      .catch((err) => console.error("Fetch songs error:", err));
  }, []);

  // Listen for favorites updates from Home.jsx
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      const savedFavs = JSON.parse(localStorage.getItem("favorites")) || [];
      setFavorites(savedFavs);
    };
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () =>
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
  }, []);

  // Audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  // Filter favorites: only uploaded by current user & has a valid URL
  const favoriteSongs = songs.filter(
    (s) => favorites.includes(s.songId) && s.uploadedBy === currentUserId && s.url
  );

  // Play a selected song
  const logAndPlaySong = async (index) => {
    try {
      const song = favoriteSongs[index];
      if (!song?.url) return alert("This song cannot be played");

      audioRef.current.pause();
      audioRef.current.src = `${API_BASE}${song.url}`;
      await audioRef.current.play();

      setIsPlaying(true);
      setCurrentSongIndex(index);
    } catch (err) {
      console.error("Play song error:", err);
    }
  };

  // Play/pause toggle
  const playPause = () => {
    if (!audioRef.current.src) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Play error:", err));
    }
  };

  // Next/Previous
  const nextSong = () => {
    if (currentSongIndex < favoriteSongs.length - 1)
      logAndPlaySong(currentSongIndex + 1);
  };
  const previousSong = () => {
    if (currentSongIndex > 0) logAndPlaySong(currentSongIndex - 1);
  };

  // Toggle favorite
  const toggleFavorite = (songId) => {
    const updated = favorites.includes(songId)
      ? favorites.filter((id) => id !== songId)
      : [...favorites, songId];

    localStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites(updated);

    // Dispatch event for other components
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  return (
    <div className="favorites-content">
      <h2>❤ Your Favorites</h2>

      {favoriteSongs.length > 0 ? (
        <ul className="song-list">
          {favoriteSongs.map((song, index) => (
            <li key={song.songId} className="song-item">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div>
                  <h4>{song.title}</h4>
                  <p>
                    {song.artist} | {song.genre} | Mood: {song.mood}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => logAndPlaySong(index)}>
                    {isPlaying && currentSongIndex === index ? <FaPause /> : <FaPlay />}
                  </button>
                  <FaHeart
                    style={{
                      cursor: "pointer",
                      color: favorites.includes(song.songId) ? "red" : "gray",
                    }}
                    onClick={() => toggleFavorite(song.songId)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No favorite songs yet.</p>
      )}

      {/* Player */}
      {currentSongIndex !== null && favoriteSongs[currentSongIndex] && (
        <div className="playerbar">
          <div className="playerbar-info">
            <h4>{favoriteSongs[currentSongIndex].title}</h4>
            <p>{favoriteSongs[currentSongIndex].artist}</p>
          </div>

          <div className="progress-container">
            <div
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                audioRef.current.currentTime = e.target.value;
                setCurrentTime(e.target.value);
              }}
            />
          </div>

          <div className="playerbar-controls">
            <button onClick={previousSong}>
              <FaStepBackward />
            </button>
            <button onClick={playPause}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={nextSong}>
              <FaStepForward />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
