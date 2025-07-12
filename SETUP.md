# MoodFlow Setup Guide

## Enhanced Features Added

### 🎵 Spotify Premium Integration
- **Real song playback** using Spotify Web Playback SDK
- **Premium account required** for full playback functionality
- **Automatic song playing** when recommendations are selected
- **Volume control and playback controls**

### 🤖 Real-Time Emotion Detection
- **face-api.js integration** for accurate emotion detection
- **Real-time face analysis** with confidence scores
- **Face detection overlays** and animations
- **7 emotion categories**: happy, sad, angry, fearful, disgusted, surprised, neutral

### 🎭 Enhanced UI/UX
- **Face animations** during analysis (camera stays visible)
- **Real-time emotion display** with confidence percentages
- **Smooth animations** and transitions
- **Better visual feedback** during analysis

## Setup Instructions

### 1. Install Dependencies
```bash
npm run install-all
```

This will:
- Install server dependencies
- Install client dependencies  
- Download face-api.js models

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
# OpenAI API Key (for AI-powered recommendations)
OPENAI_API_KEY=your_openai_api_key_here

# Spotify API Credentials (for song playback)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:5001/api/spotify-callback

# Server Configuration
PORT=5001
```

### 3. Spotify Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Add `http://localhost:5001/api/spotify-callback` to Redirect URIs
4. Copy Client ID and Client Secret to your `.env` file

### 4. OpenAI Setup
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to your `.env` file

### 5. Run the Application
```bash
npm run dev
```

This starts both the server (port 5001) and client (port 3000).

## How to Use

### Spotify Premium Integration
1. Click "Connect Spotify Premium" button
2. Log in to your Spotify Premium account
3. Grant permissions for playback control
4. Songs will now play directly in the app!

### Real-Time Emotion Detection
1. Allow camera access when prompted
2. Look at the camera during analysis
3. Watch real-time emotion detection with face overlays
4. See confidence scores for each emotion
5. Get AI-powered song recommendations based on your mood

### Features
- **Real-time face detection** with bounding boxes
- **Emotion confidence scores** displayed in real-time
- **Smooth animations** during analysis
- **Spotify Premium playback** for recommended songs
- **Volume control** and playback controls
- **Auto-play next/previous** song functionality

## Technical Details

### Face Detection Models
- **TinyFaceDetector**: Fast face detection
- **FaceExpressionNet**: Emotion classification
- **FaceLandmark68Net**: Facial landmark detection
- **FaceRecognitionNet**: Face recognition (for future features)

### Spotify Integration
- **Web Playback SDK**: For actual song playback
- **OAuth 2.0**: Secure authentication
- **Token refresh**: Automatic token management
- **Premium features**: Full playback control

### AI Recommendations
- **OpenAI GPT-4**: Advanced song recommendations
- **Spotify API**: Real song data and metadata
- **User preferences**: Genre and artist preferences
- **Mood-based filtering**: Emotional context matching

## Troubleshooting

### Face Detection Issues
- Ensure camera permissions are granted
- Check that models downloaded successfully
- Try refreshing the page if models fail to load

### Spotify Playback Issues
- Verify Spotify Premium subscription
- Check that Spotify is not playing on another device
- Ensure proper redirect URI configuration

### AI Recommendations
- Verify OpenAI API key is valid
- Check internet connection for API calls
- Fallback recommendations available if AI fails

## Development

### Adding New Features
- **New emotions**: Update `EmotionDetector.js` emotion mapping
- **New UI components**: Add to `components/` directory
- **API endpoints**: Add to `server/index.js`
- **Real-time features**: Use Socket.IO for live updates

### Performance Optimization
- **Model loading**: Models are cached after first load
- **Detection frequency**: Adjustable in `EmotionDetector.js`
- **API rate limiting**: Implemented for external APIs
- **Memory management**: Proper cleanup on component unmount 