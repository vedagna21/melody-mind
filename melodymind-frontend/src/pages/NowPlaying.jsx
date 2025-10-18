// import { usePlayer } from '../context/PlayerContext.jsx'

// export default function NowPlaying() {
//   const { current, queue, currentIndex } = usePlayer()
//   return (
//     <div>
//       <h2>Now Playing</h2>
//       {current ? (
//         <>
//           <div className="card" style={{marginBottom:16}}>
//             <div style={{fontWeight:700, fontSize:18}}>{current.title}</div>
//             <div className="small">{current.artist} • {current.mood}</div>
//           </div>
//           <h3>Up Next</h3>
//           <div className="grid">
//             {queue.slice(currentIndex+1).map(s => (
//               <div key={s.id} className="card">{s.title} <span className="small">— {s.artist}</span></div>
//             ))}
//           </div>
//         </>
//       ) : <div>No track selected.</div>}
//     </div>
//   )
// }


import React from 'react'
export default function NowPlaying() {
  return <h2>Now Playing</h2>
}
