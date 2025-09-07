# Deployment Troubleshooting Guide

## Current Configuration

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "./package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "./dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Expected Build Output Structure

```
dist/
├── index.html
├── manifest.json
├── sw.js
├── vite.svg
└── assets/
    ├── firebase-DyEiihNY.js
    ├── index-CInMXqA7.js
    ├── index-Fag8eDFd.css
    ├── ui-VP1SIp2Q.js
    └── vendor-BI77Avdc.js
```

## MIME Type Issues Fixed

1. **Added `"handle": "filesystem"`** - Ensures static files are served directly
2. **Proper route order** - Static files checked before SPA fallback
3. **Correct base URL** - Set to `/` in vite.config.js

## Environment Variables Needed on Vercel

Make sure these are set in your Vercel project settings:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID
- NODE_ENV=production

## Common Issues & Solutions

### MIME Type Errors

- ✅ Fixed with proper `vercel.json` configuration
- ✅ Static files now served with correct headers

### Module Loading Issues

- ✅ Firebase properly chunked and optimized
- ✅ All dependencies correctly bundled

### Routing Issues

- ✅ SPA routing configured with proper fallbacks
- ✅ Static assets excluded from SPA routing
