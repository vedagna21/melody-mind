// import React, { createContext, useState } from "react";

// export const SongContext = createContext();

// export const SongProvider = ({ children }) => {
//   const [uploadedSongs, setUploadedSongs] = useState([]);
//   const [currentMood, setCurrentMood] = useState(null);
//   const [currentSong, setCurrentSong] = useState(null);

//   return (
//     <SongContext.Provider
//       value={{
//         uploadedSongs,
//         setUploadedSongs,
//         currentMood,
//         setCurrentMood,
//         currentSong,
//         setCurrentSong,
//       }}
//     >
//       {children}
//     </SongContext.Provider>
//   );
// };
////
// import React, { createContext, useState } from "react";

// export const SongContext = createContext();

// export const SongProvider = ({ children }) => {
//   const [uploadedSongs, setUploadedSongs] = useState([]);
//   const [currentMood, setCurrentMood] = useState(null);
//   const [currentSong, setCurrentSong] = useState(null);

//   return (
//     <SongContext.Provider
//       value={{
//         uploadedSongs,
//         setUploadedSongs,
//         currentMood,
//         setCurrentMood,
//         currentSong,
//         setCurrentSong,
//       }}
//     >
//       {children}
//     </SongContext.Provider>
//   );
// };
// import React, { useState, useRef, useContext, createContext } from "react";

// const SongContext = createContext();

// export function SongProvider({ children }) {
//   const [currentSong, setCurrentSong] = useState(null);
//   const [currentMood, setCurrentMood] = useState(null); // new: last played mood
//   const [uploadedSongs, setUploadedSongs] = useState([]); // new: all uploaded songs
//   const [isPlaying, setIsPlaying] = useState(false);
//   const audioRef = useRef(new Audio());

//   const playSong = (song) => {
//     if (song.url) audioRef.current.src = http://localhost:5000${song.url};
//     audioRef.current.play();
//     setCurrentSong(song);
//     setCurrentMood(song.mood); // store last played song's mood
//     setIsPlaying(true);
//   };

//   const playPause = () => {
//     if (isPlaying) audioRef.current.pause();
//     else audioRef.current.play();
//     setIsPlaying(!isPlaying);
//   };

//   const nextSong = () => alert("Next song not implemented in demo");
//   const previousSong = () => alert("Previous song not implemented in demo");

//   return (
//     <SongContext.Provider
//       value={{
//         currentSong,
//         setCurrentSong,
//         currentMood,
//         setCurrentMood,
//         uploadedSongs,
//         setUploadedSongs,
//         isPlaying,
//         setIsPlaying,
//         playSong,
//         playPause,
//         nextSong,
//         previousSong,
//       }}
//     >
//       {children}
//     </SongContext.Provider>
//   );
// }

// export const useSong = () => useContext(SongContext);
import React, { createContext, useState, useContext } from "react";

export const SongContext = createContext();

export const SongProvider = ({ children }) => {
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);

  return (
    <SongContext.Provider
      value={{
        uploadedSongs,
        setUploadedSongs,
        currentMood,
        setCurrentMood,
        currentSong,
        setCurrentSong,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};

// ✅ Custom hook for convenience
export const useSong = () => useContext(SongContext);