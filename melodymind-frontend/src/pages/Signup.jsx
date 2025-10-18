// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'

// export default function Signup({ onSignup }) {
//   const nav = useNavigate()
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [err, setErr] = useState('')

//   const submit = (e) => {
//     e.preventDefault()
//     setErr('')
//     if (!name || !email || !password) return setErr('All fields required')
//     const user = { id: Date.now(), name, email }
//     onSignup(user)
//     nav('/')
//   }

//   return (
//     <div className="auth-wrapper">
//       <div className="card auth-card">
//         <h2>Create account</h2>
//         <p className="small">Quick demo account — no email verification</p>

//         <form onSubmit={submit} className="auth-form">
//           <label>Name</label>
//           <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
//           <label>Email</label>
//           <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
//           <label>Password</label>
//           <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="min 5 chars" />
//           {err && <div className="form-error">{err}</div>}
//           <button className="btn" type="submit">Sign up</button>
//         </form>

//         <p style={{ marginTop: 12 }}>
//           Already registered? <Link to="/login">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   )
// }
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup({ onSignup }) {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!name || !email || !password) return setErr('All fields required');

    try {
      const response = await axios.post('http://localhost:5000/api/signup', {
        name,
        email,
        password,
      });
      const user = response.data.user;
      onSignup(user);
      nav('/');
    } catch (error) {
      setErr(error.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <h2>Create account</h2>
        <p className="small">Quick demo account — no email verification</p>
        <div className="auth-form">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
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
            placeholder="min 5 chars"
          />
          {err && <div className="form-error">{err}</div>}
          <button className="btn" onClick={submit}>
            Sign up
          </button>
        </div>
        <p style={{ marginTop: 12 }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}