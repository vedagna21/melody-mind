const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { spawnSync } = require("child_process");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ 
  origin: ["http://localhost:5173", "https://melody-mind-delta.vercel.app"],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "x-user-id"],
  credentials: true
}));
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "MelodyMind Backend API", version: "1.0.0" });
});

// MongoDB Connection
require("dotenv").config();
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const songSchema = new mongoose.Schema({
  songId: { type: String, unique: true },
  title: String,
  artist: String,
  mood: String,
  genre: String,
  url: String,
  tempo: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ Add user association
});

const userHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  songId: String,
  title: String,
  mood: String,
  genre: String,
  playCount: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Song = mongoose.model("Song", songSchema);
const UserHistory = mongoose.model("UserHistory", userHistorySchema);

// Upload Setup
const uploadFolder = path.join(__dirname, "uploads");
// Create uploads/ folder at runtime
fsPromises.mkdir(uploadFolder, { recursive: true })
  .then(() => console.log("✅ Uploads folder created"))
  .catch(err => console.error("❌ Failed to create uploads folder:", err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Serve uploads/ with explicit CORS
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://melody-mind-delta.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  console.log(`Serving file: ${req.path}`); // Debug log
  express.static(uploadFolder)(req, res, next);
}, express.static(uploadFolder));

/* =======================
   AUTH ENDPOINTS
======================= */
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ user: { id: user._id, name, email } });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   SONG UPLOAD & DETECTION
======================= */
app.post("/api/upload", upload.array("songs"), async (req, res) => {
  try {
    const files = req.files;
    const userId = req.body.userId; // ✅ require user ID from frontend
    if (!userId) return res.status(400).json({ message: "User ID required" });
    if (!files || files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const savedSongs = [];
    const pythonScriptPath = path.join(__dirname, "mood_genre_detect.py");
    const pythonCommand = "python3";

    for (const file of files) {
      let mood = "Neutral";
      let genre = "Unknown";
      let tempo = 0;

      try {
        const pyResult = spawnSync(pythonCommand, [pythonScriptPath, file.path], {
          encoding: "utf-8",
          stdio: "pipe"
        });

        if (pyResult.error) console.error("SpawnSync error:", pyResult.error);
        if (pyResult.stderr && pyResult.stderr.trim()) console.error("Python stderr:", pyResult.stderr.trim());
        if (pyResult.stdout && pyResult.stdout.trim()) {
          try {
            const parsed = JSON.parse(pyResult.stdout.trim());
            mood = parsed.mood || "Neutral";
            genre = parsed.genre || "Unknown";
            tempo = parsed.tempo || 0;
            if (parsed.error) console.warn("Python script returned error:", parsed.error);
          } catch (e) {
            console.error("JSON parse error:", e, "Raw output:", pyResult.stdout);
          }
        } else {
          console.warn("Python stdout empty for file:", file.originalname);
        }
      } catch (e) {
        console.error("Python detection error:", e);
      }

      // Save song to MongoDB with uploadedBy
      const song = new Song({
        songId: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        title: file.originalname.replace(/\.[^/.]+$/, ""),
        artist: "Local File",
        mood,
        genre,
        url: `/uploads/${file.filename}`,
        tempo,
        uploadedBy: userId, // ✅ associate with user
      });

      await song.save();
      savedSongs.push(song);
    }

    res.status(200).json(savedSongs);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* =======================
   SONG RETRIEVAL & DELETE
======================= */
app.get("/api/songs", async (req, res) => {
  try {
    const userId = req.query.userId; // ✅ frontend must send ?userId=...
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const songs = await Song.find({ uploadedBy: userId }).sort({ _id: -1 }); // ✅ only user's songs
    res.status(200).json(songs);
  } catch (err) {
    console.error("Get songs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/delete-song/:songId", async (req, res) => {
  try {
    const { songId } = req.params;
    const song = await Song.findOne({ songId });
    if (!song) return res.status(404).json({ message: "Song not found" });

    await Song.deleteOne({ songId });

    const filePath = path.join(__dirname, song.url);
    if (await fsPromises.exists(filePath)) {
      await fsPromises.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } else {
      console.warn(`File not found: ${filePath}`);
    }

    res.status(200).json({ message: "✅ Song removed successfully" });
  } catch (err) {
    console.error("❌ Failed to remove song:", err);
    res.status(500).json({ message: "Failed to remove song" });
  }
});

/* =======================
   FACE MOOD-BASED RECOMMENDATIONS
======================= */
app.get("/api/recommend-face", async (req, res) => {
  const { mood, userId } = req.query; // ✅ optional filter by user

  try {
    let allSongs = userId
      ? await Song.find({ uploadedBy: userId }) // user-specific recommendations
      : await Song.find({}); // fallback global

    if (!allSongs || allSongs.length === 0) return res.json([]);

    let filtered = allSongs.filter(
      (song) => song.mood?.toLowerCase() === mood?.toLowerCase()
    );

    if (filtered.length === 0) {
      const moodMap = {
        happy: ["Energetic", "Calm"],
        sad: ["Calm", "Neutral"],
        neutral: ["Pop", "Classical"],
        energetic: ["Hip-Hop", "Electronic"],
        calm: ["Jazz", "Classical"],
      };
      const related = moodMap[mood?.toLowerCase()] || [];
      filtered = allSongs.filter((song) => related.includes(song.mood));
    }

    if (filtered.length > 1 && filtered.some((s) => s.tempo)) {
      const avgTempo =
        filtered.reduce((sum, s) => sum + (s.tempo || 0), 0) / filtered.length;
      filtered = filtered.sort(
        (a, b) =>
          Math.abs((a.tempo || 0) - avgTempo) -
          Math.abs((b.tempo || 0) - avgTempo)
      );
    }

    if (filtered.length === 0) filtered = allSongs.sort(() => 0.5 - Math.random());

    res.json(filtered.slice(0, 5));
  } catch (error) {
    console.error("Error recommending songs:", error);
    res.json([]);
  }
});

/* =======================
   USER HISTORY & GENRE ANALYTICS
======================= */
app.post("/api/log-song", async (req, res) => {
  try {
    const { userId, songId } = req.body;
    if (!userId || !songId)
      return res.status(400).json({ message: "User ID and Song ID required" });

    const song = await Song.findOne({ songId });
    if (!song) return res.status(404).json({ message: "Song not found" });

    let historyEntry = await UserHistory.findOne({ userId, songId });
    if (historyEntry) {
      historyEntry.playCount = (historyEntry.playCount || 1) + 1;
      historyEntry.timestamp = new Date();
      await historyEntry.save();
    } else {
      historyEntry = new UserHistory({
        userId,
        songId,
        title: song.title,
        mood: song.mood,
        genre: song.genre,
        playCount: 1,
        timestamp: new Date(),
      });
      await historyEntry.save();
    }

    res.status(200).json({ message: "Song logged successfully" });
  } catch (err) {
    console.error("Log song error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/user-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, sort = "-timestamp", genre } = req.query;
    const query = { userId };
    if (genre) query.genre = genre;

    const history = await UserHistory.find(query)
      .sort(sort)
      .limit(parseInt(limit));

    res.status(200).json(history);
  } catch (error) {
    console.error("User history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/genre-trends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await UserHistory.find({ userId });

    if (!history || history.length === 0) return res.status(200).json({ daily: {}, weekly: {} });

    const daily = {};
    history.forEach((h) => {
      const day = new Date(h.timestamp).toISOString().split("T")[0];
      if (!daily[day]) daily[day] = {};
      daily[day][h.genre] = (daily[day][h.genre] || 0) + (h.playCount || 1);
    });

    const getWeek = (date) => {
      const d = new Date(date);
      const oneJan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${week}`;
    };

    const weekly = {};
    history.forEach((h) => {
      const week = getWeek(h.timestamp);
      if (!weekly[week]) weekly[week] = {};
      weekly[week][h.genre] = (weekly[week][h.genre] || 0) + (h.playCount || 1);
    });

    res.status(200).json({ daily, weekly });
  } catch (err) {
    console.error("Genre trend error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   SERVE REACT FRONTEND
======================= */
const frontendPath = path.join(__dirname, "../melodymind-frontend/dist");

// Only serve frontend if build exists
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // Catch-all to serve index.html for SPA routes (except /api and /uploads)
  app.get(/^\/(?!api|uploads).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  console.warn("⚠️ Frontend dist folder not found. Skipping frontend serving.");
}

/* =======================
   SERVER START
======================= */
app.listen(port, () =>
  console.log(`🚀 Server running on port ${port}`)
);

/* =======================
   SERVER START
======================= */
app.listen(port, () =>
  console.log(`🚀 Server running on port ${port}`)
);
// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { spawnSync } = require("child_process");

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors({ origin: "*" })); // Allow all origins
// app.use(express.json());

// // MongoDB Connection
// require("dotenv").config();
// const mongoURI = process.env.MONGO_URI;

// mongoose.connect(mongoURI)
//   .then(() => console.log("✅ MongoDB connected successfully"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // Schemas
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
// });

// const songSchema = new mongoose.Schema({
//   songId: { type: String, unique: true },
//   title: String,
//   artist: String,
//   mood: String,
//   genre: String,
//   url: String,
//   tempo: Number,
// });

// const userHistorySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   songId: String,
//   title: String,
//   mood: String,
//   genre: String,
//   playCount: { type: Number, default: 1 },
//   timestamp: { type: Date, default: Date.now },
// });

// const User = mongoose.model("User", userSchema);
// const Song = mongoose.model("Song", songSchema);
// const UserHistory = mongoose.model("UserHistory", userHistorySchema);

// // Upload Setup
// const uploadFolder = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadFolder),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });
// app.use("/uploads", express.static(uploadFolder));

// /* =======================
//    AUTH ENDPOINTS
// ======================= */
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//       return res.status(400).json({ message: "All fields are required" });

//     const existingUser = await User.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ message: "Email already registered" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, password: hashedPassword });
//     await user.save();

//     res.status(201).json({ user: { id: user._id, name, email } });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Email and password required" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(400).json({ message: "Invalid email or password" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid email or password" });

//     res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* =======================
//    SONG UPLOAD & DETECTION
// ======================= */
// app.post("/api/upload", upload.array("songs"), async (req, res) => {
//   try {
//     const files = req.files;
//     if (!files || files.length === 0)
//       return res.status(400).json({ message: "No files uploaded" });

//     const savedSongs = [];
//     const pythonScriptPath = path.join(__dirname, "mood_genre_detect.py");
//     const pythonCommand = "python3";

//     for (const file of files) {
//       let mood = "Neutral";
//       let genre = "Unknown";
//       let tempo = 0;

//       try {
//         const pyResult = spawnSync(pythonCommand, [pythonScriptPath, file.path], {
//           encoding: "utf-8",
//           stdio: "pipe"
//         });

//         // Log Python errors
//         if (pyResult.error) {
//           console.error("SpawnSync error:", pyResult.error);
//         }

//         if (pyResult.stderr && pyResult.stderr.trim()) {
//           console.error("Python stderr:", pyResult.stderr.trim());
//         }

//         if (pyResult.stdout && pyResult.stdout.trim()) {
//           try {
//             const parsed = JSON.parse(pyResult.stdout.trim());
//             mood = parsed.mood || "Neutral";
//             genre = parsed.genre || "Unknown";
//             tempo = parsed.tempo || 0;

//             if (parsed.error) console.warn("Python script returned error:", parsed.error);
//           } catch (e) {
//             console.error("JSON parse error:", e, "Raw output:", pyResult.stdout);
//           }
//         } else {
//           console.warn("Python stdout empty for file:", file.originalname);
//         }
//       } catch (e) {
//         console.error("Python detection error:", e);
//       }

//       // Save song to MongoDB
//       const song = new Song({
//         songId: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
//         title: file.originalname.replace(/\.[^/.]+$/, ""),
//         artist: "Local File",
//         mood,
//         genre,
//         url: `/uploads/${file.filename}`,
//         tempo,
//       });

//       await song.save();
//       savedSongs.push(song);
//     }

//     res.status(200).json(savedSongs);
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ message: "Upload failed" });
//   }
// });

// /* =======================
//    SONG RETRIEVAL & DELETE
// ======================= */
// app.get("/api/songs", async (req, res) => {
//   try {
//     const songs = await Song.find({}).sort({ _id: -1 });
//     res.status(200).json(songs);
//   } catch (err) {
//     console.error("Get songs error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.delete("/api/delete-song/:songId", async (req, res) => {
//   try {
//     const { songId } = req.params;
//     const song = await Song.findOne({ songId });
//     if (!song) return res.status(404).json({ message: "Song not found" });

//     await Song.deleteOne({ songId });

//     const filePath = path.join(__dirname, song.url);
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//     res.status(200).json({ message: "✅ Song removed successfully" });
//   } catch (err) {
//     console.error("❌ Failed to remove song:", err);
//     res.status(500).json({ message: "Failed to remove song" });
//   }
// });

// /* =======================
//    FACE MOOD-BASED RECOMMENDATIONS
// ======================= */
// app.get("/api/recommend-face", async (req, res) => {
//   const { mood } = req.query;

//   try {
//     const allSongs = await Song.find({});
//     if (!allSongs || allSongs.length === 0) return res.json([]);

//     let filtered = allSongs.filter(
//       (song) => song.mood?.toLowerCase() === mood?.toLowerCase()
//     );

//     if (filtered.length === 0) {
//       const moodMap = {
//         happy: ["Energetic", "Calm"],
//         sad: ["Calm", "Neutral"],
//         neutral: ["Pop", "Classical"],
//         energetic: ["Hip-Hop", "Electronic"],
//         calm: ["Jazz", "Classical"],
//       };
//       const related = moodMap[mood?.toLowerCase()] || [];
//       filtered = allSongs.filter((song) => related.includes(song.mood));
//     }

//     if (filtered.length > 1 && filtered.some((s) => s.tempo)) {
//       const avgTempo =
//         filtered.reduce((sum, s) => sum + (s.tempo || 0), 0) / filtered.length;
//       filtered = filtered.sort(
//         (a, b) =>
//           Math.abs((a.tempo || 0) - avgTempo) -
//           Math.abs((b.tempo || 0) - avgTempo)
//       );
//     }

//     if (filtered.length === 0) filtered = allSongs.sort(() => 0.5 - Math.random());

//     res.json(filtered.slice(0, 5));
//   } catch (error) {
//     console.error("Error recommending songs:", error);
//     res.json([]);
//   }
// });

// /* =======================
//    USER HISTORY & GENRE ANALYTICS
// ======================= */
// app.post("/api/log-song", async (req, res) => {
//   try {
//     const { userId, songId } = req.body;
//     if (!userId || !songId)
//       return res.status(400).json({ message: "User ID and Song ID required" });

//     const song = await Song.findOne({ songId });
//     if (!song) return res.status(404).json({ message: "Song not found" });

//     let historyEntry = await UserHistory.findOne({ userId, songId });
//     if (historyEntry) {
//       historyEntry.playCount = (historyEntry.playCount || 1) + 1;
//       historyEntry.timestamp = new Date();
//       await historyEntry.save();
//     } else {
//       historyEntry = new UserHistory({
//         userId,
//         songId,
//         title: song.title,
//         mood: song.mood,
//         genre: song.genre,
//         playCount: 1,
//         timestamp: new Date(),
//       });
//       await historyEntry.save();
//     }

//     res.status(200).json({ message: "Song logged successfully" });
//   } catch (err) {
//     console.error("Log song error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.get("/api/user-history/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { limit = 10, sort = "-timestamp", genre } = req.query;
//     const query = { userId };
//     if (genre) query.genre = genre;

//     const history = await UserHistory.find(query)
//       .sort(sort)
//       .limit(parseInt(limit));

//     res.status(200).json(history);
//   } catch (error) {
//     console.error("User history error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.get("/api/genre-trends/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const history = await UserHistory.find({ userId });

//     if (!history || history.length === 0) return res.status(200).json({ daily: {}, weekly: {} });

//     const daily = {};
//     history.forEach((h) => {
//       const day = new Date(h.timestamp).toISOString().split("T")[0];
//       if (!daily[day]) daily[day] = {};
//       daily[day][h.genre] = (daily[day][h.genre] || 0) + (h.playCount || 1);
//     });

//     const getWeek = (date) => {
//       const d = new Date(date);
//       const oneJan = new Date(d.getFullYear(), 0, 1);
//       const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
//       return `${d.getFullYear()}-W${week}`;
//     };

//     const weekly = {};
//     history.forEach((h) => {
//       const week = getWeek(h.timestamp);
//       if (!weekly[week]) weekly[week] = {};
//       weekly[week][h.genre] = (weekly[week][h.genre] || 0) + (h.playCount || 1);
//     });

//     res.status(200).json({ daily, weekly });
//   } catch (err) {
//     console.error("Genre trend error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* =======================
//    SERVE REACT FRONTEND
// ======================= */
// /* =======================
//    SERVE REACT FRONTEND
// ======================= */
// const frontendPath = path.join(__dirname, "../melodymind-frontend/dist");

// // Only serve frontend if build exists
// if (fs.existsSync(frontendPath)) {
//   app.use(express.static(frontendPath));

//   // Catch-all to serve index.html for SPA routes (except /api)
//   app.get(/^\/(?!api).*/, (req, res) => {
//     res.sendFile(path.join(frontendPath, "index.html"));
//   });
// } else {
//   console.warn("⚠️ Frontend dist folder not found. Skipping frontend serving.");
// }


// /* =======================
//    SERVER START
// ======================= */
// app.listen(port, () =>
//   console.log(`🚀 Server running on port ${port}`)
// );

// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { spawn } = require("child_process");

// const app = express();
// const port = process.env.PORT||5000;

// // Middleware
// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());

// // MongoDB Connection
// // const mongoose = require("mongoose");
// require("dotenv").config();  // Make sure dotenv is installed

// const mongoURI = process.env.MONGO_URI;

// mongoose.connect(mongoURI)
//   .then(() => console.log("✅ MongoDB connected successfully"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // Schemas
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
// });

// const songSchema = new mongoose.Schema({
//   songId: { type: String, unique: true },
//   title: String,
//   artist: String,
//   mood: String,
//   genre: String,
//   url: String,
//   tempo: Number,
// });

// const userHistorySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   songId: String,
//   title: String,
//   mood: String,
//   genre: String,
//   timestamp: { type: Date, default: Date.now },
// });

// const User = mongoose.model("User", userSchema);
// const Song = mongoose.model("Song", songSchema);
// const UserHistory = mongoose.model("UserHistory", userHistorySchema);

// // Upload Setup
// const uploadFolder = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadFolder),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });
// app.use("/uploads", express.static(uploadFolder));

// /* =======================
//    AUTH ENDPOINTS
// ======================= */

// // Signup
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//       return res.status(400).json({ message: "All fields are required" });

//     const existingUser = await User.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ message: "Email already registered" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, password: hashedPassword });
//     await user.save();

//     res.status(201).json({ user: { id: user._id, name, email } });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Login
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Email and password required" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(400).json({ message: "Invalid email or password" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid email or password" });

//     res.status(200).json({
//       user: { id: user._id, name: user.name, email: user.email },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* =======================
//    SONG UPLOAD & DETECTION
// ======================= */
// app.post("/api/upload", upload.array("songs"), async (req, res) => {
//   try {
//     const files = req.files;
//     if (!files || files.length === 0)
//       return res.status(400).json({ message: "No files uploaded" });

//     const savedSongs = [];

//     for (const file of files) {
//       const filePath = file.path;
//       const pythonScriptPath = path.join(__dirname, "mood_genre_detect.py");

//       // Run the Python detection script
//       const { spawnSync } = require("child_process");
//       const pyResult = spawnSync("python", [pythonScriptPath, filePath]);

//       let mood = "Neutral";
//       let genre = "Unknown";
//       let tempo = 0;

//       try {
//         const output = pyResult.stdout.toString().trim();
//         const parsed = JSON.parse(output);
//         mood = parsed.mood;
//         genre = parsed.genre;
//         tempo = parsed.tempo;
//       } catch (e) {
//         console.error("Python parse error:", e);
//       }

//       const song = new Song({
//         songId: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
//         title: file.originalname.replace(/\.[^/.]+$/, ""),
//         artist: "Local File",
//         mood,
//         genre,
//         url: `/uploads/${file.filename}`,
//         tempo,
//       });

//       await song.save();
//       savedSongs.push(song);
//     }

//     res.status(200).json(savedSongs);
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ message: "Upload failed" });
//   }
// });


// // app.post("/api/upload", upload.array("songs"), async (req, res) => {
// //   try {
// //     const files = req.files;
// //     if (!files || files.length === 0)
// //       return res.status(400).json({ message: "No files uploaded" });

// //     const savedSongs = [];

// //     for (const file of files) {
// //       const filePath = file.path;
// //       const pythonScriptPath = path.join(__dirname, "mood_genre_detect.py");

// //       // Run Python detection script
// //       const pyDetect = spawn("python", [pythonScriptPath, filePath]);

// //       const { mood, genre, tempo } = await new Promise((resolve) => {
// //         let dataString = "";
// //         pyDetect.stdout.on("data", (data) => (dataString += data.toString()));
// //         pyDetect.stderr.on("data", (err) =>
// //           console.error("Python error:", err.toString())
// //         );
// //         pyDetect.on("close", () => {
// //           try {
// //             resolve(JSON.parse(dataString));
// //           } catch {
// //             resolve({ mood: "Neutral", genre: "Unknown", tempo: null });
// //           }
// //         });
// //       });

// //       const song = new Song({
// //         songId: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
// //         title: file.originalname.replace(/\.[^/.]+$/, ""),
// //         artist: "Local File",
// //         mood,
// //         genre,
// //         url: `/uploads/${file.filename}`,
// //         tempo,
// //       });

// //       await song.save();
// //       savedSongs.push(song);
// //     }

// //     res.status(200).json(savedSongs);
// //   } catch (err) {
// //     console.error("Upload error:", err);
// //     res.status(500).json({ message: "Upload failed" });
// //   }
// // });

// /* =======================
//    SONG RETRIEVAL & DELETE
// ======================= */

// // Get All Songs
// app.get("/api/songs", async (req, res) => {
//   try {
//     const songs = await Song.find({}).sort({ _id: -1 });
//     res.status(200).json(songs);
//   } catch (err) {
//     console.error("Get songs error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Delete Song by songId
// app.delete("/api/delete-song/:songId", async (req, res) => {
//   try {
//     const { songId } = req.params;
//     const song = await Song.findOne({ songId });

//     if (!song) {
//       return res.status(404).json({ message: "Song not found" });
//     }

//     // Remove from DB
//     await Song.deleteOne({ songId });

//     // Remove file from uploads folder
//     const filePath = path.join(__dirname, song.url);
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     res.status(200).json({ message: "✅ Song removed successfully" });
//   } catch (err) {
//     console.error("❌ Failed to remove song:", err);
//     res.status(500).json({ message: "Failed to remove song" });
//   }
// });
// /* =======================
//    MOOD-BASED RECOMMENDATIONS
// ======================= */
// /* =======================
//    FACE MOOD-BASED RECOMMENDATIONS
// ======================= */
// // =======================
// // FACE MOOD-BASED RECOMMENDATIONS
// // =======================
// app.get("/api/recommend-face", async (req, res) => {
//   const { mood } = req.query;

//   try {
//     // Fetch all songs from MongoDB
//     const allSongs = await Song.find({});

//     if (!allSongs || allSongs.length === 0) {
//       return res.json([]);
//     }

//     // Filter songs matching detected mood
//     let filtered = allSongs.filter(
//       (song) => song.mood?.toLowerCase() === mood?.toLowerCase()
//     );

//     // If no exact match, find related moods
//     if (filtered.length === 0) {
//       const moodMap = {
//         happy: ["Energetic", "Calm"],
//         sad: ["Calm", "Neutral"],
//         neutral: ["Pop", "Classical"],
//         energetic: ["Hip-Hop", "Electronic"],
//         calm: ["Jazz", "Classical"],
//       };
//       const related = moodMap[mood?.toLowerCase()] || [];
//       filtered = allSongs.filter((song) => related.includes(song.mood));
//     }

//     // ✅ Add tempo refinement logic here
//     if (filtered.length > 1 && filtered.some((s) => s.tempo)) {
//       const avgTempo =
//         filtered.reduce((sum, s) => sum + (s.tempo || 0), 0) / filtered.length;

//       filtered = filtered.sort(
//         (a, b) =>
//           Math.abs((a.tempo || 0) - avgTempo) -
//           Math.abs((b.tempo || 0) - avgTempo)
//       );
//     }

//     // If still no results, fallback to random songs
//     if (filtered.length === 0) {
//       filtered = allSongs.sort(() => 0.5 - Math.random());
//     }

//     // Return top 5 recommendations
//     res.json(filtered.slice(0, 5));
//   } catch (error) {
//     console.error("Error recommending songs:", error);
//     res.json([]);
//   }
// });

// /* =======================
//    USER HISTORY & GENRE ANALYTICS
// ======================= */

// // Log a song play
// app.post("/api/log-song", async (req, res) => {
//   try {
//     const { userId, songId } = req.body;
//     if (!userId || !songId) {
//       return res.status(400).json({ message: "User ID and Song ID required" });
//     }

//     const song = await Song.findOne({ songId });
//     if (!song) return res.status(404).json({ message: "Song not found" });

//     // Check if history entry exists
//     let historyEntry = await UserHistory.findOne({ userId, songId });

//     if (historyEntry) {
//       historyEntry.playCount = (historyEntry.playCount || 1) + 1;
//       historyEntry.timestamp = new Date();
//       await historyEntry.save();
//     } else {
//       historyEntry = new UserHistory({
//         userId,
//         songId,
//         title: song.title,
//         mood: song.mood,
//         genre: song.genre,
//         playCount: 1,
//         timestamp: new Date(),
//       });
//       await historyEntry.save();
//     }

//     res.status(200).json({ message: "Song logged successfully" });
//   } catch (err) {
//     console.error("Log song error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Fetch user listening history
// app.get("/api/user-history/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { limit = 10, sort = "-timestamp", genre } = req.query;

//     const query = { userId };
//     if (genre) query.genre = genre;

//     const history = await UserHistory.find(query)
//       .sort(sort)
//       .limit(parseInt(limit));

//     res.status(200).json(history);
//   } catch (error) {
//     console.error("User history error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Fetch user genre trends (daily + weekly)
// app.get("/api/genre-trends/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const history = await UserHistory.find({ userId });

//     if (!history || history.length === 0) {
//       return res.status(200).json({ daily: {}, weekly: {} });
//     }

//     // Group by day
//     const daily = {};
//     history.forEach((h) => {
//       const day = new Date(h.timestamp).toISOString().split("T")[0];
//       if (!daily[day]) daily[day] = {};
//       daily[day][h.genre] = (daily[day][h.genre] || 0) + (h.playCount || 1);
//     });

//     // Helper to get week ID like "2025-W41"
//     const getWeek = (date) => {
//       const d = new Date(date);
//       const oneJan = new Date(d.getFullYear(), 0, 1);
//       const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
//       return `${d.getFullYear()}-W${week}`;
//     };

//     // Group by week
//     const weekly = {};
//     history.forEach((h) => {
//       const week = getWeek(h.timestamp);
//       if (!weekly[week]) weekly[week] = {};
//       weekly[week][h.genre] = (weekly[week][h.genre] || 0) + (h.playCount || 1);
//     });

//     res.status(200).json({ daily, weekly });
//   } catch (err) {
//     console.error("Genre trend error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* =======================
//    SERVER START
// ======================= */
// app.listen(port, () =>
//   console.log(`🚀 Server running on http://localhost:${port}`)
// );
