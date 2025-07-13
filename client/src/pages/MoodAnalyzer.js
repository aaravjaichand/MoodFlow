import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Music, Heart, Play, Brain } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import EmotionDetector from '../components/EmotionDetector';
import SpotifyPlayer from '../components/SpotifyPlayer';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const MoodAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const socket = useContext(SocketContext);
  const { user, updateUserPreferences, incrementRecommendationsCount, updatePlaylists } = useUser();
  const [newGenre, setNewGenre] = useState('');
  const [newArtist, setNewArtist] = useState('');

  const addGenre = () => {
    if (newGenre.trim() && !user.favoriteGenres.includes(newGenre.trim())) {
      updateUserPreferences({ favoriteGenres: [...user.favoriteGenres, newGenre.trim()] });
      setNewGenre('');
    }
  };
  const removeGenre = (genre) => {
    updateUserPreferences({ favoriteGenres: user.favoriteGenres.filter(g => g !== genre) });
  };
  const addArtist = () => {
    if (newArtist.trim() && !user.favoriteArtists.includes(newArtist.trim())) {
      updateUserPreferences({ favoriteArtists: [...user.favoriteArtists, newArtist.trim()] });
      setNewArtist('');
    }
  };
  const removeArtist = (artist) => {
    updateUserPreferences({ favoriteArtists: user.favoriteArtists.filter(a => a !== artist) });
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    toast.success('Starting mood analysis...');
  };

  const handleEmotionDetected = async (emotionData) => {
    try {
      // Get AI-powered recommendations from server
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.GET_RECOMMENDATIONS}`, {
        mood: emotionData.dominant,
        userPreferences: {
          favoriteGenres: user?.favoriteGenres || [],
          favoriteArtists: user?.favoriteArtists || []
        }
      });

      if (response.data.success) {
        setCurrentMood({
          dominant: emotionData.dominant,
          confidence: emotionData.confidence,
          allEmotions: emotionData.allEmotions,
          aiAnalysis: emotionData.aiAnalysis
        });

        setRecommendations(response.data.recommendations);
        incrementRecommendationsCount(); // Increment recommendations count in Firebase

        // Add to history
        // setAnalysisHistory(prev => [...prev, {
        //   id: Date.now(),
        //   mood: {
        //     dominant: emotionData.dominant,
        //     confidence: emotionData.confidence,
        //     allEmotions: emotionData.allEmotions,
        //     aiAnalysis: emotionData.aiAnalysis
        //   },
        //   timestamp: new Date(),
        //   recommendations: response.data.recommendations,
        //   aiPowered: response.data.aiPowered
        // }]);

        setIsAnalyzing(false);

        // Show success message
        toast.success(`Mood detected: ${emotionData.dominant}! 🎵 ${response.data.aiPowered ? '(AI Powered)' : ''} ${response.data.spotifyPowered ? '(Spotify Powered)' : ''}`);

        // Emit to socket for real-time features
        if (socket) {
          socket.emit('mood-update', {
            emotionData,
            userPreferences: {
              favoriteGenres: user?.favoriteGenres || [],
              favoriteArtists: user?.favoriteArtists || []
            }
          });
        }
      } else {
        throw new Error('Failed to get recommendations');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      toast.error('Failed to analyze mood. Using fallback recommendations.');

      // Fallback to local recommendations
      setCurrentMood({
        dominant: emotionData.dominant,
        confidence: emotionData.confidence,
        allEmotions: emotionData.allEmotions,
        aiAnalysis: emotionData.aiAnalysis
      });

      const fallbackRecommendations = getMoodBasedRecommendations(emotionData.dominant);
      setRecommendations(fallbackRecommendations);
    }
  };

  const handleAnalysisComplete = () => {
    // This is called when the analysis is done (success or failure)
    // The actual completion is handled in handleEmotionDetected
  };

  const getMoodBasedRecommendations = (mood) => {
    const recommendations = {
      happy: [
        { id: 1, title: "Happy", artist: "Pharrell Williams", genre: "Pop", duration: "3:53", cover: "🎵" },
        { id: 2, title: "Good Time", artist: "Owl City", genre: "Pop", duration: "3:26", cover: "🎵" },
        { id: 3, title: "Walking on Sunshine", artist: "Katrina & The Waves", genre: "Rock", duration: "4:00", cover: "🎵" },
        { id: 4, title: "I Gotta Feeling", artist: "The Black Eyed Peas", genre: "Pop", duration: "4:05", cover: "🎵" },
        { id: 5, title: "Shake It Off", artist: "Taylor Swift", genre: "Pop", duration: "3:39", cover: "🎵" }
      ],
      sad: [
        { id: 6, title: "Mad World", artist: "Gary Jules", genre: "Alternative", duration: "3:09", cover: "🎵" },
        { id: 7, title: "Hallelujah", artist: "Jeff Buckley", genre: "Folk", duration: "6:53", cover: "🎵" },
        { id: 8, title: "Fix You", artist: "Coldplay", genre: "Alternative", duration: "4:55", cover: "🎵" },
        { id: 9, title: "The Scientist", artist: "Coldplay", genre: "Alternative", duration: "5:09", cover: "🎵" },
        { id: 10, title: "Skinny Love", artist: "Bon Iver", genre: "Indie", duration: "3:58", cover: "🎵" }
      ],
      angry: [
        { id: 11, title: "In The End", artist: "Linkin Park", genre: "Rock", duration: "3:36", cover: "🎵" },
        { id: 12, title: "Numb", artist: "Linkin Park", genre: "Rock", duration: "3:05", cover: "🎵" },
        { id: 13, title: "Break Stuff", artist: "Limp Bizkit", genre: "Rock", duration: "2:46", cover: "🎵" },
        { id: 14, title: "Given Up", artist: "Linkin Park", genre: "Rock", duration: "3:09", cover: "🎵" },
        { id: 15, title: "Rollin'", artist: "Limp Bizkit", genre: "Rock", duration: "3:35", cover: "🎵" }
      ],
      neutral: [
        { id: 16, title: "Clocks", artist: "Coldplay", genre: "Alternative", duration: "5:07", cover: "🎵" },
        { id: 17, title: "Yellow", artist: "Coldplay", genre: "Alternative", duration: "4:29", cover: "🎵" },
        { id: 18, title: "Wonderwall", artist: "Oasis", genre: "Rock", duration: "4:18", cover: "🎵" },
        { id: 19, title: "Creep", artist: "Radiohead", genre: "Alternative", duration: "4:19", cover: "🎵" },
        { id: 20, title: "Boulevard of Broken Dreams", artist: "Green Day", genre: "Rock", duration: "4:20", cover: "🎵" }
      ],
      surprised: [
        { id: 21, title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", genre: "Pop", duration: "3:57", cover: "🎵" },
        { id: 22, title: "Can't Stop the Feeling!", artist: "Justin Timberlake", genre: "Pop", duration: "3:56", cover: "🎵" },
        { id: 23, title: "Shake It Off", artist: "Taylor Swift", genre: "Pop", duration: "3:39", cover: "🎵" },
        { id: 24, title: "Happy", artist: "Pharrell Williams", genre: "Pop", duration: "3:53", cover: "🎵" },
        { id: 25, title: "Firework", artist: "Katy Perry", genre: "Pop", duration: "3:47", cover: "🎵" }
      ]
    };

    return recommendations[mood] || recommendations.neutral;
  };

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    toast.success(`Now playing: ${song.title} by ${song.artist}`);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? 'Paused' : 'Playing');
  };

  const handleNext = () => {
    // Auto-play next song logic
    const currentIndex = recommendations.findIndex(song => song.id === currentSong?.id);
    const nextSong = recommendations[currentIndex + 1] || recommendations[0];
    if (nextSong) {
      playSong(nextSong);
    }
  };

  const handlePrevious = () => {
    // Auto-play previous song logic
    const currentIndex = recommendations.findIndex(song => song.id === currentSong?.id);
    const prevSong = recommendations[currentIndex - 1] || recommendations[recommendations.length - 1];
    if (prevSong) {
      playSong(prevSong);
    }
  };

  const createPlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      // For now, we'll create the playlist locally since the API doesn't have this endpoint yet
      const newPlaylist = {
        id: Date.now(),
        name: playlistName,
        songs: recommendations,
        mood: currentMood.dominant,
        userId: user.id,
        createdAt: new Date().toISOString()
      };

      // Update playlists in Firebase
      updatePlaylists([...(user.playlists || []), newPlaylist]);
      toast.success('Playlist created successfully!');
      setShowPlaylistModal(false);
      setPlaylistName('');

      // Emit to socket if available
      if (socket) {
        socket.emit('playlist-created', newPlaylist);
      }
    } catch (error) {
      toast.error('Failed to create playlist');
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
            AI Mood Analyzer
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
          }}>
            Let AI analyze your mood and discover the perfect music for you
          </p>
        </motion.div>

        {/* Music Player - Always show since it's simplified */}
        <SpotifyPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />

        {/* User Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ marginBottom: '32px' }}
        >
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            🎵 Your Music Preferences (Used for AI Recommendations)
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}>
            {/* Favorite Genres */}
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: 'white',
                marginBottom: '12px',
              }}>
                Favorite Genres:
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px',
              }}>
                {(user.favoriteGenres || []).map((genre, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {genre}
                    <button onClick={() => removeGenre(genre)} style={{ marginLeft: 6, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newGenre}
                  onChange={e => setNewGenre(e.target.value)}
                  placeholder="Add genre..."
                  style={{ flex: 1, borderRadius: '12px', padding: '6px 10px', border: '1px solid #764ba2' }}
                  onKeyDown={e => { if (e.key === 'Enter') addGenre(); }}
                />
                <button onClick={addGenre} style={{ borderRadius: '12px', padding: '6px 12px', background: '#764ba2', color: 'white', border: 'none', fontWeight: '500', cursor: 'pointer' }}>Add</button>
              </div>
            </div>

            {/* Favorite Artists */}
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: 'white',
                marginBottom: '12px',
              }}>
                Favorite Artists:
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px',
              }}>
                {(user.favoriteArtists || []).map((artist, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {artist}
                    <button onClick={() => removeArtist(artist)} style={{ marginLeft: 6, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newArtist}
                  onChange={e => setNewArtist(e.target.value)}
                  placeholder="Add artist..."
                  style={{ flex: 1, borderRadius: '12px', padding: '6px 10px', border: '1px solid #4facfe' }}
                  onKeyDown={e => { if (e.key === 'Enter') addArtist(); }}
                />
                <button onClick={addArtist} style={{ borderRadius: '12px', padding: '6px 12px', background: '#4facfe', color: 'white', border: 'none', fontWeight: '500', cursor: 'pointer' }}>Add</button>
              </div>
            </div>
          </div>

          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            textAlign: 'center',
            marginTop: '16px',
            fontStyle: 'italic',
          }}>
            💡 These preferences help AI generate personalized song recommendations based on your mood!
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Camera Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Camera size={28} color="white" />
            </div>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '24px',
            }}>
              Real-Time Emotion Detection
            </h3>

            {/* Enhanced Emotion Detector */}
            <EmotionDetector
              onEmotionDetected={handleEmotionDetected}
              isAnalyzing={isAnalyzing}
              onAnalysisComplete={handleAnalysisComplete}
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
              onClick={startAnalysis}
              disabled={isAnalyzing}
              style={{ width: '100%' }}
            >
              <Camera size={20} />
              {isAnalyzing ? 'Analyzing...' : 'Start Mood Analysis'}
            </motion.button>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Music size={28} color="white" />
            </div>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '24px',
              textAlign: 'center',
            }}>
              Mood Results
            </h3>

            <AnimatePresence>
              {currentMood && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="card"
                  style={{
                    background: `linear-gradient(135deg, ${getMoodColor(currentMood.dominant)}20 0%, ${getMoodColor(currentMood.dominant)}40 100%)`,
                    border: `2px solid ${getMoodColor(currentMood.dominant)}`,
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '4rem',
                      marginBottom: '16px',
                    }}>
                      {getMoodEmoji(currentMood.dominant)}
                    </div>
                    <h4 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '8px',
                      textTransform: 'capitalize',
                    }}>
                      {currentMood.dominant}
                    </h4>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1rem',
                      marginBottom: '8px',
                    }}>
                      Confidence: {Math.round(currentMood.confidence * 100)}%
                    </p>

                    {/* AI Analysis Indicator */}
                    {currentMood.aiAnalysis && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        background: 'rgba(138, 43, 226, 0.2)',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        color: 'white',
                      }}>
                        <Brain size={14} />
                        GPT-4o Analysis
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Create Playlist Button */}
            {recommendations.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setShowPlaylistModal(true)}
              >
                <Heart size={20} />
                Create Playlist
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '32px' }}
          >
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '24px',
              textAlign: 'center',
            }}>
              Recommended Songs
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              {recommendations.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                  }}
                  onClick={() => playSong(song)}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    overflow: 'hidden',
                  }}>
                    {song.cover && song.cover.startsWith('http') ? (
                      <img src={song.cover} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      song.cover
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '4px',
                    }}>
                      {song.title}
                    </h4>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      marginBottom: '4px',
                    }}>
                      {song.artist}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}>
                        {song.genre}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}>
                        {song.duration}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-secondary"
                    style={{ padding: '8px' }}
                  >
                    <Play size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Playlist Modal */}
      <AnimatePresence>
        {showPlaylistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => setShowPlaylistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="card"
              style={{
                maxWidth: '400px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '24px',
                textAlign: 'center',
              }}>
                Create Playlist
              </h3>

              <input
                type="text"
                placeholder="Enter playlist name..."
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="input"
                style={{ marginBottom: '24px' }}
              />

              <div style={{
                display: 'flex',
                gap: '12px',
              }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowPlaylistModal(false)}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={createPlaylist}
                >
                  <Heart size={20} />
                  Create
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodAnalyzer;