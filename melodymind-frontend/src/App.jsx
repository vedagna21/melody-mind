
// import React, { useEffect, useState } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login.jsx';
// import Signup from './pages/Signup.jsx';
// import Home from './pages/Home.jsx';
// import Library from './pages/Library.jsx';
// import NowPlaying from './pages/NowPlaying.jsx';
// import Playlist from './pages/Playlist.jsx';
// import Search from './pages/Search.jsx';
// import Settings from './pages/Settings.jsx';
// import Layout from './components/Layout.jsx';
// import MoodDetect from './pages/MoodDetect.jsx';
// import Stats from './pages/Stats.jsx'
// import Favorites from "./pages/Favorites";


// const AUTH_KEY = 'melodymind_user';

// export default function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const raw = localStorage.getItem(AUTH_KEY);
//     if (raw) {
//       try {
//         const data = JSON.parse(raw);
//         setUser(data.user || null);
//       } catch {
//         setUser(null);
//       }
//     }
//   }, []);

//   const doLogin = (userObj) => {
//     localStorage.setItem(AUTH_KEY, JSON.stringify({ user: userObj }));
//     setUser(userObj);
//   };

//   const doLogout = () => {
//     localStorage.removeItem(AUTH_KEY);
//     setUser(null);
//   };

//   return (
//     <Routes>
//       {/* Auth routes */}
//       <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={doLogin} />} />
//       <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup onSignup={doLogin} />} />

//       {/* Protected routes with Layout */}
//       <Route element={<Layout user={user} onLogout={doLogout} />}>
//         <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" replace />} />
//         <Route path="/library" element={user ? <Library /> : <Navigate to="/login" replace />} />
//         <Route path="/now" element={user ? <NowPlaying /> : <Navigate to="/login" replace />} />
//         <Route path="/playlist/:id" element={user ? <Playlist /> : <Navigate to="/login" replace />} />
//         <Route path="/search" element={user ? <Search /> : <Navigate to="/login" replace />} />
//         <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" replace />} />
//         <Route path="/history" element={user ? <Stats user={user} /> : <Navigate to="/login" replace />} />
//         <Route path="/favorites" element={<Favorites />} />

//         {/* Mood Detection page */}
//         <Route path="/mood" element={user ? <MoodDetect user={user} /> : <Navigate to="/login" replace />} />
//       </Route>

//       {/* Fallback */}
//       <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
//     </Routes>
//   );
// }

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Library from './pages/Library.jsx';
import NowPlaying from './pages/NowPlaying.jsx';
import Playlist from './pages/Playlist.jsx';
import Search from './pages/Search.jsx';
import Settings from './pages/Settings.jsx';
import Layout from './components/Layout.jsx';
import MoodDetect from './pages/MoodDetect.jsx';
import Stats from './pages/Stats.jsx'
import Favorites from "./pages/Favorites";

const AUTH_KEY = 'melodymind_user';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setUser(data.user || null);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const doLogin = (userObj) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user: userObj }));
    setUser(userObj);
  };

  const doLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={doLogin} />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup onSignup={doLogin} />} />

      {/* Protected routes with Layout */}
      <Route element={<Layout user={user} onLogout={doLogout} />}>
        <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/library" element={user ? <Library /> : <Navigate to="/login" replace />} />
        <Route path="/now" element={user ? <NowPlaying /> : <Navigate to="/login" replace />} />
        
        {/* ✅ Smart Playlist + Sidebar Playlist both go here */}
        <Route path="/playlist" element={user ? <Playlist /> : <Navigate to="/login" replace />} />
        
        <Route path="/playlist/:id" element={user ? <Playlist /> : <Navigate to="/login" replace />} />
        <Route path="/search" element={user ? <Search /> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" replace />} />
        <Route path="/history" element={user ? <Stats user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/favorites" element={<Favorites />} />

        {/* Mood Detection page */}
        <Route path="/mood" element={user ? <MoodDetect user={user} /> : <Navigate to="/login" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}