// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'

// export default function Login({ onLogin }) {
//   const nav = useNavigate()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [err, setErr] = useState('')

//   const submit = (e) => {
//     e.preventDefault()
//     setErr('')
//     if (!email || !password) return setErr('Enter email and password')
//     const user = { id: Date.now(), name: email.split('@')[0], email }
//     onLogin(user)
//     nav('/')
//   }

//   return (
//     <div className="auth-wrapper">
//       <div className="card auth-card">
//         <h2>Welcome back</h2>
//         <p className="small">Sign in to access your MelodyMind</p>

//         <form onSubmit={submit} className="auth-form">
//           <label>Email</label>
//           <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
//           <label>Password</label>
//           <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
//           {err && <div className="form-error">{err}</div>}
//           <button className="btn" type="submit">Login</button>
//         </form>

//         <p style={{ marginTop: 12 }}>
//           New here? <Link to="/signup">Create an account</Link>
//         </p>
//       </div>
//     </div>
//   )
// }
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login({ onLogin }) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) return setErr('Enter email and password');

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });
      const user = response.data.user;
      onLogin(user);
      nav('/');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <h2>Welcome back</h2>
        <p className="small">Sign in to access your MelodyMind</p>
        <div className="auth-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
          {err && <div className="form-error">{err}</div>}
          <button className="btn" onClick={submit}>
            Login
          </button>
        </div>
        <p style={{ marginTop: 12 }}>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}