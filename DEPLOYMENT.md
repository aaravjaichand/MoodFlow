# Vercel Deployment Guide

This guide will help you deploy your MoodFlow application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to a GitHub repository
3. Environment variables configured

## Environment Variables

You'll need to set up the following environment variables in your Vercel project:

### Required Environment Variables

1. **OpenAI API Key** (for emotion analysis and music recommendations)
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key from [platform.openai.com](https://platform.openai.com)

2. **Spotify API Credentials** (for music recommendations)
   - Name: `SPOTIFY_CLIENT_ID`
   - Value: Your Spotify Client ID from [developer.spotify.com](https://developer.spotify.com)
   - Name: `SPOTIFY_CLIENT_SECRET`
   - Value: Your Spotify Client Secret

### Optional Environment Variables

3. **Firebase Configuration** (for user authentication)
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your MoodFlow project

### 2. Configure Build Settings

Vercel will automatically detect the project structure, but you can verify these settings:

- **Framework Preset**: Other
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install && cd client && npm install`

### 3. Set Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add all the required environment variables listed above
3. Make sure to set them for "Production", "Preview", and "Development" environments

### 4. Deploy

1. Click "Deploy" in the Vercel dashboard
2. Vercel will automatically build and deploy your application
3. Once deployed, you'll get a URL like `https://your-app-name.vercel.app`

## Project Structure

The project is configured for Vercel with the following structure:

```
├── api/
│   └── index.js          # Serverless API functions
├── client/
│   ├── src/              # React frontend
│   ├── package.json      # Frontend dependencies
│   └── build/            # Built frontend (generated)
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## API Endpoints

The following API endpoints are available:

- `GET /api/health` - Health check endpoint
- `POST /api/analyze-emotion` - Analyze emotion from image
- `POST /api/get-recommendations` - Get music recommendations based on mood

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are properly installed
   - Verify that the build command is correct
   - Check the build logs in Vercel dashboard

2. **API Errors**
   - Ensure all environment variables are set correctly
   - Check that API keys are valid and have proper permissions
   - Verify CORS settings in the API

3. **Frontend Not Loading**
   - Check that the build output directory is correct
   - Verify that the React app is building successfully
   - Check browser console for any JavaScript errors

### Environment Variable Issues

If you're getting API errors, make sure:

1. All environment variables are set in Vercel dashboard
2. Variables are set for all environments (Production, Preview, Development)
3. API keys are valid and have proper permissions
4. No typos in variable names

## Local Development

To test locally before deploying:

1. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```

2. Set up environment variables in a `.env` file in the client directory

3. Start the development server:
   ```bash
   npm run dev
   ```

## Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions provided by Vercel

## Monitoring

- Use Vercel's built-in analytics to monitor your application
- Check the "Functions" tab to monitor API performance
- Set up error tracking with services like Sentry

## Support

If you encounter issues:

1. Check the Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review the build logs in your Vercel dashboard
3. Check the browser console for frontend errors
4. Verify API endpoints are working with tools like Postman 