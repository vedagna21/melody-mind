
// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const cors = require('cors');
// const app = express();
// const port = 5000;

// // Middleware
// app.use(cors({ origin: 'http://localhost:5173' }));
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/melodymind', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // User Schema
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// // Song Schema
// const songSchema = new mongoose.Schema({
//   songId: { type: String, required: true, unique: true },
//   title: { type: String, required: true },
//   artist: { type: String, required: true },
//   mood: { type: String, required: true },
//   genre: { type: String, required: true },
//   url: { type: String, required: true },   // 🔹 added
// });

// // User History Schema
// const userHistorySchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   songId: { type: String, required: true },
//   title: { type: String, required: true },
//   mood: { type: String, required: true },
//   genre: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
// });

// const User = mongoose.model('User', userSchema);
// const Song = mongoose.model('Song', songSchema);
// const UserHistory = mongoose.model('UserHistory', userHistorySchema);

// // Static Song Data (20 songs with varied moods)
// // const staticSongs = [
// //   { songId: "1", title: "Happy", artist: "Pharrell Williams", mood: "happy", genre: "Pop" },
// //   { songId: "2", title: "Walking on Sunshine", artist: "Katrina & The Waves", mood: "feel good", genre: "Pop" },
// //   { songId: "3", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", mood: "party", genre: "Funk" },
// //   { songId: "4", title: "Don't Stop Me Now", artist: "Queen", mood: "energetic", genre: "Rock" },
// //   { songId: "5", title: "Tears in Heaven", artist: "Eric Clapton", mood: "sad", genre: "Rock" },
// //   { songId: "6", title: "Yesterday", artist: "The Beatles", mood: "sad", genre: "Rock" },
// //   { songId: "7", title: "My Heart Will Go On", artist: "Celine Dion", mood: "romantic", genre: "Pop" },
// //   { songId: "8", title: "I Gotta Feeling", artist: "Black Eyed Peas", mood: "party", genre: "Hip Hop" },
// //   { songId: "9", title: "Good as Hell", artist: "Lizzo", mood: "feel good", genre: "Pop" },
// //   { songId: "10", title: "Shotgun", artist: "George Ezra", mood: "chill", genre: "Folk" },
// //   { songId: "11", title: "The Sweet Escape", artist: "Gwen Stefani", mood: "happy", genre: "Pop" },
// //   { songId: "12", title: "I Don't Wanna Wait", artist: "David Guetta, OneRepublic", mood: "energetic", genre: "EDM" },
// //   { songId: "13", title: "Players", artist: "Coi Leray", mood: "party", genre: "Hip Hop" },
// //   { songId: "14", title: "Crazy in Love", artist: "Beyoncé ft. Jay-Z", mood: "romantic", genre: "R&B" },
// //   { songId: "15", title: "We Found Love", artist: "Rihanna", mood: "feel good", genre: "EDM" },
// //   { songId: "16", title: "Shut Up and Dance", artist: "Walk the Moon", mood: "happy", genre: "Pop" },
// //   { songId: "17", title: "Dancing Queen", artist: "ABBA", mood: "party", genre: "Disco" },
// //   { songId: "18", title: "Simply the Best", artist: "Tina Turner", mood: "energetic", genre: "Rock" },
// //   { songId: "19", title: "Sh-Boom", artist: "The Crew Cuts", mood: "neutral", genre: "Doo-Wop" },
// //   { songId: "20", title: "Let's Go Crazy", artist: "Prince", mood: "party", genre: "Funk" },
// // ];
// const staticSongs = [
//   { songId: "1", title: "Happy", artist: "Pharrell Williams", mood: "happy", genre: "Pop", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
//   { songId: "2", title: "Walking on Sunshine", artist: "Katrina & The Waves", mood: "feel good", genre: "Pop", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
//   { songId: "3", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", mood: "party", genre: "Funk", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
//   // ... do same for other songs (just reuse soundhelix demo links for now)
// ];

// // Initialize Songs
// Song.countDocuments().then(count => {
//   if (count === 0) {
//     Song.insertMany(staticSongs)
//       .then(() => console.log('All 20 songs inserted'))
//       .catch(err => console.error('Error inserting songs:', err));
//   }
// });

