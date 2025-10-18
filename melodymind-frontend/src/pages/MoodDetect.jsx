
// import "./MoodDetect.css";
// import React, { useRef, useState, useEffect } from "react";
// import * as faceapi from "face-api.js";
// import axios from "axios";
// import Sentiment from "sentiment";
// import { useSong } from "../context/SongContext.jsx";
// import { FaVideo, FaStopCircle } from "react-icons/fa";



// const sentiment = new Sentiment();

// export default function MoodDetect() {
//   const videoRef = useRef();
//   const [detectedMood, setDetectedMood] = useState(null);
//   const [recommendedSongs, setRecommendedSongs] = useState([]);
//   const [clientMoodSongs, setClientMoodSongs] = useState([]);
//   const [allSongs, setAllSongs] = useState([]);
//   const [loadingSongs, setLoadingSongs] = useState(false);
//   const [detecting, setDetecting] = useState(false);
//   const [textInput, setTextInput] = useState("");
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [cameraOn, setCameraOn] = useState(false);
//   const { uploadedSongs } = useSong();

//   // Build client-side mood list from uploaded songs
//   useEffect(() => {
//     if (!detectedMood) { setClientMoodSongs([]); return; }
//     const dm = String(detectedMood).toLowerCase();
//     const matches = (uploadedSongs || []).filter((s) => String(s.mood || "").toLowerCase().includes(dm));
//     setClientMoodSongs(matches);
//   }, [detectedMood, uploadedSongs]);

//   // If uploads are not populated on this route, load all songs once
//   useEffect(() => {
//     if (uploadedSongs && uploadedSongs.length > 0) return;
//     let cancelled = false;
//     const run = async () => {
//       try {
//         setLoadingSongs(true);
//         const res = await axios.get("http://localhost:5000/api/songs");
//         if (!cancelled) setAllSongs(res.data || []);
//       } catch (_) {
//         if (!cancelled) setAllSongs([]);
//       } finally {
//         if (!cancelled) setLoadingSongs(false);
//       }
//     };
//     run();
//     return () => { cancelled = true; };
//   }, [uploadedSongs]);

//   // ====================== VIDEO MOOD DETECTION ======================
//   const loadModels = async () => {
//     if (modelsLoaded) return;
//     try {
//       await Promise.all([
//         faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
//         faceapi.nets.faceExpressionNet.loadFromUri("/models"),
//       ]);
//       setModelsLoaded(true);
//     } catch (e) {
//       setErrorMsg("Face models not found at /models. Add face-api.js models under public/models.");
//       setModelsLoaded(false);
//       throw e;
//     }
//   };

