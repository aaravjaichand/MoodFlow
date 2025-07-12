# MoodFlow Setup Guide

MoodFlow is an AI-powered music discovery app that analyzes your emotions and recommends songs using OpenAI GPT-4 and Spotify.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
cd client && npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
# OpenAI API Key (required for emotion analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Spotify API Credentials (required for song data)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Server Configuration
PORT=5001
```

### 3. API Setup

#### OpenAI Setup
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file

#### Spotify Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Copy Client ID and Client Secret to your `.env` file

### 4. Run the Application
```bash
npm run dev
```

This starts both the server (port 5001) and client (port 3000).

## How to Use

1. **Open the app** at `http://localhost:3000`
2. **Navigate to Mood Analyzer** from the menu
3. **Allow camera access** when prompted
4. **Click "Start Mood Analysis"** to capture your photo
5. **Wait for AI analysis** (camera will be hidden during processing)
6. **View song recommendations** based on your detected mood
7. **Play songs** using the built-in audio player

## Features

- **AI Emotion Detection**: Uses OpenAI GPT-4 to analyze facial expressions
- **Spotify Integration**: Real song data and preview URLs
- **Audio Player**: Play song previews directly in the browser
- **Real-time Analysis**: Instant mood detection and song recommendations

## Troubleshooting

### Common Issues
- **Port 3000 in use**: Kill the process or use a different port
- **Port 5001 in use**: Kill the process or change PORT in .env
- **Camera not working**: Check browser permissions
- **API errors**: Verify your API keys are correct

### Development
- Server runs on `http://localhost:5001`
- Client runs on `http://localhost:3000`
- Check console for detailed error messages 