# Deployment Guide

## Prerequisites
- Node.js installed locally
- GitHub account
- Vercel account
- Railway or Render account

## Backend Deployment (Render/Railway)
1. Push the code to GitHub.
2. Connect your repository to Render/Railway.
3. Select the `backend` directory as the Root Directory.
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (If using PostgreSQL instead of SQLite)
7. Deploy!

## Frontend Deployment (Vercel)
1. Import your GitHub repository to Vercel.
2. Select the `frontend` directory.
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_BASE_URL`: (The deployed URL of your backend, e.g., `https://quiklee-backend.onrender.com/api`)
7. Click Deploy!