//   const startVideo = async () => {
//     try {
//       await loadModels();
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         await new Promise((res) => {
//           const v = videoRef.current;
//           if (!v) return res();
//           if (v.readyState >= 2) return res();
//           v.onloadeddata = () => res();
//         });
//       }
//       setErrorMsg("");
//       setCameraOn(true);
//     } catch (e) {
//       if (!errorMsg) setErrorMsg("Unable to access camera or load models.");
//     }
//   };

//   const stopVideo = () => {
//     try {
//       const v = videoRef.current;
//       const stream = v && v.srcObject;
//       if (stream) {
//         stream.getTracks().forEach((t) => t.stop());
//         v.srcObject = null;
//       }
//       setCameraOn(false);
//     } catch (_) {
//       // ignore
//     }
//   };

//   const detectMood = async () => {
//     try {
//       setErrorMsg("");
//       setDetecting(true);
//       if (!modelsLoaded) {
//         await loadModels();
//       }
//       if (!videoRef.current || !videoRef.current.srcObject) {
//         await startVideo();
//       }
//       const detections = await faceapi
//         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceExpressions();
//       if (detections && detections.length > 0) {
//         const exp = detections[0].expressions;
//         const maxExp = Object.keys(exp).reduce((a, b) => (exp[a] > exp[b] ? a : b));
//         const mood = getMoodFromExpression(maxExp);
//         setDetectedMood(mood);
//         fetchSongs(mood);
//       } else {
//         setErrorMsg("No face detected. Ensure your face is visible and well-lit.");
//       }
//     } catch (e) {
//       if (!errorMsg) setErrorMsg("Detection failed. Check camera permission and models at /models.");
//     } finally {
//       setDetecting(false);
//     }
//   };

//   const getMoodFromExpression = (exp) => {
//     switch (exp) {
//       case "happy":
//         return "Happy";
//       case "sad":
//         return "Sad";
//       case "angry":
//         return "Energetic";
//       case "surprised":
//         return "Energetic";
//       case "neutral":
//         return "Neutral";
//       case "fearful":
//       case "disgusted":
//         return "Calm";
//       default:
//         return "Neutral";
//     }
//   };

//   // ====================== TEXT MOOD DETECTION ======================
//   const detectMoodFromText = (text) => {
//     const result = sentiment.analyze(text);
//     if (result.score > 0) return "Happy";
//     else if (result.score < 0) return "Sad";
//     else return "Neutral";
//   };

//   const handleTextMood = async (e) => {
//     e.preventDefault();
//     if (textInput.trim() === "") return;

//     const mood = detectMoodFromText(textInput);
//     setDetectedMood(mood);
//     fetchSongs(mood);
//   };

//   // ====================== FETCH SONGS FROM BACKEND ======================
//   const fetchSongs = async (mood) => {
//     try {
//       const recRes = await axios.get("http://localhost:5000/api/recommend-face", {
//         params: { mood },
//       });
//       setRecommendedSongs(recRes.data);
//     } catch (err) {
//       console.error("Error fetching songs:", err);
//     }
//   };

// //   return (
// //     <div className="mood-page">
// //       <h1>🎭 Mood Detection Center</h1>
// //       <p>Choose how you want to detect your mood — via camera or by entering text.</p>

// //       <div className="mood-grid">
// //         {/* ====================== FACE MOOD SECTION ====================== */}
// //         <div className="mood-card">
// //           <h2>📷 Detect via Face</h2>
// //           <video ref={videoRef} autoPlay className="mood-video" />

// //           <div className="btn-row">
// //             <button className="mood-btn-secondary" onClick={startVideo} disabled={detecting || cameraOn} aria-label="Start Camera">
// //               <span className={`icon-badge ring ${cameraOn ? 'on' : ''}`}><FaVideo /></span>
// //               <span>Start Camera</span>
// //             </button>
// //             <button className="mood-btn-secondary" onClick={stopVideo} disabled={!cameraOn || detecting} aria-label="Stop Camera">
// //               <span className={`icon-badge ring ${cameraOn ? 'on' : ''}`}><FaStopCircle /></span>
// //               <span>Stop Camera</span>
// //             </button>
// //             <button className="mood-btn-primary" onClick={detectMood} disabled={detecting}>
// //               {detecting ? "Detecting..." : "🎭 Detect Mood"}
// //             </button>
// //           </div>
// //           {detectedMood && (
// //             <div className="result-card" style={{ marginTop: 8 }}>
// //               <h3>Detected Mood: {detectedMood}</h3>
// //             </div>
// //           )}
// //           {errorMsg && <p className="form-error" style={{marginTop:8}}>{errorMsg}</p>}
// //         </div>

// //         {/* ====================== TEXT MOOD SECTION ====================== */}
// //         <div className="mood-card">
// //           <h2>💬 Detect via Text</h2>
// //           <form onSubmit={handleTextMood}>
// //             <textarea
// //               className="mood-textarea"
// //               value={textInput}
// //               onChange={(e) => setTextInput(e.target.value)}
// //               placeholder="Type how you feel..."
// //               rows="6"
// //             />
// //             <div className="btn-row">
// //               <button type="submit" className="mood-btn-primary">🔍 Analyze Mood</button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>

// //       {/* ====================== DETECTED MOOD + SONGS ====================== */}
// //       {detectedMood && (
// //         <div className="result-card" style={{ marginTop: "12px" }}>
// //           <h3>Detected Mood: {detectedMood}</h3>
// //         </div>
// //       )}
// //       {recommendedSongs.length > 0 && (
// //         <div className="recommendations">
// //           <h2>🎵 Recommended Songs for {detectedMood}</h2>
// //           <ul>
// //             {recommendedSongs.map((song) => (
// //               <li key={song.songId}>
// //                 <strong>{song.title}</strong> — {song.artist}
// //                 <div className="song-meta">🎶 Genre: {song.genre} · Mood: {song.mood}</div>
// //                 <audio controls src={`http://localhost:5000${song.url}`} />
// //               </li>
// //             ))}
// //           </ul>
// //         </div>
// //       )}
// //       {(() => {
// //         const displaySongs = clientMoodSongs.length > 0
// //           ? clientMoodSongs
// //           : (uploadedSongs && uploadedSongs.length > 0 ? uploadedSongs : allSongs);
// //         if (!detectedMood || loadingSongs || !displaySongs || displaySongs.length === 0) return null;
// //         const showFallbackNote = clientMoodSongs.length === 0;
// //         return (
// //         <div className="recommendations" style={{ marginTop: 12 }}>
// //           <h2>🎵 From Your Uploads{detectedMood ? `: ${detectedMood}` : ""}</h2>
// //           {showFallbackNote && (
// //             <p className="muted" style={{ margin: '6px 0 8px' }}>
// //               No exact mood matches found — showing all your songs.
// //             </p>
// //           )}
// //           <ul>
// //             {displaySongs.map((song, i) => (
// //               <li key={song.songId || `client-${i}`}>
// //                 <strong>{song.title}</strong> — {song.artist}
// //                 <div className="song-meta">🎶 Genre: {song.genre} · Mood: {song.mood}</div>
// //                 <audio controls src={`http://localhost:5000${song.url}`} />
// //               </li>
// //             ))}
// //           </ul>
// //         </div>
// //         );
// //       })()}
// //     </div>
// //   );
// return (
//   <div
//     className="mood-page"
//     style={{
//       padding: "16px",
//       boxSizing: "border-box",
//       // remove height and overflowY
//       // height: "100vh",
//       // overflowY: "auto",
//     }}
//   >
//     <h1>🎭 Mood Detection Center</h1>
//     <p>Choose how you want to detect your mood — via camera or by entering text.</p>

//     <div className="mood-grid">
//       {/* FACE MOOD */}
//       <div className="mood-card">
//         <h2>📷 Detect via Face</h2>
//         <video ref={videoRef} autoPlay className="mood-video" />

//         <div className="btn-row">
//           <button onClick={startVideo} disabled={detecting || cameraOn}>
//             Start Camera
//           </button>
//           <button onClick={stopVideo} disabled={!cameraOn || detecting}>
//             Stop Camera
//           </button>
//           <button onClick={detectMood} disabled={detecting}>
//             {detecting ? "Detecting..." : "🎭 Detect Mood"}
//           </button>
//         </div>

//         {errorMsg && <p>{errorMsg}</p>}
//       </div>

//       {/* TEXT MOOD */}
//       <div className="mood-card">
//         <h2>💬 Detect via Text</h2>
//         <form onSubmit={handleTextMood}>
//           <textarea
//             value={textInput}
//             onChange={(e) => setTextInput(e.target.value)}
//             placeholder="Type how you feel..."
//             rows="6"
//             style={{ width: "100%" }}
//           />
//           <button type="submit">🔍 Analyze Mood</button>
//         </form>
//       </div>
//     </div>

//     {/* DETECTED MOOD */}
//     {detectedMood && (
//       <div className="result-card">
//         <h3>Detected Mood: {detectedMood}</h3>
//       </div>
//     )}

//     {/* RECOMMENDED SONGS */}
//     <div className="recommendations">
//       {(recommendedSongs.length > 0 || clientMoodSongs.length > 0 || allSongs.length > 0) && (
//         <>
//           {recommendedSongs.length > 0 && (
//             <>
//               <h2>🎵 Recommended Songs for {detectedMood}</h2>
//               <ul>
//                 {recommendedSongs.map((song) => (
//                   <li key={song.songId}>
//                     <strong>{song.title}</strong> — {song.artist}
//                     <div>🎶 Genre: {song.genre} · Mood: {song.mood}</div>
//                     <audio controls src={`http://localhost:5000${song.url}`} />
//                   </li>
//                 ))}
//               </ul>
//             </>
//           )}

//           {(() => {
//             const displaySongs =
//               clientMoodSongs.length > 0
//                 ? clientMoodSongs
//                 : uploadedSongs?.length > 0
//                 ? uploadedSongs
//                 : allSongs;
//             if (!detectedMood || !displaySongs?.length) return null;

//             const showFallbackNote = clientMoodSongs.length === 0;

//             return (
//               <>
//                 <h2>🎵 From Your Uploads{detectedMood ? `: ${detectedMood}` : ""}</h2>
//                 {showFallbackNote && <p>No exact mood matches — showing all your songs.</p>}
//                 <ul>
//                   {displaySongs.map((song, i) => (
//                     <li key={song.songId || `client-${i}`}>
//                       <strong>{song.title}</strong> — {song.artist}
//                       <div>🎶 Genre: {song.genre} · Mood: {song.mood}</div>
//                       <audio controls src={`http://localhost:5000${song.url}`} />
//                     </li>
//                   ))}
//                 </ul>
//               </>
//             );
//           })()}
//         </>
//       )}
//     </div>
//   </div>
// );
// }
import "./MoodDetect.css";
import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import Sentiment from "sentiment";
import { useSong } from "../context/SongContext.jsx";
import { FaVideo, FaStopCircle } from "react-icons/fa";

const sentiment = new Sentiment();

export default function MoodDetect() {
  const videoRef = useRef();
  const { uploadedSongs } = useSong();

  const [detectedMood, setDetectedMood] = useState(null);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cameraOn, setCameraOn] = useState(false);

  // ====================== VIDEO MOOD DETECTION ======================
  const loadModels = async () => {
    if (modelsLoaded) return;
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      setModelsLoaded(true);
    } catch (e) {
      setErrorMsg(
        "Face models not found at /models. Add face-api.js models under public/models."
      );
      setModelsLoaded(false);
      throw e;
    }
  };

  const startVideo = async () => {
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((res) => {
          const v = videoRef.current;
          if (!v) return res();
          if (v.readyState >= 2) return res();
          v.onloadeddata = () => res();
        });
      }
      setErrorMsg("");
      setCameraOn(true);
    } catch (e) {
      if (!errorMsg) setErrorMsg("Unable to access camera or load models.");
    }
  };

  const stopVideo = () => {
    try {
      const v = videoRef.current;
      const stream = v && v.srcObject;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        v.srcObject = null;
      }
      setCameraOn(false);
    } catch (_) {}
  };

  const detectMood = async () => {
    try {
      setErrorMsg("");
      setDetecting(true);
      if (!modelsLoaded) await loadModels();
      if (!videoRef.current || !videoRef.current.srcObject) await startVideo();

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections && detections.length > 0) {
        const exp = detections[0].expressions;
        const maxExp = Object.keys(exp).reduce((a, b) => (exp[a] > exp[b] ? a : b));
        const mood = getMoodFromExpression(maxExp);
        setDetectedMood(mood);
        fetchSongs(mood);
      } else {
        setErrorMsg("No face detected. Ensure your face is visible and well-lit.");
      }
    } catch (e) {
      if (!errorMsg)
        setErrorMsg("Detection failed. Check camera permission and models at /models.");
    } finally {
      setDetecting(false);
    }
  };

