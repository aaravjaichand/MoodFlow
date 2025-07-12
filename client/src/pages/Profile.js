import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, BarChart3, Music, Heart, Calendar, TrendingUp, Edit3, Save, Camera } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  // Mock data for demo
  const stats = {
    totalPlaylists: 12,
    totalSongs: 156,
    totalLikes: 89,
    favoriteMood: 'happy',
    averageMood: 'positive',
    weeklyStreak: 7,
    totalListeningTime: '24h 32m',
    topGenres: ['Pop', 'Rock', 'Alternative'],
    recentActivity: [
      { type: 'playlist_created', title: 'Happy Vibes', time: '2 hours ago' },
      { type: 'song_liked', title: 'Walking on Sunshine', time: '4 hours ago' },
      { type: 'mood_analyzed', mood: 'happy', time: '6 hours ago' },
      { type: 'playlist_shared', title: 'Chill Beats', time: '1 day ago' },
    ]
  };

  const moodHistory = [
    { date: 'Mon', mood: 'happy', intensity: 85 },
    { date: 'Tue', mood: 'sad', intensity: 45 },
    { date: 'Wed', mood: 'happy', intensity: 92 },
    { date: 'Thu', mood: 'neutral', intensity: 60 },
    { date: 'Fri', mood: 'happy', intensity: 78 },
    { date: 'Sat', mood: 'surprised', intensity: 88 },
    { date: 'Sun', mood: 'happy', intensity: 95 },
  ];

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#4facfe',
      sad: '#667eea',
      angry: '#fa709a',
      neutral: '#43e97b',
      surprised: '#f093fb'
    };
    return colors[mood] || '#667eea';
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      neutral: '😐',
      surprised: '😲'
    };
    return emojis[mood] || '😐';
  };

  const saveProfile = () => {
    setUser(prev => ({
      ...prev,
      name: editName,
      avatar: editAvatar
    }));
    setIsEditing(false);
    toast.success('Profile updated successfully! ✨');
  };

  const cancelEdit = () => {
    setEditName(user.name);
    setEditAvatar(user.avatar);
    setIsEditing(false);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ marginBottom: '32px', textAlign: 'center' }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '16px',
          }}>
            Your Profile
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
          }}>
            Manage your account and view your music journey
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '3rem',
              color: 'white',
              fontWeight: '600',
            }}>
              {user.avatar || user.name.charAt(0).toUpperCase()}
            </div>

            {isEditing ? (
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input"
                  style={{ marginBottom: '16px' }}
                  placeholder="Enter your name"
                />
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="input"
                  placeholder="Enter avatar emoji"
                />
              </div>
            ) : (
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '8px',
              }}>
                {user.name}
              </h2>
            )}

            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              marginBottom: '24px',
            }}>
              Music Enthusiast
            </p>

            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
            }}>
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary"
                    onClick={saveProfile}
                  >
                    <Save size={16} />
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-secondary"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 size={16} />
                  Edit Profile
                </motion.button>
              )}
            </div>

            {/* Quick Stats */}
            <div style={{
              marginTop: '32px',
              padding: '24px 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '4px',
                  }}>
                    {stats.totalPlaylists}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>
                    Playlists
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '4px',
                  }}>
                    {stats.totalLikes}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>
                    Likes
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <Music size={24} color="white" />
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px',
                }}>
                  {stats.totalSongs}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}>
                  Songs Listened
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <TrendingUp size={24} color="white" />
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px',
                }}>
                  {stats.weeklyStreak}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}>
                  Day Streak
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <Calendar size={24} color="white" />
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px',
                }}>
                  {stats.totalListeningTime}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}>
                  Listening Time
                </div>
              </div>
            </div>

            {/* Mood History Chart */}
            <div className="card">
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <BarChart3 size={20} />
                Weekly Mood History
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'end',
                gap: '8px',
                height: '120px',
                padding: '16px 0',
              }}>
                {moodHistory.map((day, index) => (
                  <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: `${day.intensity}%`,
                      background: `linear-gradient(135deg, ${getMoodColor(day.mood)} 0%, ${getMoodColor(day.mood)}dd 100%)`,
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '8px',
                      minHeight: '20px',
                    }} />
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}>
                      {day.date}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      marginTop: '4px',
                    }}>
                      {getMoodEmoji(day.mood)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Calendar size={20} />
                Recent Activity
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      color: 'white',
                    }}>
                      {activity.type === 'playlist_created' && '🎵'}
                      {activity.type === 'song_liked' && '❤️'}
                      {activity.type === 'mood_analyzed' && '😊'}
                      {activity.type === 'playlist_shared' && '📤'}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.9rem',
                        color: 'white',
                        fontWeight: '500',
                      }}>
                        {activity.type === 'playlist_created' && `Created playlist "${activity.title}"`}
                        {activity.type === 'song_liked' && `Liked "${activity.title}"`}
                        {activity.type === 'mood_analyzed' && `Analyzed mood: ${activity.mood}`}
                        {activity.type === 'playlist_shared' && `Shared "${activity.title}"`}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Genres */}
            <div className="card">
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Music size={20} />
                Top Genres
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                {stats.topGenres.map((genre, index) => (
                  <motion.div
                    key={genre}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    {genre}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;