// import React from 'react'
// import { Link } from 'react-router-dom'
// import { FaHome, FaMusic, FaList, FaPlayCircle } from 'react-icons/fa'

// export default function Sidebar() {
//   return (
//     <aside className="sidebar">
//       <h2 className="sidebar-title">Browse</h2>
//       <ul className="sidebar-menu">
//         <li>
//           <Link to="/">
//             <FaHome className="icon" /> Home
//           </Link>
//         </li>
//         <li>
//           <Link to="/library">
//             <FaMusic className="icon" /> Your Library
//           </Link>
//         </li>
//         <li>
//           <Link to="/playlist/demo">
//             <FaList className="icon" /> Playlist
//           </Link>
//         </li>
//         <li>
//           <Link to="/now">
//             <FaPlayCircle className="icon" /> Now Playing
//           </Link>
//         </li>
//       </ul>
//     </aside>
//   )
// }

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaList, FaHeart, FaHistory } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Browse</h2>
      <ul className="sidebar-menu">
        <li>
          <Link to="/">
            <FaHome className="icon" /> Home
          </Link>
        </li>
        <li>
          <Link to="/playlist">
            <FaList className="icon" /> Smart Playlist
          </Link>
        </li>
        <li>
          <Link to="/favorites">
            <FaHeart className="icon" /> Favorites
          </Link>
        </li>
        <li>
          <Link to="/history">
            <FaHistory className="icon" /> History
          </Link>
        </li>
      </ul>
      <div style={{marginTop:16,borderTop:'1px solid var(--glass-border)',paddingTop:12,color:'var(--muted)',fontSize:13}}>
        <div>© MelodyMind</div>
        <div style={{marginTop:6}}>Built with ❤️ for music lovers</div>
      </div>
    </aside>
  );
}
