
// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { api } from '../services/api.jsx'

// export default function Library() {
//   const [playlists, setPlaylists] = useState([])
//   useEffect(() => { api.getPlaylists().then(setPlaylists) }, [])

//   return (
//     <div>
//       <h2>Your Playlists</h2>
//       <div className="grid">
//         {playlists.map(p => (
//           <div key={p.id} className="card">
//             <div style={{fontWeight:700}}>{p.name}</div>
//             <div className="small">{p.description}</div>
//             <div className="row" style={{marginTop:10}}>
//               <Link className="btn" to={`/playlist/${p.id}`}>Open</Link>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
import React from 'react'
export default function Library() {
  return <h2>Library</h2>
}

