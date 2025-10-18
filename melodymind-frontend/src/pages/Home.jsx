

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaEllipsisH,
  FaHeart,
  FaRandom,
  FaRedo,
  FaSearch,
  FaMicrophoneAlt,
  FaTheaterMasks,
} from "react-icons/fa";
import { useSong } from "../context/SongContext.jsx";
import Playlist from "./Playlist";

export default function Home({ user }) {
  const nav = useNavigate();
  const {
    uploadedSongs,
    setUploadedSongs,
    setCurrentSong,
    setCurrentMood,
  } = useSong();

  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [repeatMode, setRepeatMode] = useState("none");
  const [queue, setQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState([]);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [showUploadPopup, setShowUploadPopup] = useState(false);
const [uploading, setUploading] = useState(false);




  // ---------- Load Songs ----------
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/songs")
      .then((res) => {
        setSongs(res.data);
        setUploadedSongs(res.data); // update global context
      })
      .catch((err) => console.error("Fetch songs error:", err));
  }, [setUploadedSongs]);
  
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const updateProgress = () => {
    const progressBar = document.querySelector(".progress-fill");
    if (progressBar && audio.duration) {
      progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    }
  };

  audio.addEventListener("timeupdate", updateProgress);

  return () => {
    audio.removeEventListener("timeupdate", updateProgress);
  };
}, [audioRef]);
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const onTimeUpdate = () => setCurrentTime(audio.currentTime);
  const onLoadedMetadata = () => setDuration(audio.duration);

  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.addEventListener("loadedmetadata", onLoadedMetadata);

  return () => {
    audio.removeEventListener("timeupdate", onTimeUpdate);
    audio.removeEventListener("loadedmetadata", onLoadedMetadata);
  };
}, [audioRef]);


  // ---------- Play Song ----------
  const logAndPlaySong = async (index) => {
    try {
      const song = songs[index];
      if (!song?.url) return alert("No URL found for this song");
      audioRef.current.src = `http://localhost:5000${song.url}`;
      await audioRef.current.play();
      setIsPlaying(true);
      setCurrentSongIndex(index);

      // Update global context
      setCurrentSong(song);
      setCurrentMood(song.mood);

      // Log played song
      const logRes = await axios.post("http://localhost:5000/api/log-song", {
        userId: user?.id,
        songId: song.songId,
      });
      if (logRes.data) setHistory((prev) => [song, ...prev]);
    } catch (err) {
      console.error("Play song error:", err);
    }
  };

  // ---------- Play / Pause ----------
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

  // ---------- Next / Previous ----------
  const nextSong = () => {
    let nextIndex;
    if (repeatMode === "one" && currentSongIndex !== null) {
      nextIndex = currentSongIndex;
    } else if (queue.length > 0) {
      nextIndex = queue[0];
      setQueue((prev) => prev.slice(1));
    } else if (currentSongIndex < songs.length - 1) {
      nextIndex = currentSongIndex + 1;
    } else if (repeatMode === "all") {
      nextIndex = 0;
    } else {
      alert("No next song available");
      return;
    }
    logAndPlaySong(nextIndex);
  };

  const previousSong = () => {
    if (currentSongIndex > 0) {
      logAndPlaySong(currentSongIndex - 1);
    } else alert("No previous song available");
  };

  // ---------- Song Removal ----------
  const removeSong = async (songId) => {
    if (!window.confirm("Are you sure you want to remove this song?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/delete-song/${songId}`);
      setSongs((prev) => prev.filter((s) => s.songId !== songId));
      setUploadedSongs((prev) => prev.filter((s) => s.songId !== songId)); // update global
      if (songs[currentSongIndex]?.songId === songId) {
        audioRef.current.pause();
        setCurrentSongIndex(null);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Delete song error:", err);
      alert("❌ Failed to remove song");
    }
  };

  // ---------- Favorites, Queue, Shuffle ----------
  const toggleFavorite = (songId) => {
    setFavorites((prev) => {
      const updated = prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId];
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const addToQueue = (songId) => {
    const index = songs.findIndex((song) => song.songId === songId);
    if (index !== -1 && !queue.includes(index)) {
      setQueue((prev) => [...prev, index]);
    }
  };

  const shuffleSongs = () => {
    const shuffled = [...Array(songs.length).keys()].sort(
      () => Math.random() - 0.5
    );
    setSongs((prev) => shuffled.map((i) => prev[i]));
    setUploadedSongs((prev) => shuffled.map((i) => prev[i])); // sync global
    if (currentSongIndex !== null)
      setCurrentSongIndex(shuffled.indexOf(currentSongIndex));
  };

  // ---------- Speech Recognition ----------
  const createRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => console.error("SpeechRecognition error:", e);

    recognition.onresult = (event) => {
      const raw = event.results[0][0].transcript.trim().toLowerCase();
      console.log("🎤 Command:", raw);

      if (raw.includes("next")) return nextSong();
      if (raw.includes("previous") || raw.includes("back")) return previousSong();
      if (raw.includes("pause")) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
      if (raw.includes("stop")) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      }
      if (raw.includes("shuffle")) return shuffleSongs();
      if (raw.includes("logout")) return nav("/login");
      if (raw.includes("upload")) {
        document.querySelector('input[type="file"]').click();
        return;
      }

      // Play command
      if (raw.startsWith("play")) {
        const query = raw.replace(/^play\s+/, "").trim();
        if (!query) {
          audioRef.current.play();
          setIsPlaying(true);
          return;
        }
        const words = query.split(/\s+/);
        const idx = songs.findIndex((s) => {
          const haystack = `${s.title} ${s.artist}`.toLowerCase();
          return words.every((w) => haystack.includes(w));
        });
        if (idx !== -1) return logAndPlaySong(idx);
        alert(`❌ No results for "${query}"`);
      }
    };

    return recognition;
  };

  const startListening = () => {
    if (!recognitionRef.current) recognitionRef.current = createRecognition();
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Recognition start error:", e);
    }
  };

  // ---------- Upload ----------
 const handleUpload = async (e) => {
  const formData = new FormData();
  for (let file of e.target.files) formData.append("songs", file);

  try {
    setUploading(true); // start loading

    const res = await axios.post("http://localhost:5000/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setSongs((prev) => [...res.data, ...prev]);
    setUploadedSongs((prev) => [...res.data, ...prev]); // sync global

    // Show popup
    setShowUploadPopup(true);
    setTimeout(() => setShowUploadPopup(false), 3000);
  } catch (err) {
    console.error("Upload error:", err);
    alert("❌ Upload failed");
  } finally {
    setUploading(false); // stop loading
  }
};



  // ---------- Render ----------
  return (
    <div className="home-root">
      <div className="home-content">
      <div className="home-top">
        <div className="home-title">
          <h1>Welcome to MelodyMind, {user?.name || "Guest"}</h1>
          <p className="muted">Upload your music and play instantly!</p>
        </div>

        <div className="home-actions">
          <label htmlFor="file-upload" className="upload-btn">📁 Upload Music</label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".mp3,.wav"
            onChange={handleUpload}
            style={{display:'none'}}
          />
          <button
            className={`action-btn ${listening ? "listening" : ""}`}
            onClick={startListening}
          >
            <span className="icon-badge"><FaMicrophoneAlt /></span>
            <span>{listening ? "Listening..." : "Voice Command"}</span>
          </button>
          <button className="action-btn" onClick={() => nav("/mood")}>
            <span className="icon-badge"><FaTheaterMasks /></span>
            <span>Mood Detection</span>
          </button>
         
        </div>
      </div>
      {/* Upload Popup */}
{/* Upload Popup */}
{showUploadPopup && (
  <div
    style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "#4caf50",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      zIndex: 1000,
    }}
  >
    🎵 Song uploaded successfully!
  </div>
)}
{/* Loading Spinner */}
{uploading && (
  <div
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1000,
      background: "rgba(0,0,0,0.6)",
      padding: "20px",
      borderRadius: "50%",
    }}
  >
    <div className="spinner" />
  </div>
)}



      {/* SONG LIST */}
      <div className="card">
        <div className="songs-header">
          <h3>Uploaded Songs</h3>
          <div className="global-controls">
            <label className="search-pill" aria-label="Search songs">
              <FaSearch className="icon" />
              <input
                className="search-input"
                type="text"
                placeholder="Search title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            <button
              className="control-pill"
              onClick={shuffleSongs}
              title="Shuffle"
              aria-label="Shuffle"
              type="button"
            >
              <FaRandom className="icon" />
              <span>Shuffle</span>
            </button>
            <button
              className={`control-pill ${repeatMode === "all" ? "active" : ""}`}
              onClick={() => setRepeatMode(repeatMode === "all" ? "none" : "all")}
              title="Repeat All"
              aria-pressed={repeatMode === "all"}
              aria-label="Repeat All"
              type="button"
            >
              <FaRedo className="icon" />
              <span>Repeat All</span>
            </button>
          </div>
        </div>

        <ul className="song-list">
          {songs
            .filter((s) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              const hay = `${s.title || ""} ${s.artist || ""}`.toLowerCase();
              return hay.includes(q);
            })
            .map((song, index) => (
            <li key={song.songId || index} className="song-item">
              <div className="song-left">
                <button className="play-btn" onClick={() => logAndPlaySong(index)}>
                  {isPlaying && currentSongIndex === index ? <FaPause /> : <FaPlay />}
                </button>
                <div className="song-info">
                  <h4>{song.title} ({song.artist})</h4>
                  <p>
                    🎵 Mood: {song.mood} | Genre: {song.genre}{" "}
                    {song.tempo ? `[~${Math.round(song.tempo)} BPM]` : ""}
                  </p>
                </div>
              </div>
              <div className="song-right">
                <FaHeart
                  className={`heart-icon ${favorites.includes(song.songId) ? "favorited" : ""}`}
                  onClick={() => toggleFavorite(song.songId)}
                />
                <div
                  className="three-dot"
                  onClick={() => setMenuOpen(menuOpen === index ? null : index)}
                >
                  <FaEllipsisH />
                  {menuOpen === index && (
                    <div className="dropdown-menu">
                      <button onClick={() => removeSong(song.songId)}>🗑 Remove Song</button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

    
{currentSongIndex !== null && (
  <div className="playerbar">
    {/* Song Info */}
    <div className="playerbar-info">
      <h4>{songs[currentSongIndex].title}</h4>
      <p>{songs[currentSongIndex].artist}</p>
    </div>

    {/* Progress Bar */}
    <div className="progress-container">
      <div
        className="progress-fill"
        style={{
          width: `${(currentTime / duration) * 100 || 0}%`,
        }}
      ></div>

      <input
        type="range"
        className="progress-bar"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={(e) => {
          audioRef.current.currentTime = e.target.value;
          setCurrentTime(e.target.value);
        }}
      />

      <div
        className="progress-knob"
        style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
      ></div>
    </div>

    {/* Time Info */}
    <div className="time-info">
      <span>
        {new Date(currentTime * 1000).toISOString().substring(14, 19)}
      </span>
      <span>
        {duration
          ? `-${new Date((duration - currentTime) * 1000)
              .toISOString()
              .substring(14, 19)}`
          : "-00:00"}
      </span>
    </div>

    {/* Controls */}
    <div className="playerbar-controls">
      <button onClick={previousSong} className="playerbar-btn">
        <FaStepBackward />
      </button>
      <button onClick={playPause} className="playerbar-btn">
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <button onClick={nextSong} className="playerbar-btn">
        <FaStepForward />
      </button>
    </div>
  </div>
)}



      
      </div>
    </div>
  );
}


// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   FaPlay,
//   FaPause,
//   FaStepBackward,
//   FaStepForward,
//   FaEllipsisH,
//   FaHeart,
//   FaRandom,
//   FaRedo,
//   FaRedoAlt,
// } from "react-icons/fa";
// import { SongContext } from "../context/SongContext";
// import Playlist from "./Playlist";

// export default function Home({ user }) {
//   const nav = useNavigate();

//   const [songs, setSongs] = useState([]);
//   const [currentSongIndex, setCurrentSongIndex] = useState(null);3
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [listening, setListening] = useState(false);
//   const [favorites, setFavorites] = useState([]);
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [repeatMode, setRepeatMode] = useState("none");
//   const [queue, setQueue] = useState([]);
//   const [history, setHistory] = useState([]);
//   const audioRef = useRef(new Audio());
//   const recognitionRef = useRef(null);

//   // ---------- Load Songs ----------
//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/songs")
//       .then((res) => setSongs(res.data))
//       .catch((err) => console.error("Fetch songs error:", err));
//   }, []);

//   // ---------- Play / Pause ----------
//   const playPause = () => {
//     if (!audioRef.current.src) return;
//     if (isPlaying) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     } else {
//       audioRef.current.play().catch((err) => console.error(err));
//       setIsPlaying(true);
//     }
//   };

//   // ---------- Play & Log Song ----------
//   const logAndPlaySong = async (index) => {
//     try {
//       const song = songs[index];
//       audioRef.current.src = `http://localhost:5000${song.url}`;
//       await audioRef.current.play();
//       setCurrentSongIndex(index);
//       setIsPlaying(true);

//       const logRes = await axios.post("http://localhost:5000/api/log-song", {
//         userId: user?.id,
//         songId: song.songId,
//       });
//       if (logRes.data) setHistory((prev) => [song, ...prev]);
//     } catch (err) {
//       console.error("Failed to play song", err);
//     }
//   };

//   // ---------- Next / Previous ----------
//   const nextSong = () => {
//     let nextIndex;
//     if (repeatMode === "one" && currentSongIndex !== null) {
//       nextIndex = currentSongIndex;
//     } else if (queue.length > 0) {
//       nextIndex = queue[0];
//       setQueue((prev) => prev.slice(1));
//     } else if (currentSongIndex < songs.length - 1) {
//       nextIndex = currentSongIndex + 1;
//     } else if (repeatMode === "all") {
//       nextIndex = 0;
//     } else {
//       alert("No next song available");
//       return;
//     }
//     logAndPlaySong(nextIndex);
//   };

//   const previousSong = () => {
//     if (currentSongIndex > 0) {
//       logAndPlaySong(currentSongIndex - 1);
//     } else alert("No previous song available");
//   };

//   // ---------- Song Removal ----------
//   const removeSong = async (songId) => {
//     if (!window.confirm("Are you sure you want to remove this song?")) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/delete-song/${songId}`);
//       setSongs((prev) => prev.filter((s) => s.songId !== songId));
//       if (songs[currentSongIndex]?.songId === songId) {
//         audioRef.current.pause();
//         setCurrentSongIndex(null);
//         setIsPlaying(false);
//       }
//     } catch (err) {
//       console.error("Delete song error:", err);
//       alert("❌ Failed to remove song");
//     }
//   };

//   // ---------- Favorites, Queue, Shuffle ----------
//   const toggleFavorite = (songId) => {
//   setFavorites((prev) => {
//     const updated = prev.includes(songId)
//       ? prev.filter((id) => id !== songId)
//       : [...prev, songId];

//     localStorage.setItem("favorites", JSON.stringify(updated)); // ✅ save to localStorage
//     return updated;
//   });
// };


//   const addToQueue = (songId) => {
//     const index = songs.findIndex((song) => song.songId === songId);
//     if (index !== -1 && !queue.includes(index)) {
//       setQueue((prev) => [...prev, index]);
//     }
//   };

//   const shuffleSongs = () => {
//     const shuffled = [...Array(songs.length).keys()].sort(
//       () => Math.random() - 0.5
//     );
//     setSongs((prev) => shuffled.map((i) => prev[i]));
//     if (currentSongIndex !== null)
//       setCurrentSongIndex(shuffled.indexOf(currentSongIndex));
//   };

//   // ---------- Speech Recognition ----------
//   const createRecognition = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) return null;

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";

//     recognition.onstart = () => setListening(true);
//     recognition.onend = () => setListening(false);
//     recognition.onerror = (e) => console.error("SpeechRecognition error:", e);

//     recognition.onresult = (event) => {
//       const raw = event.results[0][0].transcript.trim().toLowerCase();
//       console.log("🎤 Command:", raw);

//       if (raw.includes("next")) return nextSong();
//       if (raw.includes("previous") || raw.includes("back")) return previousSong();
//       if (raw.includes("pause")) {
//         audioRef.current.pause();
//         setIsPlaying(false);
//         return;
//       }
//       if (raw.includes("stop")) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//         setIsPlaying(false);
//         return;
//       }
//       if (raw.includes("shuffle")) return shuffleSongs();
//       if (raw.includes("logout")) return nav("/login");
//       if (raw.includes("upload")) {
//         document.querySelector('input[type="file"]').click();
//         return;
//       }

//       // Play command
//       if (raw.startsWith("play")) {
//         const query = raw.replace(/^play\s+/, "").trim();
//         if (!query) {
//           audioRef.current.play();
//           setIsPlaying(true);
//           return;
//         }
//         const words = query.split(/\s+/);
//         const idx = songs.findIndex((s) => {
//           const haystack = `${s.title} ${s.artist}`.toLowerCase();
//           return words.every((w) => haystack.includes(w));
//         });
//         if (idx !== -1) return logAndPlaySong(idx);
//         alert(`❌ No results for "${query}"`);
//       }
//     };

//     return recognition;
//   };

//   const startListening = () => {
//     if (!recognitionRef.current) recognitionRef.current = createRecognition();
//     try {
//       recognitionRef.current.start();
//     } catch (e) {
//       console.warn("Recognition start error:", e);
//     }
//   };

//   // ---------- Upload ----------
//   const handleUpload = async (e) => {
//     const formData = new FormData();
//     for (let file of e.target.files) formData.append("songs", file);
//     try {
//       const res = await axios.post("http://localhost:5000/api/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setSongs((prev) => [...res.data, ...prev]);
//     } catch (err) {
//       console.error("Upload error:", err);
//     }
//   };

//   // ---------- Render ----------
//   return (
//     <SongContext.Provider
//       value={{
//         uploadedSongs: songs,
//         currentMood: songs[currentSongIndex]?.mood || null,
//         setCurrentSong: (index) => logAndPlaySong(index),
//       }}
//     >
//       <div className="home-content">
//         <div className="home-top">
//           <div className="home-title">
//             <h1>Welcome to MelodyMind, {user?.name || "Guest"}</h1>
//             <p className="muted">Upload your music and play instantly!</p>
//           </div>

//           <div className="home-actions">
//             <label htmlFor="file-upload" className="upload-btn">📁 Upload Music</label>
//             <input
//               id="file-upload"
//               type="file"
//               multiple
//               accept=".mp3,.wav"
//               onChange={handleUpload}
//             />
//             <button
//               className={`voice-btn ${listening ? "listening" : ""}`}
//               onClick={startListening}
//             >
//               🎤 {listening ? "Listening..." : "Voice Command"}
//             </button>
//             <button className="btn mood-btn" onClick={() => nav("/mood")}>
//               🎭 Mood Detection
//             </button>
//             <button className="btn smart-playlist-btn" onClick={() => nav("/smart-playlist")}>
//               🎵 Smart Playlist
//             </button>
//           </div>
//         </div>

//         {/* SONG LIST */}
//         <div className="card">
//           <div className="songs-header">
//             <h3>Uploaded Songs</h3>
//             <div className="global-controls">
//               <FaRandom className="player-btn" onClick={shuffleSongs} title="Shuffle" />
//               <button className="player-btn" onClick={playPause}>
//                 {isPlaying ? <FaPause /> : <FaPlay />}
//               </button>
//               <FaRedo
//                 className={`player-btn ${repeatMode === "all" ? "active" : ""}`}
//                 onClick={() =>
//                   setRepeatMode(repeatMode === "all" ? "none" : "all")
//                 }
//                 title="Repeat All"
//               />
//               <FaRedoAlt
//                 className={`player-btn ${repeatMode === "one" ? "active" : ""}`}
//                 onClick={() =>
//                   setRepeatMode(repeatMode === "one" ? "none" : "one")
//                 }
//                 title="Repeat One"
//               />
//             </div>
//           </div>

//           <ul className="song-list">
//             {songs.map((song, index) => (
//               <li key={song.songId} className="song-item">
//                 <div className="song-left">
//                   <button className="play-btn" onClick={() => logAndPlaySong(index)}>
//                     <FaPlay />
//                   </button>
//                   <div className="song-info">
//                     <h4>{song.title} ({song.artist})</h4>
//                     <p>
//                       🎵 Mood: {song.mood} | Genre: {song.genre}{" "}
//                       {song.tempo ? `[~${Math.round(song.tempo)} BPM]` : ""}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="song-right">
//                   <FaHeart
//                     className={`heart-icon ${favorites.includes(song.songId) ? "favorited" : ""}`}
//                     onClick={() => toggleFavorite(song.songId)}
//                   />
//                   <div
//                     className="three-dot"
//                     onClick={() =>
//                       setMenuOpen(menuOpen === index ? null : index)
//                     }
//                   >
//                     <FaEllipsisH />
//                     {menuOpen === index && (
//                       <div className="dropdown-menu">
//                         <button onClick={() => addToQueue(song.songId)}>➕ Add to Queue</button>
//                         <button onClick={() => removeSong(song.songId)}>🗑 Remove Song</button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* RECOMMENDED PLAYLIST */}
//         <div className="card" style={{ marginTop: "20px" }}>
//           <h3>Recommended Playlist 🎵</h3>
//           <Playlist />
//         </div>

//         {/* PLAYER BAR */}
//         {currentSongIndex !== null && (
//           <div className="playerbar mini-player">
//             <div className="playerbar-info">
//               <h4>{songs[currentSongIndex].title}</h4>
//               <p>
//                 {songs[currentSongIndex].artist} | {songs[currentSongIndex].mood}{" "}
//                 {songs[currentSongIndex].tempo
//                   ? `[~${Math.round(songs[currentSongIndex].tempo)} BPM]`
//                   : ""}
//               </p>
//             </div>
//             <div className="playerbar-controls">
//               <button onClick={previousSong} className="playerbar-btn">
//                 <FaStepBackward />
//               </button>
//               <button onClick={playPause} className="playerbar-btn">
//                 {isPlaying ? <FaPause /> : <FaPlay />}
//               </button>
//               <button onClick={nextSong} className="playerbar-btn">
//                 <FaStepForward />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* HISTORY */}
//         {Array.isArray(history) && history.length > 0 && (
//           <div className="card">
//             <h3>🎧 Recently Played</h3>
//             <ul className="song-list">
//               {history.map((entry, i) => (
//                 <li key={i} className="song-item">
//                   <h4>{entry.title} ({entry.artist})</h4>
//                   <p>Genre: {entry.genre} | Played: {new Date().toLocaleTimeString()}</p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </SongContext.Provider>
//   );
// }

/////




// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   FaPlay,
//   FaPause,
//   FaStepBackward,
//   FaStepForward,
//   FaEllipsisH,
//   FaHeart,
//   FaRandom,
//   FaRedo,
//   FaRedoAlt,
// } from "react-icons/fa";
// import { SongContext } from "../context/SongContext";
// import Playlist from "./Playlist";

// export default function Home({ user }) {
//   const nav = useNavigate();

//   const [songs, setSongs] = useState([]);
//   const [currentSongIndex, setCurrentSongIndex] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [listening, setListening] = useState(false);
//   const [favorites, setFavorites] = useState([]);
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [repeatMode, setRepeatMode] = useState("none");
//   const [queue, setQueue] = useState([]);
//   const [history, setHistory] = useState([]);
//   const audioRef = useRef(new Audio());
//   const recognitionRef = useRef(null);

//   // ---------- Load Songs ----------
//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/songs")
//       .then((res) => setSongs(res.data))
//       .catch((err) => console.error("Fetch songs error:", err));
//   }, []);

//   // ---------- Play / Pause ----------
//   const playPause = () => {
//     if (!audioRef.current.src) return;
//     if (isPlaying) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     } else {
//       audioRef.current.play().catch((err) => console.error(err));
//       setIsPlaying(true);
//     }
//   };

//   // ---------- Play & Log Song ----------
//   const logAndPlaySong = async (index) => {
//     try {
//       const song = songs[index];
//       audioRef.current.src = `http://localhost:5000${song.url}`;
//       await audioRef.current.play();
//       setCurrentSongIndex(index);
//       setIsPlaying(true);

//       const logRes = await axios.post("http://localhost:5000/api/log-song", {
//         userId: user?.id,
//         songId: song.songId,
//       });
//       if (logRes.data) setHistory((prev) => [song, ...prev]);
//     } catch (err) {
//       console.error("Failed to play song", err);
//     }
//   };

//   // ---------- Next / Previous ----------
//   const nextSong = () => {
//     let nextIndex;
//     if (repeatMode === "one" && currentSongIndex !== null) {
//       nextIndex = currentSongIndex;
//     } else if (queue.length > 0) {
//       nextIndex = queue[0];
//       setQueue((prev) => prev.slice(1));
//     } else if (currentSongIndex < songs.length - 1) {
//       nextIndex = currentSongIndex + 1;
//     } else if (repeatMode === "all") {
//       nextIndex = 0;
//     } else {
//       alert("No next song available");
//       return;
//     }
//     logAndPlaySong(nextIndex);
//   };

//   const previousSong = () => {
//     if (currentSongIndex > 0) {
//       logAndPlaySong(currentSongIndex - 1);
//     } else alert("No previous song available");
//   };

//   // ---------- Song Removal ----------
//   const removeSong = async (songId) => {
//     if (!window.confirm("Are you sure you want to remove this song?")) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/delete-song/${songId}`);
//       setSongs((prev) => prev.filter((s) => s.songId !== songId));
//       if (songs[currentSongIndex]?.songId === songId) {
//         audioRef.current.pause();
//         setCurrentSongIndex(null);
//         setIsPlaying(false);
//       }
//     } catch (err) {
//       console.error("Delete song error:", err);
//       alert("❌ Failed to remove song");
//     }
//   };

//   // ---------- Favorites, Queue, Shuffle ----------
//   const toggleFavorite = (songId) => {
//     setFavorites((prev) => {
//       const updated = prev.includes(songId)
//         ? prev.filter((id) => id !== songId)
//         : [...prev, songId];

//       localStorage.setItem("favorites", JSON.stringify(updated));
//       // Dispatch custom event to notify same-tab components
//       window.dispatchEvent(new Event("localStorageUpdate"));
//       return updated;
//     });
//   };

//   const addToQueue = (songId) => {
//     const index = songs.findIndex((song) => song.songId === songId);
//     if (index !== -1 && !queue.includes(index)) {
//       setQueue((prev) => [...prev, index]);
//     }
//   };

//   const shuffleSongs = () => {
//     const shuffled = [...Array(songs.length).keys()].sort(
//       () => Math.random() - 0.5
//     );
//     setSongs((prev) => shuffled.map((i) => prev[i]));
//     if (currentSongIndex !== null)
//       setCurrentSongIndex(shuffled.indexOf(currentSongIndex));
//   };

//   // ---------- Speech Recognition ----------
//   const createRecognition = () => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) return null;

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";

//     recognition.onstart = () => setListening(true);
//     recognition.onend = () => setListening(false);
//     recognition.onerror = (e) => console.error("SpeechRecognition error:", e);

//     recognition.onresult = (event) => {
//       const raw = event.results[0][0].transcript.trim().toLowerCase();
//       console.log("🎤 Command:", raw);

//       if (raw.includes("next")) return nextSong();
//       if (raw.includes("previous") || raw.includes("back")) return previousSong();
//       if (raw.includes("pause")) {
//         audioRef.current.pause();
//         setIsPlaying(false);
//         return;
//       }
//       if (raw.includes("stop")) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//         setIsPlaying(false);
//         return;
//       }
//       if (raw.includes("shuffle")) return shuffleSongs();
//       if (raw.includes("logout")) return nav("/login");
//       if (raw.includes("upload")) {
//         document.querySelector('input[type="file"]').click();
//         return;
//       }

//       if (raw.startsWith("play")) {
//         const query = raw.replace(/^play\s+/, "").trim();
//         if (!query) {
//           audioRef.current.play();
//           setIsPlaying(true);
//           return;
//         }
//         const words = query.split(/\s+/);
//         const idx = songs.findIndex((s) => {
//           const haystack = `${s.title} ${s.artist}`.toLowerCase();
//           return words.every((w) => haystack.includes(w));
//         });
//         if (idx !== -1) return logAndPlaySong(idx);
//         alert(`❌ No results for "${query}"`);
//       }
//     };

//     return recognition;
//   };

//   const startListening = () => {
//     if (!recognitionRef.current) recognitionRef.current = createRecognition();
//     try {
//       recognitionRef.current.start();
//     } catch (e) {
//       console.warn("Recognition start error:", e);
//     }
//   };

//   // ---------- Upload ----------
//   const handleUpload = async (e) => {
//     const formData = new FormData();
//     for (let file of e.target.files) formData.append("songs", file);
//     try {
//       const res = await axios.post("http://localhost:5000/api/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setSongs((prev) => [...res.data, ...prev]);
//     } catch (err) {
//       console.error("Upload error:", err);
//     }
//   };

//   // ---------- Render ----------
//   return (
//     <SongContext.Provider
//       value={{
//         uploadedSongs: songs,
//         currentMood: songs[currentSongIndex]?.mood || null,
//         setCurrentSong: (index) => logAndPlaySong(index),
//       }}
//     >
//       <div className="home-content">
//         <div className="home-top">
//           <div className="home-title">
//             <h1>Welcome to MelodyMind, {user?.name || "Guest"}</h1>
//             <p className="muted">Upload your music and play instantly!</p>
//           </div>

//           <div className="home-actions">
//             <label htmlFor="file-upload" className="upload-btn">📁 Upload Music</label>
//             <input
//               id="file-upload"
//               type="file"
//               multiple
//               accept=".mp3,.wav"
//               onChange={handleUpload}
//             />
//             <button
//               className={`voice-btn ${listening ? "listening" : ""}`}
//               onClick={startListening}
//             >
//               🎤 {listening ? "Listening..." : "Voice Command"}
//             </button>
//             <button className="btn mood-btn" onClick={() => nav("/mood")}>
//               🎭 Mood Detection
//             </button>
//             <button className="btn smart-playlist-btn" onClick={() => nav("/smart-playlist")}>
//               🎵 Smart Playlist
//             </button>
//             {/* ✅ NEW FAVORITES BUTTON ADDED HERE */}
//             <button className="btn favorites-btn" onClick={() => nav("/favorites")}>
//               ❤ Favorites
//             </button>
//           </div>
//         </div>

//         {/* SONG LIST */}
//         <div className="card">
//           <div className="songs-header">
//             <h3>Uploaded Songs</h3>
//             <div className="global-controls">
//               <FaRandom className="player-btn" onClick={shuffleSongs} title="Shuffle" />
//               <button className="player-btn" onClick={playPause}>
//                 {isPlaying ? <FaPause /> : <FaPlay />}
//               </button>
//               <FaRedo
//                 className={`player-btn ${repeatMode === "all" ? "active" : ""}`}
//                 onClick={() =>
//                   setRepeatMode(repeatMode === "all" ? "none" : "all")
//                 }
//                 title="Repeat All"
//               />
//               <FaRedoAlt
//                 className={`player-btn ${repeatMode === "one" ? "active" : ""}`}
//                 onClick={() =>
//                   setRepeatMode(repeatMode === "one" ? "none" : "one")
//                 }
//                 title="Repeat One"
//               />
//             </div>
//           </div>

//           <ul className="song-list">
//             {songs.map((song, index) => (
//               <li key={song.songId} className="song-item">
//                 <div className="song-left">
//                   <button className="play-btn" onClick={() => logAndPlaySong(index)}>
//                     <FaPlay />
//                   </button>
//                   <div className="song-info">
//                     <h4>{song.title} ({song.artist})</h4>
//                     <p>
//                       🎵 Mood: {song.mood} | Genre: {song.genre}{" "}
//                       {song.tempo ? `[~${Math.round(song.tempo)} BPM]` : ""}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="song-right">
//                   <FaHeart
//                     className={`heart-icon ${favorites.includes(song.songId) ? "favorited" : ""}`}
//                     onClick={() => toggleFavorite(song.songId)}
//                   />
//                   <div
//                     className="three-dot"
//                     onClick={() =>
//                       setMenuOpen(menuOpen === index ? null : index)
//                     }
//                   >
//                     <FaEllipsisH />
//                     {menuOpen === index && (
//                       <div className="dropdown-menu">
//                         <button onClick={() => addToQueue(song.songId)}>➕ Add to Queue</button>
//                         <button onClick={() => removeSong(song.songId)}>🗑 Remove Song</button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* RECOMMENDED PLAYLIST */}
//         <div className="card" style={{ marginTop: "20px" }}>
//           <h3>Recommended Playlist 🎵</h3>
//           <Playlist />
//         </div>

//         {/* PLAYER BAR */}
//         {currentSongIndex !== null && (
//           <div className="playerbar mini-player">
//             <div className="playerbar-info">
//               <h4>{songs[currentSongIndex].title}</h4>
//               <p>
//                 {songs[currentSongIndex].artist} | {songs[currentSongIndex].mood}{" "}
//                 {songs[currentSongIndex].tempo
//                   ? `[~${Math.round(songs[currentSongIndex].tempo)} BPM]`
//                   : ""}
//               </p>
//             </div>
//             <div className="playerbar-controls">
//               <button onClick={previousSong} className="playerbar-btn">
//                 <FaStepBackward />
//               </button>
//               <button onClick={playPause} className="playerbar-btn">
//                 {isPlaying ? <FaPause /> : <FaPlay />}
//               </button>
//               <button onClick={nextSong} className="playerbar-btn">
//                 <FaStepForward />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* HISTORY */}
//         {Array.isArray(history) && history.length > 0 && (
//           <div className="card">
//             <h3>🎧 Recently Played</h3>
//             <ul className="song-list">
//               {history.map((entry, i) => (
//                 <li key={i} className="song-item">
//                   <h4>{entry.title} ({entry.artist})</h4>
//                   <p>Genre: {entry.genre} | Played: {new Date().toLocaleTimeString()}</p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </SongContext.Provider>
//   );
// }