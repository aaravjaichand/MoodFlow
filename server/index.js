const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('🤖 OpenAI API initialized');
} else {
  console.log('⚠️  OpenAI API key not found - using fallback recommendations');
}

// Initialize Spotify Web API (Client Credentials flow - no redirect URI needed)
let spotifyApi = null;
if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
  spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    // No redirect URI needed for Client Credentials flow
  });
  console.log('🎵 Spotify Web API initialized (Client Credentials flow)');
} else {
  console.log('⚠️  Spotify credentials not found - using fallback recommendations');
}

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
// app.use(express.static(path.join(__dirname, '../client/build')));

// In-memory storage for demo
const users = new Map();
const playlists = new Map();

// Mood analysis function (simplified for demo)
function analyzeMood(emotionData) {
  const emotions = {
    happy: emotionData.happy || 0,
    sad: emotionData.sad || 0,
    angry: emotionData.angry || 0,
    neutral: emotionData.neutral || 0,
    surprised: emotionData.surprised || 0
  };

  const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
    emotions[a] > emotions[b] ? a : b
  );

  return {
    dominant: dominantEmotion,
    confidence: emotions[dominantEmotion],
    allEmotions: emotions
  };
}

// AI-powered music recommendations using OpenAI
async function getAIPoweredRecommendations(mood, userPreferences = {}) {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const { favoriteGenres = [], favoriteArtists = [] } = userPreferences;

    const prompt = `The user is ${mood}, here are the user's favorite genres: [${favoriteGenres.join(', ')}] and favorite artists: [${favoriteArtists.join(', ')}]. 
    
    Recommend 10-15 songs from these artists + some new ones that the user might like. 
    
    Return the response as a JSON array with this exact format:
    [
      {
        "title": "Song Title",
        "artist": "Artist Name", 
        "genre": "Genre",
        "duration": "3:45",
        "cover": "🎵",
        "id": 1
      }
    ]
    
    Make sure the songs match the user's mood and preferences. Include a mix of songs from their favorite artists and new recommendations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a music recommendation expert. You provide personalized song recommendations based on user mood and preferences. Always return valid JSON arrays."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;

    // Clean the response to extract JSON (remove markdown formatting if present)
    let cleanResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Parse the JSON response
    const aiRecommendations = JSON.parse(cleanResponse);

    // Add IDs if not present
    return aiRecommendations.map((song, index) => ({
      ...song,
      id: song.id || index + 1
    }));

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Fallback to hardcoded recommendations if OpenAI fails
    return getFallbackRecommendations(mood);
  }
}

// Fallback recommendations (original hardcoded data)
function getFallbackRecommendations(mood) {
  const recommendations = {
    happy: [
      { id: 1, title: "Happy", artist: "Pharrell Williams", genre: "Pop", duration: "3:53", cover: "🎵", previewUrl: null },
      { id: 2, title: "Good Time", artist: "Owl City", genre: "Pop", duration: "3:26", cover: "🎵", previewUrl: null },
      { id: 3, title: "Walking on Sunshine", artist: "Katrina & The Waves", genre: "Rock", duration: "4:00", cover: "🎵", previewUrl: null },
      { id: 4, title: "I Gotta Feeling", artist: "The Black Eyed Peas", genre: "Pop", duration: "4:05", cover: "🎵", previewUrl: null },
      { id: 5, title: "Shake It Off", artist: "Taylor Swift", genre: "Pop", duration: "3:39", cover: "🎵", previewUrl: null }
    ],
    sad: [
      { id: 6, title: "Mad World", artist: "Gary Jules", genre: "Alternative", duration: "3:09", cover: "🎵", previewUrl: null },
      { id: 7, title: "Hallelujah", artist: "Jeff Buckley", genre: "Folk", duration: "6:53", cover: "🎵", previewUrl: null },
      { id: 8, title: "Fix You", artist: "Coldplay", genre: "Alternative", duration: "4:55", cover: "🎵", previewUrl: null },
      { id: 9, title: "The Scientist", artist: "Coldplay", genre: "Alternative", duration: "5:09", cover: "🎵", previewUrl: null },
      { id: 10, title: "Skinny Love", artist: "Bon Iver", genre: "Indie", duration: "3:58", cover: "🎵", previewUrl: null }
    ],
    angry: [
      { id: 11, title: "In The End", artist: "Linkin Park", genre: "Rock", duration: "3:36", cover: "🎵", previewUrl: null },
      { id: 12, title: "Numb", artist: "Linkin Park", genre: "Rock", duration: "3:05", cover: "🎵", previewUrl: null },
      { id: 13, title: "Break Stuff", artist: "Limp Bizkit", genre: "Rock", duration: "2:46", cover: "🎵", previewUrl: null },
      { id: 14, title: "Given Up", artist: "Linkin Park", genre: "Rock", duration: "3:09", cover: "🎵", previewUrl: null },
      { id: 15, title: "Rollin'", artist: "Limp Bizkit", genre: "Rock", duration: "3:35", cover: "🎵", previewUrl: null }
    ],
    neutral: [
      { id: 16, title: "Clocks", artist: "Coldplay", genre: "Alternative", duration: "5:07", cover: "🎵", previewUrl: null },
      { id: 17, title: "Yellow", artist: "Coldplay", genre: "Alternative", duration: "4:29", cover: "🎵", previewUrl: null },
      { id: 18, title: "Wonderwall", artist: "Oasis", genre: "Rock", duration: "4:18", cover: "🎵", previewUrl: null },
      { id: 19, title: "Creep", artist: "Radiohead", genre: "Alternative", duration: "4:19", cover: "🎵", previewUrl: null },
      { id: 20, title: "Boulevard of Broken Dreams", artist: "Green Day", genre: "Rock", duration: "4:20", cover: "🎵", previewUrl: null }
    ],
    surprised: [
      { id: 21, title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", genre: "Pop", duration: "3:57", cover: "🎵", previewUrl: null },
      { id: 22, title: "Can't Stop the Feeling!", artist: "Justin Timberlake", genre: "Pop", duration: "3:56", cover: "🎵", previewUrl: null },
      { id: 23, title: "Shake It Off", artist: "Taylor Swift", genre: "Pop", duration: "3:39", cover: "🎵", previewUrl: null },
      { id: 24, title: "Happy", artist: "Pharrell Williams", genre: "Pop", duration: "3:53", cover: "🎵", previewUrl: null },
      { id: 25, title: "Firework", artist: "Katy Perry", genre: "Pop", duration: "3:47", cover: "🎵", previewUrl: null }
    ]
  };

  return recommendations[mood] || recommendations.neutral;
}

// Legacy function for backward compatibility
function getMoodBasedRecommendations(mood) {
  return getFallbackRecommendations(mood);
}

// Token caching
let spotifyTokenCache = {
  token: null,
  expiresAt: 0
};

async function getSpotifyAccessToken() {
  try {
    if (!spotifyApi) return null;

    // Check if we have a valid cached token
    const now = Date.now();
    if (spotifyTokenCache.token && spotifyTokenCache.expiresAt > now) {
      return spotifyTokenCache.token;
    }

    const data = await spotifyApi.clientCredentialsGrant();
    const token = data.body['access_token'];
    const expiresIn = data.body['expires_in'];

    // Cache the token with expiration
    spotifyTokenCache = {
      token: token,
      expiresAt: now + (expiresIn * 1000) - 60000 // Expire 1 minute early
    };

    spotifyApi.setAccessToken(token);
    console.log('🎵 Spotify access token obtained (cached)');
    return token;
  } catch (error) {
    console.error('Spotify authentication error:', error);
    return null;
  }
}

async function searchSpotifySongs(query, limit = 10) {
  try {
    if (!spotifyApi) return [];

    // Get fresh access token
    await getSpotifyAccessToken();

    const response = await spotifyApi.searchTracks(query, {
      limit: limit,
      market: 'US'
    });

    return response.body.tracks.items.map((track, index) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      genre: track.album.genres?.[0] || 'Unknown',
      duration: formatDuration(track.duration_ms),
      cover: track.album.images[0]?.url || '🎵',
      spotifyUrl: track.external_urls.spotify,
      previewUrl: track.preview_url
    }));
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Enhanced AI-powered recommendations with Spotify integration
async function getSpotifyAIPoweredRecommendations(mood, userPreferences = {}) {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const { favoriteGenres = [], favoriteArtists = [] } = userPreferences;

    const prompt = `The user is ${mood}, here are the user's favorite genres: [${favoriteGenres.join(', ')}] and favorite artists: [${favoriteArtists.join(', ')}]. 
    
    Recommend 10-15 specific song titles and artists that would be perfect for this mood and user preferences. 
    
    Return the response as a JSON array with this exact format:
    [
      {
        "title": "Song Title",
        "artist": "Artist Name"
      }
    ]
    
    Make sure the songs match the user's mood and preferences. Include a mix of songs from their favorite artists and new recommendations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a music recommendation expert. You provide personalized song recommendations based on user mood and preferences. Always return valid JSON arrays with song titles and artists."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;

    // Clean the response to extract JSON (remove markdown formatting if present)
    let cleanResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Parse the JSON response
    const aiRecommendations = JSON.parse(cleanResponse);

    // Search Spotify for each recommended song
    const spotifySongs = [];
    for (const song of aiRecommendations) {
      const searchQuery = `${song.title} ${song.artist}`;
      const results = await searchSpotifySongs(searchQuery, 1);
      if (results.length > 0) {
        spotifySongs.push(results[0]);
      }
    }

    // If we don't have enough songs from AI recommendations, add mood-based searches
    if (spotifySongs.length < 10) {
      const moodKeywords = {
        happy: 'upbeat happy energetic',
        sad: 'melancholy sad emotional',
        angry: 'intense powerful aggressive',
        neutral: 'calm peaceful ambient',
        surprised: 'exciting dynamic energetic'
      };

      const additionalQuery = `${moodKeywords[mood] || 'pop'} ${favoriteGenres.join(' ')}`;
      const additionalSongs = await searchSpotifySongs(additionalQuery, 10 - spotifySongs.length);
      spotifySongs.push(...additionalSongs);
    }

    return spotifySongs;

  } catch (error) {
    console.error('Spotify AI recommendations error:', error);

    // Fallback to basic Spotify search
    return await getBasicSpotifyRecommendations(mood, userPreferences);
  }
}