const getMoodFromExpression = (exp) => {
  switch (exp) {
    case "happy":
      return ["Happy"];
    case "sad":
      return ["Sad", "Calm"]; // return both moods
    case "angry":
    case "surprised":
      return ["Energetic"];
    case "neutral":
      return ["Neutral"];
    case "fearful":
    case "disgusted":
      return ["Calm"];
    default:
      return ["Neutral"];
  }
};


  // ====================== TEXT MOOD DETECTION ======================
  const detectMoodFromText = (text) => {
    const result = sentiment.analyze(text);
    if (result.score > 0) return "Happy";
    else if (result.score < 0) return "Sad";
    else return "Neutral";
  };

  const handleTextMood = (e) => {
    e.preventDefault();
    if (textInput.trim() === "") return;
    const mood = detectMoodFromText(textInput);
    setDetectedMood(mood);
    fetchSongs(mood);
  };

  // ====================== FETCH SONGS FROM BACKEND ======================
  const fetchSongs = async (mood) => {
    try {
      const recRes = await axios.get("http://localhost:5000/api/recommend-face", {
        params: { mood },
      });
      setRecommendedSongs(recRes.data || []);
    } catch (err) {
      console.error("Error fetching songs:", err);
      setRecommendedSongs([]);
    }
  };

  return (
    <div className="mood-page">
      <div className="scroll-container">
        <h1>🎭 Mood Detection Center</h1>
        <p>Choose how you want to detect your mood — via camera or by entering text.</p>

        <div className="mood-grid">
          {/* FACE MOOD */}
          <div className="mood-card">
            <h2>📷 Detect via Face</h2>
            <video ref={videoRef} autoPlay className="mood-video" />
            <div className="btn-row">
              <button onClick={startVideo} disabled={detecting || cameraOn}>
                <FaVideo /> Start Camera
              </button>
              <button onClick={stopVideo} disabled={!cameraOn || detecting}>
                <FaStopCircle /> Stop Camera
              </button>
              <button onClick={detectMood} disabled={detecting}>
                🎭 {detecting ? "Detecting..." : "Detect Mood"}
              </button>
            </div>
            {errorMsg && <p className="error-message">{errorMsg}</p>}
          </div>

          {/* TEXT MOOD */}
          <div className="mood-card">
            <h2>💬 Detect via Text</h2>
            <form onSubmit={handleTextMood}>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type how you feel..."
                rows="6"
                className="text-input"
              />
              <button type="submit">🔍 Analyze Mood</button>
            </form>
          </div>
        </div>

        {/* DETECTED MOOD */}
        {detectedMood && (
          <div className="result-card">
            <h3>Detected Mood: {detectedMood}</h3>
          </div>
        )}

        {/* RECOMMENDED SONGS */}
        {recommendedSongs.length > 0 && (
          <div className="recommendations">
            <h2>🎵 Recommended Songs for {detectedMood}</h2>
            <ul className="song-list">
              {recommendedSongs.map((song) => (
                <li key={song.songId} className="song-item">
                  <strong>{song.title}</strong> — {song.artist}
                  <div>🎶 Genre: {song.genre} · Mood: {song.mood}</div>
                  <audio controls src={`http://localhost:5000${song.url}`} className="audio-player" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}