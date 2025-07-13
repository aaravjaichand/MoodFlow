#!/bin/bash

# MoodFlow Vercel Deployment Script
echo "🚀 Setting up MoodFlow for Vercel deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Build the client
echo "🔨 Building client..."
cd client && npm run build && cd ..

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo "❌ Error: Client build failed. Please check the build logs."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "🎯 Next steps for Vercel deployment:"
echo "1. Push your code to GitHub"
echo "2. Go to vercel.com and create a new project"
echo "3. Import your GitHub repository"
echo "4. Set up environment variables in Vercel dashboard:"
echo "   - OPENAI_API_KEY"
echo "   - SPOTIFY_CLIENT_ID"
echo "   - SPOTIFY_CLIENT_SECRET"
echo "5. Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md" 