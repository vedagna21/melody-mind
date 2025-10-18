// import React from 'react'
// import { Link } from 'react-router-dom'

// export default function Navbar() {
//   return (
//     <header className="navbar">
//       <h1 className="brand">MelodyMind</h1>
//       <nav>
//         <Link to="/">Home</Link>
//         <Link to="/library">Library</Link>
//         <Link to="/mood">Mood</Link>
//         <Link to="/search">Search</Link>
//         <Link to="/settings">Settings</Link>
//       </nav>
//     </header>
//   )
// }

import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div style={{flex:1}} />
      {user && (
        <button className="logout-pill" onClick={onLogout} title="Logout" aria-label="Logout" type="button">
          <FaSignOutAlt className="icon" />
          <span>Logout</span>
        </button>
      )}
    </header>
  );
}