// Basic Spotify recommendations without AI
async function getBasicSpotifyRecommendations(mood, userPreferences = {}) {
  try {
    const { favoriteGenres = [], favoriteArtists = [] } = userPreferences;

    const moodKeywords = {
      happy: 'upbeat happy energetic',
      sad: 'melancholy sad emotional',
      angry: 'intense powerful aggressive',
      neutral: 'calm peaceful ambient',
      surprised: 'exciting dynamic energetic'
    };

    const searchQuery = `${moodKeywords[mood] || 'pop'} ${favoriteGenres.join(' ')}`;
    return await searchSpotifySongs(searchQuery, 10);

  } catch (error) {
    console.error('Basic Spotify recommendations error:', error);
    return getFallbackRecommendations(mood);
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MoodFlow API is running!' });
});

app.post('/api/analyze-mood', async (req, res) => {
  try {
    const { emotionData, userPreferences = {} } = req.body;
    const moodAnalysis = analyzeMood(emotionData);

    // Use Spotify AI-powered recommendations if both OpenAI and Spotify are available
    let recommendations;
    let aiPowered = false;
    let spotifyPowered = false;

    if (openai && spotifyApi) {
      recommendations = await getSpotifyAIPoweredRecommendations(moodAnalysis.dominant, userPreferences);
      aiPowered = true;
      spotifyPowered = true;
    } else if (spotifyApi) {
      // Use basic Spotify recommendations
      recommendations = await getBasicSpotifyRecommendations(moodAnalysis.dominant, userPreferences);
      spotifyPowered = true;
    } else if (openai) {
      // Use AI recommendations without Spotify
      recommendations = await getAIPoweredRecommendations(moodAnalysis.dominant, userPreferences);
      aiPowered = true;
    } else {
      // Fallback to hardcoded recommendations
      recommendations = getFallbackRecommendations(moodAnalysis.dominant);
    }

    res.json({
      success: true,
      mood: moodAnalysis,
      recommendations,
      playlistId: uuidv4(),
      aiPowered,
      spotifyPowered
    });
  } catch (error) {
    console.error('Error in analyze-mood:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/create-playlist', (req, res) => {
  try {
    const { name, songs, mood, userId } = req.body;
    const playlistId = uuidv4();

    const playlist = {
      id: playlistId,
      name,
      songs,
      mood,
      userId,
      createdAt: new Date(),
      likes: 0,
      shares: 0
    };

    playlists.set(playlistId, playlist);

    res.json({
      success: true,
      playlist
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/playlists', (req, res) => {
  try {
    const allPlaylists = Array.from(playlists.values());
    res.json({
      success: true,
      playlists: allPlaylists
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/playlist/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const playlist = playlists.get(id);

    if (playlist) {
      playlist.likes += 1;
      playlists.set(id, playlist);
      res.json({ success: true, likes: playlist.likes });
    } else {
      res.status(404).json({ success: false, error: 'Playlist not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/search-spotify', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!spotifyApi) {
      return res.status(400).json({
        success: false,
        error: 'Spotify API not configured'
      });
    }

    const songs = await searchSpotifySongs(query, limit);

    res.json({
      success: true,
      songs,
      query,
      total: songs.length
    });
  } catch (error) {
    console.error('Spotify search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Spotify authentication endpoints for user login
app.get('/api/spotify-login', (req, res) => {
  if (!spotifyApi) {
    return res.status(400).json({
      success: false,
      error: 'Spotify API not configured'
    });
  }

  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private'
  ];

  const state = uuidv4();
  const authorizeURL = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent(scopes.join(' '))}`;

  res.json({
    success: true,
    authUrl: authorizeURL,
    state
  });
});

app.get('/api/spotify-callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Authorization code not provided'
    });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    // Store tokens (in production, use a proper database)
    const userId = uuidv4();
    users.set(userId, {
      id: userId,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000)
    });

    res.redirect(`http://localhost:3000/spotify-success?userId=${userId}`);
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect('http://localhost:3000/spotify-error');
  }
});

app.get('/api/spotify-token', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID required'
    });
  }

  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Check if token is expired
  if (Date.now() > user.expiresAt) {
    // Refresh token
    refreshSpotifyToken(userId, user.refreshToken)
      .then(newToken => {
        res.json({
          success: true,
          token: newToken
        });
      })
      .catch(error => {
        console.error('Token refresh error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to refresh token'
        });
      });
  } else {
    res.json({
      success: true,
      token: user.accessToken
    });
  }
});

async function refreshSpotifyToken(userId, refreshToken) {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    // Update user tokens
    const user = users.get(userId);
    user.accessToken = data.access_token;
    user.expiresAt = Date.now() + (data.expires_in * 1000);
    users.set(userId, user);

    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

// Analyze emotion from image using GPT-4o
app.post('/api/analyze-emotion-image', async (req, res) => {
  try {
    const { image, timestamp } = req.body;

    if (!openai) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API not configured'
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'No image provided'
      });
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing human emotions from facial expressions. 
          Your task is to analyze the provided image and determine the person's emotional state.

          CRITICAL: You must respond with ONLY a valid JSON object. No other text, no explanations, no markdown formatting.

          The JSON must have this exact structure:
          {
            "emotions": {
              "happy": 0.0,
              "sad": 0.0,
              "angry": 0.0,
              "fearful": 0.0,
              "disgusted": 0.0,
              "surprised": 0.0,
              "neutral": 0.0
            },
            "dominant_emotion": "emotion_name",
            "confidence": 0.0,
            "description": "Brief description of what you observe"
          }
          
          Rules:
          1. Respond with ONLY the JSON object, no other text
          2. All emotion values should be between 0.0 and 1.0
          3. The dominant_emotion should be one of: happy, sad, angry, fearful, disgusted, surprised, neutral
          4. Confidence should be between 0.0 and 1.0
          5. Total emotion values should sum to approximately 1.0
          6. The dominant emotion should have the highest value

          Analyze facial features like:
          - Eye expressions and gaze direction
          - Mouth shape and position
          - Overall facial tension
          - Micro-expressions
          - Facial muscle activity`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze the emotional state of the person in this image. Return ONLY a JSON object with the specified structure."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', response);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI analysis - invalid JSON response'
      });
    }

    // Validate the analysis structure
    if (!analysis.emotions || !analysis.dominant_emotion || typeof analysis.confidence !== 'number') {
      console.error('Invalid analysis structure:', analysis);
      return res.status(500).json({
        success: false,
        error: 'Invalid analysis structure from AI'
      });
    }

    // Ensure dominant emotion is valid
    const validEmotions = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];
    if (!validEmotions.includes(analysis.dominant_emotion)) {
      analysis.dominant_emotion = 'neutral';
    }

    console.log('✅ OpenAI emotion analysis successful:', analysis.dominant_emotion, 'confidence:', analysis.confidence);

    res.json({
      success: true,
      analysis: {
        emotions: analysis.emotions,
        dominant: analysis.dominant_emotion,
        confidence: analysis.confidence,
        description: analysis.description || 'AI analyzed facial expression',
        timestamp: timestamp
      }
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('mood-update', async (data) => {
    try {
      const moodAnalysis = analyzeMood(data.emotionData);

      // Use AI-powered recommendations if OpenAI API key is available
      let recommendations;
      let aiPowered = false;
      let spotifyPowered = false;

      if (openai && spotifyApi) {
        recommendations = await getSpotifyAIPoweredRecommendations(moodAnalysis.dominant, data.userPreferences || {});
        aiPowered = true;
        spotifyPowered = true;
      } else if (spotifyApi) {
        recommendations = await getBasicSpotifyRecommendations(moodAnalysis.dominant, data.userPreferences || {});
        spotifyPowered = true;
      } else if (openai) {
        recommendations = await getAIPoweredRecommendations(moodAnalysis.dominant, data.userPreferences || {});
        aiPowered = true;
      } else {
        recommendations = getFallbackRecommendations(moodAnalysis.dominant);
      }

      socket.emit('mood-analyzed', {
        mood: moodAnalysis,
        recommendations,
        aiPowered,
        spotifyPowered
      });
    } catch (error) {
      console.error('Socket mood-update error:', error);
      // Fallback to basic recommendations on error
      const moodAnalysis = analyzeMood(data.emotionData);
      socket.emit('mood-analyzed', {
        mood: moodAnalysis,
        recommendations: getFallbackRecommendations(moodAnalysis.dominant),
        aiPowered: false,
        spotifyPowered: false
      });
    }
  });

  socket.on('playlist-created', (playlist) => {
    socket.broadcast.emit('new-playlist', playlist);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve React app (commented out for development)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 MoodFlow server running on port ${PORT}`);
  console.log(`🎵 AI-powered music discovery ready!`);
});