// // Signup Endpoint
// app.post('/api/signup', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, password: hashedPassword });
//     await user.save();
//     res.status(201).json({ user: { id: user._id, name, email } });
//   } catch (error) {
//     console.error('Signup error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login Endpoint
// app.post('/api/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }
//     res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Log Song Listen Endpoint
// app.post('/api/log-song', async (req, res) => {
//   try {
//     const { userId, songId } = req.body;
//     if (!userId || !songId) {
//       return res.status(400).json({ message: 'User ID and Song ID are required' });
//     }
//     const song = await Song.findOne({ songId });
//     if (!song) {
//       return res.status(404).json({ message: 'Song not found' });
//     }
//     const historyEntry = new UserHistory({
//       userId,
//       songId,
//       title: song.title,
//       mood: song.mood,
//       genre: song.genre,
//     });
//     await historyEntry.save();
//     res.status(201).json({ message: 'Song listen logged' });
//   } catch (error) {
//     console.error('Log song error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get All Songs Endpoint
// app.get('/api/songs', async (req, res) => {
//   try {
//     const songs = await Song.find({}).limit(20); // Explicitly limit to 20 to match static data
//     res.status(200).json(songs);
//   } catch (error) {
//     console.error('Get songs error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get Songs by Mood Endpoint
// app.get('/api/songs/mood/:mood', async (req, res) => {
//   try {
//     const { mood } = req.params;
//     const songs = await Song.find({ mood });
//     if (songs.length === 0) {
//       // Fallback to all songs if no match
//       const allSongs = await Song.find({});
//       return res.status(200).json(allSongs);
//     }
//     res.status(200).json(songs);
//   } catch (error) {
//     console.error('Get songs by mood error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // New Search Songs Endpoint (FR-5.2)
// // Search Songs Endpoint
// app.get('/api/search/songs', async (req, res) => {
//   try {
//     const query = req.query.query?.toLowerCase() || '';
//     if (!query) return res.status(400).json({ message: 'Query parameter is required' });

//     const words = query.split(/\s+/);
//     const regexConditions = words.map(word => ({
//       $or: [
//         { title: { $regex: word, $options: 'i' } },
//         { artist: { $regex: word, $options: 'i' } },
//       ]
//     }));

//     const songs = await Song.find({ $and: regexConditions }).limit(20);
//     res.status(200).json({ songs });  // 🔹 wrap response
//   } catch (error) {
//     console.error('Search songs error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });



// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
// server.js
// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { spawn } = require("child_process");

// const app = express();
// const port = 5000;

// // Middleware
// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());

// // MongoDB Connection
// mongoose
//   .connect("mongodb://localhost:27017/melodymind", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ Connected to MongoDB"))
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

//     res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Upload Songs
// app.post("/api/upload", upload.array("songs"), async (req, res) => {
//   try {
//     const files = req.files;
//     if (!files || files.length === 0)
//       return res.status(400).json({ message: "No files uploaded" });

//     const savedSongs = [];

//     for (let file of files) {
//       const filePath = file.path;

//       // Run Python detection script
//       const pyDetect = spawn("python", ["mood_genre_detect.py", filePath]);

//       const { mood, genre, tempo } = await new Promise((resolve) => {
//         let dataString = "";
//         pyDetect.stdout.on("data", (data) => (dataString += data.toString()));
//         pyDetect.stderr.on("data", (err) => console.error(err.toString()));
//         pyDetect.on("close", () => {
//           try {
//             resolve(JSON.parse(dataString));
//           } catch {
//             resolve({ mood: "Neutral", genre: "Unknown", tempo: null });
//           }
//         });
//       });

//       const song = new Song({
//         songId: `local-${Date.now()}`,
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

// // Log Song Listen
// app.post("/api/log-song", async (req, res) => {
//   try {
//     const { userId, songId } = req.body;
//     if (!userId || !songId)
//       return res.status(400).json({ message: "User ID and Song ID required" });

//     const song = await Song.findOne({ songId });
//     if (!song) return res.status(404).json({ message: "Song not found" });

//     const historyEntry = new UserHistory({
//       userId,
//       songId,
//       title: song.title,
//       mood: song.mood,
//       genre: song.genre,
//     });

//     await historyEntry.save();
//     res.status(201).json({ message: "Song listen logged" });
//   } catch (error) {
//     console.error("Log song error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

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

// // Start Server
// app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const port = 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/melodymind", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
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
});

const userHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  songId: String,
  title: String,
  mood: String,
  genre: String,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Song = mongoose.model("Song", songSchema);
const UserHistory = mongoose.model("UserHistory", userHistorySchema);

// Upload Setup
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
app.use("/uploads", express.static(uploadFolder));

/* =======================
   AUTH ENDPOINTS
======================= */

// Signup
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

