const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

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
    });
    console.log('🎵 Spotify Web API initialized (Client Credentials flow)');
} else {
    console.log('⚠️  Spotify credentials not found - using fallback recommendations');
}

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-app-name.vercel.app', 'https://your-app-name.vercel.app']
        : "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

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
        let cleanResponse = response.trim();

        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        const aiRecommendations = JSON.parse(cleanResponse);
        return aiRecommendations.map((song, index) => ({
            ...song,
            id: song.id || index + 1
        }));

    } catch (error) {
        console.error('OpenAI API error:', error);
        return getFallbackRecommendations(mood);
    }
}

// Fallback recommendations
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

// Token caching
let spotifyTokenCache = {
    token: null,
    expiresAt: 0
};

async function getSpotifyAccessToken() {
    try {
        if (!spotifyApi) return null;

        const now = Date.now();
        if (spotifyTokenCache.token && spotifyTokenCache.expiresAt > now) {
            return spotifyTokenCache.token;
        }

        const data = await spotifyApi.clientCredentialsGrant();
        const token = data.body['access_token'];
        const expiresIn = data.body['expires_in'];

        spotifyTokenCache = {
            token: token,
            expiresAt: now + (expiresIn * 1000) - 60000
        };

        spotifyApi.setAccessToken(token);
        return token;
    } catch (error) {
        console.error('Spotify authentication error:', error);
        return null;
    }
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        openai: !!openai,
        spotify: !!spotifyApi
    });
});

app.post('/api/analyze-emotion', async (req, res) => {
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
          6. The dominant emotion should have the highest value`
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
        let analysis;
        try {
            analysis = JSON.parse(response);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return res.status(500).json({
                success: false,
                error: 'Failed to parse AI analysis - invalid JSON response'
            });
        }

        if (!analysis.emotions || !analysis.dominant_emotion || typeof analysis.confidence !== 'number') {
            console.error('Invalid analysis structure:', analysis);
            return res.status(500).json({
                success: false,
                error: 'Invalid analysis structure from AI'
            });
        }

        const validEmotions = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];
        if (!validEmotions.includes(analysis.dominant_emotion)) {
            analysis.dominant_emotion = 'neutral';
        }

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

app.post('/api/get-recommendations', async (req, res) => {
    try {
        const { mood, userPreferences = {} } = req.body;

        if (!mood) {
            return res.status(400).json({
                success: false,
                error: 'Mood parameter is required'
            });
        }

        let recommendations;
        let aiPowered = false;
        let spotifyPowered = false;

        if (openai && spotifyApi) {
            // This would need to be implemented for Spotify integration
            recommendations = await getAIPoweredRecommendations(mood, userPreferences);
            aiPowered = true;
        } else if (openai) {
            recommendations = await getAIPoweredRecommendations(mood, userPreferences);
            aiPowered = true;
        } else {
            recommendations = getFallbackRecommendations(mood);
        }

        res.json({
            success: true,
            recommendations,
            aiPowered,
            spotifyPowered
        });

    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Export for Vercel
module.exports = app; 