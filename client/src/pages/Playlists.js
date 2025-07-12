import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Heart, Share2, Play, Users, Clock, TrendingUp, Filter } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(UserContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    fetchPlaylists();

    if (socket) {
      socket.on('new-playlist', (playlist) => {
        setPlaylists(prev => [playlist, ...prev]);
        toast.success('New playlist created! 🎵');
      });
    }
  }, [socket]);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/playlists');
      if (response.data.success) {
        setPlaylists(response.data.playlists);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePlaylist = async (playlistId) => {
    try {
      const response = await axios.post(`http://localhost:5001/api/playlist/${playlistId}/like`);
      if (response.data.success) {
        setPlaylists(prev =>
          prev.map(playlist =>
            playlist.id === playlistId
              ? { ...playlist, likes: response.data.likes }
              : playlist
          )
        );
        toast.success('Playlist liked! ❤️');
      }
    } catch (error) {
      toast.error('Failed to like playlist');
    }
  };

  const sharePlaylist = (playlist) => {
    const shareText = `Check out this ${playlist.mood} playlist: ${playlist.name} on MoodFlow! 🎵`;
    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Playlist link copied to clipboard! 📋');
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.mood.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || playlist.mood === filter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { value: 'all', label: 'All Moods', emoji: '🎵' },
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'angry', label: 'Angry', emoji: '😠' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'surprised', label: 'Surprised', emoji: '😲' }
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
          }}
        />
      </div>
    );
  }

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
            Your Playlists
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
          }}>
            Discover and share mood-based playlists with the community
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}>
              {playlists.length}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}>
              Total Playlists
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}>
              {playlists.reduce((sum, playlist) => sum + playlist.likes, 0)}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}>
              Total Likes
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}>
              {playlists.reduce((sum, playlist) => sum + playlist.songs.length, 0)}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}>
              Total Songs
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
            }}>
              {new Set(playlists.map(p => p.userId)).size}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}>
              Active Users
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ marginBottom: '32px' }}
        >
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              {filters.map((filterOption) => (
                <motion.button
                  key={filterOption.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-secondary"
                  style={{
                    background: filter === filterOption.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: filter === filterOption.value ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  onClick={() => setFilter(filterOption.value)}
                >
                  <span style={{ marginRight: '8px' }}>{filterOption.emoji}</span>
                  {filterOption.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Playlists Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredPlaylists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
              style={{
                background: `linear-gradient(135deg, ${getMoodColor(playlist.mood)}20 0%, ${getMoodColor(playlist.mood)}40 100%)`,
                border: `2px solid ${getMoodColor(playlist.mood)}`,
              }}
            >
              {/* Playlist Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${getMoodColor(playlist.mood)} 0%, ${getMoodColor(playlist.mood)}dd 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}>
                  {getMoodEmoji(playlist.mood)}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '4px',
                  }}>
                    {playlist.name}
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    textTransform: 'capitalize',
                  }}>
                    {playlist.mood} Mood • {playlist.songs.length} songs
                  </p>
                </div>
              </div>

              {/* Playlist Info */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  {formatDate(playlist.createdAt)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} />
                  {playlist.userId}
                </div>
              </div>

              {/* Sample Songs */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '8px',
                }}>
                  Sample Songs:
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  {playlist.songs.slice(0, 3).map((song, songIndex) => (
                    <div key={songIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                    }}>
                      <span style={{ fontSize: '0.8rem' }}>🎵</span>
                      <span style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        flex: 1,
                      }}>
                        {song.title} - {song.artist}
                      </span>
                    </div>
                  ))}
                  {playlist.songs.length > 3 && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textAlign: 'center',
                      padding: '4px',
                    }}>
                      +{playlist.songs.length - 3} more songs
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '8px',
              }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => toast.success(`Playing ${playlist.name}! 🎵`)}
                >
                  <Play size={16} />
                  Play
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-secondary"
                  onClick={() => likePlaylist(playlist.id)}
                >
                  <Heart size={16} />
                  {playlist.likes}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-secondary"
                  onClick={() => sharePlaylist(playlist)}
                >
                  <Share2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredPlaylists.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ textAlign: 'center', padding: '60px 20px' }}
          >
            <div style={{
              fontSize: '4rem',
              marginBottom: '16px',
            }}>
              🎵
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '8px',
            }}>
              No playlists found
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
            }}>
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first playlist using the mood analyzer!'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Playlists;