// Login
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

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
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
    if (!files || files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const savedSongs = [];

    for (const file of files) {
      const filePath = file.path;
      const pythonScriptPath = path.join(__dirname, "mood_genre_detect.py");

      // Run the Python detection script
      const { spawnSync } = require("child_process");
      const pyResult = spawnSync("python", [pythonScriptPath, filePath]);

      let mood = "Neutral";
      let genre = "Unknown";
      let tempo = 0;

      try {
        const output = pyResult.stdout.toString().trim();
        const parsed = JSON.parse(output);
        mood = parsed.mood;
        genre = parsed.genre;
        tempo = parsed.tempo;
      } catch (e) {
        console.error("Python parse error:", e);
      }

      const song = new Song({
        songId: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        title: file.originalname.replace(/\.[^/.]+$/, ""),
        artist: "Local File",
        mood,
        genre,
        url: `/uploads/${file.filename}`,
        tempo,
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


// app.post("/api/upload", upload.array("songs"), async (req, res) => {
//   try {
//     const files = req.files;
//     if (!files || files.length === 0)
//       return res.status(400).json({ message: "No files uploaded" });

//     const savedSongs = [];

//     for (const file of files) {
//       const filePath = file.path;
//       const pythonScriptPath = path.join(__dirname, "mood_genre_detect.py");

//       // Run Python detection script
//       const pyDetect = spawn("python", [pythonScriptPath, filePath]);

//       const { mood, genre, tempo } = await new Promise((resolve) => {
//         let dataString = "";
//         pyDetect.stdout.on("data", (data) => (dataString += data.toString()));
//         pyDetect.stderr.on("data", (err) =>
//           console.error("Python error:", err.toString())
//         );
//         pyDetect.on("close", () => {
//           try {
//             resolve(JSON.parse(dataString));
//           } catch {
//             resolve({ mood: "Neutral", genre: "Unknown", tempo: null });
//           }
//         });
//       });

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

/* =======================
   SONG RETRIEVAL & DELETE
======================= */

// Get All Songs
app.get("/api/songs", async (req, res) => {
  try {
    const songs = await Song.find({}).sort({ _id: -1 });
    res.status(200).json(songs);
  } catch (err) {
    console.error("Get songs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Song by songId
app.delete("/api/delete-song/:songId", async (req, res) => {
  try {
    const { songId } = req.params;
    const song = await Song.findOne({ songId });

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Remove from DB
    await Song.deleteOne({ songId });

    // Remove file from uploads folder
    const filePath = path.join(__dirname, song.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: "✅ Song removed successfully" });
  } catch (err) {
    console.error("❌ Failed to remove song:", err);
    res.status(500).json({ message: "Failed to remove song" });
  }
});
/* =======================
   MOOD-BASED RECOMMENDATIONS
======================= */
/* =======================
   FACE MOOD-BASED RECOMMENDATIONS
======================= */
// =======================
// FACE MOOD-BASED RECOMMENDATIONS
// =======================
app.get("/api/recommend-face", async (req, res) => {
  const { mood } = req.query;

  try {
    // Fetch all songs from MongoDB
    const allSongs = await Song.find({});

    if (!allSongs || allSongs.length === 0) {
      return res.json([]);
    }

    // Filter songs matching detected mood
    let filtered = allSongs.filter(
      (song) => song.mood?.toLowerCase() === mood?.toLowerCase()
    );

    // If no exact match, find related moods
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

    // ✅ Add tempo refinement logic here
    if (filtered.length > 1 && filtered.some((s) => s.tempo)) {
      const avgTempo =
        filtered.reduce((sum, s) => sum + (s.tempo || 0), 0) / filtered.length;

      filtered = filtered.sort(
        (a, b) =>
          Math.abs((a.tempo || 0) - avgTempo) -
          Math.abs((b.tempo || 0) - avgTempo)
      );
    }

    // If still no results, fallback to random songs
    if (filtered.length === 0) {
      filtered = allSongs.sort(() => 0.5 - Math.random());
    }

    // Return top 5 recommendations
    res.json(filtered.slice(0, 5));
  } catch (error) {
    console.error("Error recommending songs:", error);
    res.json([]);
  }
});

/* =======================
   USER HISTORY & GENRE ANALYTICS
======================= */

// Log a song play
app.post("/api/log-song", async (req, res) => {
  try {
    const { userId, songId } = req.body;
    if (!userId || !songId) {
      return res.status(400).json({ message: "User ID and Song ID required" });
    }

    const song = await Song.findOne({ songId });
    if (!song) return res.status(404).json({ message: "Song not found" });

    // Check if history entry exists
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

// Fetch user listening history
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

// Fetch user genre trends (daily + weekly)
app.get("/api/genre-trends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await UserHistory.find({ userId });

    if (!history || history.length === 0) {
      return res.status(200).json({ daily: {}, weekly: {} });
    }

    // Group by day
    const daily = {};
    history.forEach((h) => {
      const day = new Date(h.timestamp).toISOString().split("T")[0];
      if (!daily[day]) daily[day] = {};
      daily[day][h.genre] = (daily[day][h.genre] || 0) + (h.playCount || 1);
    });

    // Helper to get week ID like "2025-W41"
    const getWeek = (date) => {
      const d = new Date(date);
      const oneJan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${week}`;
    };

    // Group by week
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
   SERVER START
======================= */
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
