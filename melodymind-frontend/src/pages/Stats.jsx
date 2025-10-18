
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Stats({ user }) {
  const [recentPlays, setRecentPlays] = useState([]);
  const [genreStats, setGenreStats] = useState([]);
  const [moodStats, setMoodStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const userId = user?.id || 'guest';
        console.log('🔍 Fetching stats for user:', userId);

        const recentResponse = await axios.get(
          `http://localhost:5000/api/user-history/${userId}?limit=50&sort=-timestamp`
        );
        console.log('📊 Recent plays response:', recentResponse.data);
        setRecentPlays(recentResponse.data || []);

        const genreData = calculateGenreStats(recentResponse.data || []);
        const moodData = calculateMoodStats(recentResponse.data || []);
        setGenreStats(genreData);
        setMoodStats(moodData);
      } catch (err) {
        console.error('❌ Failed to fetch stats:', err);
        setError('Failed to load listening history. Make sure your backend server is running on port 5000');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // 🎵 Calculate genre statistics
  const calculateGenreStats = (plays) => {
    const genreCounts = {};
    plays.forEach(play => {
      const genre = play.genre || 'Unknown';
      genreCounts[genre] = (genreCounts[genre] || 0) + (play.playCount || 1);
    });

    return Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
  };

  // 😊 Calculate mood statistics
  const calculateMoodStats = (plays) => {
    const moodCounts = {};
    plays.forEach(play => {
      const mood = play.mood || 'Neutral';
      moodCounts[mood] = (moodCounts[mood] || 0) + (play.playCount || 1);
    });

    return Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  };

  // 🎨 Styles
  const styles = {
    appMain: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      backgroundColor: '#0B1221',
      color: '#fff',
      padding: '40px',
    },
    card: {
      backgroundColor: '#141C2F',
      borderRadius: '16px',
      padding: '30px',
      width: '100%',
      maxWidth: '900px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    },
    mainTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    muted: {
      color: '#aaa',
      marginBottom: '25px',
    },
    section: {
      marginTop: '20px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
    },
    statItem: {
      backgroundColor: '#1E2746',
      borderRadius: '10px',
      padding: '15px',
      textAlign: 'center',
    },
    statNumber: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    statLabel: {
      color: '#aaa',
      fontSize: '14px',
      marginTop: '5px',
    },
    genreBarContainer: {
      marginTop: '20px',
    },
    genreBar: {
      height: '10px',
      borderRadius: '5px',
      backgroundColor: '#4CAF50',
    },
    moodChart: {
      marginTop: '30px',
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      background: '#333',
      margin: 'auto',
    },
  };

  const moodColors = {
    Happy: '#4CAF50',
    Sad: '#2196F3',
    Neutral: '#FFC107',
    Energetic: '#FF5722',
    Calm: '#9C27B0',
    Romantic: '#E91E63',
    Angry: '#F44336',
    Relaxed: '#00BCD4',
    Excited: '#FF9800',
    Melancholic: '#607D8B'
  };

  // 🥧 Generate Pie Chart Data
  const generatePieChartData = () => {
    const total = moodStats.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return { conicGradient: '', data: [] };

    let currentAngle = 0;
    const data = moodStats.map(item => {
      const percentage = (item.count / total) * 100;
      const angle = (percentage / 100) * 360;
      const color = moodColors[item.mood] || '#666666';
      const segment = {
        ...item,
        percentage,
        color,
        startAngle: currentAngle,
        endAngle: currentAngle + angle
      };
      currentAngle += angle;
      return segment;
    });

    const conicGradient = data
      .map(item => `${item.color} ${item.startAngle}deg ${item.endAngle}deg`)
      .join(', ');

    return { conicGradient, data };
  };

  const getMoodAnalysis = () => {
    if (moodStats.length === 0)
      return "Start listening to music to see your mood analysis!";

    const topMood = moodStats[0];
    const total = moodStats.reduce((sum, item) => sum + item.count, 0);
    const topPercentage = Math.round((topMood.count / total) * 100);

    const analysisMap = {
      Happy: `You're mostly listening to happy music (${topPercentage}%), which suggests you're in a positive and upbeat mood!`,
      Sad: `Your listening habits show a preference for sad music (${topPercentage}%), indicating you might be reflective or emotional.`,
      Neutral: `Your music choices are mostly neutral (${topPercentage}%), showing balanced and calm listening preferences.`,
      Energetic: `You enjoy energetic music (${topPercentage}%), perfect for workouts and active moments!`,
      Calm: `Your preference for calm music (${topPercentage}%) suggests you value relaxation and peaceful moments.`,
      Romantic: `Romantic tunes dominate your playlist (${topPercentage}%), perfect for heartfelt moments.`,
    };

    return analysisMap[topMood.mood] ||
      `Your top mood is ${topMood.mood} (${topPercentage}%), shaping your unique listening experience.`;
  };

  if (loading) {
    return (
      <div style={styles.appMain}>
        <div style={styles.card}>
          <h2>Loading your listening history...</h2>
          <p>Fetching your music statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.appMain}>
        <div style={styles.card}>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalPlays = recentPlays.reduce((total, play) => total + (play.playCount || 1), 0);
  const { conicGradient } = generatePieChartData();
  const moodAnalysis = getMoodAnalysis();

  // helper to format time ago
  const timeAgo = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  return (
    <div className="home-content">
      <div className="stats-grid">
        {/* Left: Summary and Analysis */}
        <div className="card stats-compact">
          <h2>Your Listening History</h2>
          <p className="muted">View your recent plays, genre preferences, and mood analysis</p>

          {/* Listening Summary */}
          <div className="songs-header" style={{ marginTop: 8 }}>
            <h3>Listening Summary</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div className="badge" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{recentPlays.length}</div>
              <div className="small">Recent Plays</div>
            </div>
            <div className="badge" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{totalPlays}</div>
              <div className="small">Total Plays</div>
            </div>
            <div className="badge" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{genreStats.length}</div>
              <div className="small">Genres</div>
            </div>
            <div className="badge" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{moodStats.length}</div>
              <div className="small">Moods</div>
            </div>
          </div>

          {/* Top Genres */}
          <div className="songs-header" style={{ marginTop: 16 }}>
            <h3>Top Genres</h3>
          </div>
          {genreStats.map((g, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <p style={{ color: 'var(--text)', margin: 0 }}>{g.genre} ({g.count})</p>
              <div style={{ height: 10, borderRadius: 6, background: 'var(--accent)', width: `${(g.count / genreStats[0].count) * 100}%` }}></div>
            </div>
          ))}

          {/* Mood Analysis */}
          <div className="songs-header" style={{ marginTop: 16 }}>
            <h3>Mood Analysis</h3>
          </div>
          <div style={{ width: 180, height: 180, borderRadius: '50%', background: `conic-gradient(${conicGradient})`, margin: '0 auto' }}></div>
          <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>{moodAnalysis}</p>
        </div>

        {/* Right: Recent Plays */}
        <div className="card stats-compact">
          <div className="songs-header">
            <h3>Recent Plays</h3>
          </div>
          {Array.isArray(recentPlays) && recentPlays.length > 0 ? (
            <ul className="song-list">
              {recentPlays.map((play, idx) => {
                const song = play.song || play;
                const title = song.title || 'Unknown Title';
                const artist = song.artist || 'Unknown Artist';
                const mood = song.mood || play.mood || 'Neutral';
                const genre = song.genre || play.genre || 'Unknown';
                const when = play.timestamp || song.timestamp;
                return (
                  <li key={play.id || song.songId || idx} className="song-item">
                    <div className="song-left">
                      <div className="song-info">
                        <h4>{title} ({artist})</h4>
                        <p>🎵 Mood: {mood} | Genre: {genre}</p>
                      </div>
                    </div>
                    <div className="song-right">
                      <span className="badge">{timeAgo(when)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">No history yet. Start playing some songs!</p>
          )}
        </div>
      </div>
    </div>
  );
}
