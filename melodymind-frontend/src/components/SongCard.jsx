import { usePlayer } from '../context/PlayerContext.jsx'

export default function SongCard({ song, list }) {
  const { playSong } = usePlayer()
  return (
    <div className="card song-item">
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{width:56,height:56,borderRadius:8,background:'linear-gradient(90deg,var(--accent),var(--accent-2))'}} />
        <div>
          <div style={{fontWeight:700}}>{song.title}</div>
          <div className="small">{song.artist} • {song.mood}</div>
        </div>
      </div>
      <div className="row" style={{marginTop:10,justifyContent:'flex-end'}}>
        <button className="play-btn" onClick={() => playSong(song, list)}>Play</button>
        <span className="badge">{Math.floor(song.duration/60)}:{String(song.duration%60).padStart(2,'0')}</span>
      </div>
    </div>
  )
}


