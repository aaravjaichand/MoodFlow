# Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Project Structure
- [ ] `vercel.json` is properly configured
- [ ] `api/index.js` exists and exports the app
- [ ] `client/package.json` has all required dependencies
- [ ] `client/public/_redirects` exists for SPA routing
- [ ] Root `package.json` has `vercel-build` script

### ✅ Environment Variables
- [ ] `OPENAI_API_KEY` - Required for emotion analysis
- [ ] `SPOTIFY_CLIENT_ID` - Optional for Spotify integration
- [ ] `SPOTIFY_CLIENT_SECRET` - Optional for Spotify integration
- [ ] `SPOTIFY_REDIRECT_URI` - Optional for Spotify integration
- [ ] Firebase variables (if using authentication)

### ✅ Code Quality
- [ ] No hardcoded API keys in client-side code
- [ ] CORS is properly configured for production
- [ ] API endpoints handle errors gracefully
- [ ] Client-side routing is configured correctly

### ✅ Build Configuration
- [ ] `npm run build` works locally
- [ ] All dependencies are in `package.json`
- [ ] Node.js version is specified (>=18.0.0)
- [ ] Build output goes to `client/build/`

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

### 3. Configure Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all required environment variables
3. Set for Production, Preview, and Development

### 4. Deploy
1. Click "Deploy"
2. Monitor build logs
3. Test the deployed application

## Post-Deployment Verification

### ✅ API Endpoints
- [ ] `/api/health` returns 200 OK
- [ ] `/api/analyze-emotion` accepts POST requests
- [ ] `/api/get-recommendations` accepts POST requests
- [ ] CORS headers are set correctly

### ✅ Frontend
- [ ] Home page loads without errors
- [ ] Emotion analysis works
- [ ] Music recommendations display
- [ ] Client-side routing works
- [ ] Static assets load correctly

### ✅ Performance
- [ ] Page load time is reasonable
- [ ] API response times are acceptable
- [ ] No console errors in browser
- [ ] Images and assets load properly

## Troubleshooting Common Issues

### Build Failures
- Check that all dependencies are installed
- Verify Node.js version compatibility
- Look for syntax errors in code

### API Errors
- Verify environment variables are set
- Check API function timeout (30s)
- Ensure CORS is configured properly

### Frontend Issues
- Check that build output is correct
- Verify static file serving
- Test client-side routing

### Environment Variables
- Ensure all variables are set in Vercel
- Check for typos in variable names
- Verify no extra spaces or quotes

## Monitoring

### Vercel Dashboard
- [ ] Check Function logs for API errors
- [ ] Monitor build success/failure
- [ ] Review performance metrics

### Application Monitoring
- [ ] Test all user flows
- [ ] Check error rates
- [ ] Monitor response times

## Security Checklist

- [ ] No API keys in client-side code
- [ ] CORS configured for production domains
- [ ] Security headers set in `vercel.json`
- [ ] Environment variables properly secured

## Performance Checklist

- [ ] Static assets cached properly
- [ ] API responses optimized
- [ ] Client-side routing configured
- [ ] Build process optimized

## Final Steps

1. **Test thoroughly** - Go through all user flows
2. **Monitor performance** - Check load times and errors
3. **Set up monitoring** - Consider error tracking
4. **Configure domain** - Set up custom domain if needed
5. **Document issues** - Keep track of any problems found

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Project Issues](https://github.com/your-repo/issues)

---

**Remember**: Always test locally first with `vercel dev` before deploying to production! 