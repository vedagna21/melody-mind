// Frontend-only mock API so the app runs without a backend.
// If you later have a backend, set USE_BACKEND=true and customize endpoints.

import { mockSongs, mockPlaylists } from './mockData.jsx'

const USE_BACKEND = false
const BASE_URL = 'http://localhost:5000' // replace when backend is ready

export const api = {
  async getSongs() {
    if (!USE_BACKEND) return mockSongs
    const r = await fetch(`${BASE_URL}/songs`); return r.json()
  },
  async getPlaylists() {
    if (!USE_BACKEND) return mockPlaylists
    const r = await fetch(`${BASE_URL}/playlists`); return r.json()
  },
  async getPlaylistById(id) {
    if (!USE_BACKEND) {
      const p = mockPlaylists.find(x => x.id === id)
      const songs = (p?.songIds || []).map(id => mockSongs.find(s => s.id === id)).filter(Boolean)
      return { ...p, songs }
    }
    const r = await fetch(`${BASE_URL}/playlists/${id}`); return r.json()
  },
  async detectMood() {
    if (!USE_BACKEND) {
      const moods = ['Happy','Calm','Energetic','Sad']
      const mood = moods[Math.floor(Math.random()*moods.length)]
      return { mood, confidence: Number((Math.random()*0.4+0.6).toFixed(2)) }
    }
    const r = await fetch(`${BASE_URL}/detect_mood`, { method: 'POST' })
    return r.json()
  },
  async search(query) {
    if (!USE_BACKEND) {
      const q = query.toLowerCase()
      return mockSongs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
    }
    const r = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`); return r.json()
  }
}


