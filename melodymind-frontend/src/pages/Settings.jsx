// import { useState } from 'react'

// export default function Settings() {
//   const [voice, setVoice] = useState(false)
//   const [theme, setTheme] = useState('dark')

//   return (
//     <div>
//       <h2>Settings</h2>
//       <div className="card">
//         <div className="row">
//           <label style={{width:160}}>Voice Control</label>
//           <input type="checkbox" checked={voice} onChange={e => setVoice(e.target.checked)} />
//         </div>
//         <div className="row" style={{marginTop:12}}>
//           <label style={{width:160}}>Theme</label>
//           <select value={theme} onChange={e => setTheme(e.target.value)}>
//             <option value="dark">Dark</option>
//             <option value="system">System</option>
//           </select>
//         </div>
//       </div>
//     </div>
//   )
// }

import React from 'react'
export default function Settings() {
  return <h2>Settings</h2>
}
