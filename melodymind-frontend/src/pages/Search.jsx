// import { useState } from 'react'
// import { api } from '../services/api.jsx'
// import SongCard from '../components/SongCard.jsx'

// export default function Search() {
//   const [q, setQ] = useState('')
//   const [res, setRes] = useState([])

//   const onSubmit = async (e) => {
//     e.preventDefault()
//     const r = await api.search(q)
//     setRes(r)
//   }

//   return (
//     <div>
//       <h2>Search</h2>
//       <form onSubmit={onSubmit} className="row" style={{marginTop:8}}>
//         <input className="searchbar" placeholder="Search songs or artists…" value={q} onChange={e => setQ(e.target.value)} />
//         <button className="btn" type="submit">Search</button>
//       </form>
//       <div className="grid songs" style={{marginTop:16}}>
//         {res.map(s => <SongCard key={s.id} song={s} list={res} />)}
//       </div>
//     </div>
//   )
// }


import React from 'react'
export default function Search() {
  return <h2>Search</h2>
}
