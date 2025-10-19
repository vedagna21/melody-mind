
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
      const recRes = await axios.get("https://melody-mind-5wqf.onrender.com/api/recommend-face", {
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
                  <audio controls src={`https://melody-mind-5wqf.onrender.com${song.url}`} className="audio-player" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}