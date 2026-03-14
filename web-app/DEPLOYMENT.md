# Deployment Guide

## Overview

SoundArch can be deployed to several free hosting platforms. This guide covers three recommended options:

1. **Railway** (Recommended) - Free tier, easy setup
2. **Render** - Free tier with auto-sleep
3. **Fly.io** - Free tier with better EU coverage

---

## Prerequisites

- Git repository (GitHub, GitLab, etc.)
- Account on chosen platform
- Basic command line knowledge

---

## Option 1: Railway (Recommended)

**Free Tier:** $5/month credit, good for small projects

### Why Railway?
- ✅ Automatic deployment from GitHub
- ✅ Easy environment variable management
- ✅ Built-in metrics and logging
- ✅ No credit card required for trial

### Deployment Steps

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `SoundArch` repository

3. **Configure Service**
   - Railway auto-detects Python
   - Root directory: `web-app/backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**
   ```
   ENVIRONMENT=production
   CORS_ORIGINS=https://your-frontend-url.railway.app
   ```

5. **Deploy Frontend** (separate service)
   - Add new service from same repo
   - Root directory: `web-app/frontend`
   - Build command: `npm install && npm run build`
   - Static files directory: `dist`

6. **Get URLs**
   - Railway generates URLs: `your-app.railway.app`
   - Update CORS_ORIGINS with frontend URL
   - Update frontend VITE_API_URL with backend URL

### Railway Configuration File

Create `railway.json` in `web-app/` directory (already included):

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health"
  }
}
```

---

## Option 2: Render

**Free Tier:** Auto-sleep after 15 min inactivity

### Why Render?
- ✅ Generous free tier
- ✅ PostgreSQL included (if needed later)
- ✅ Auto SSL certificates
- ✅ Easy pull request previews

### Deployment Steps

1. **Sign up at [render.com](https://render.com)**

2. **Create Backend Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Name: `soundarch-backend`
   - Environment: Python 3
   - Build command: `cd backend && pip install -r requirements.txt`
   - Start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Free plan

3. **Configure Environment**
   ```
   PYTHON_VERSION=3.11
   ENVIRONMENT=production
   CORS_ORIGINS=https://soundarch-frontend.onrender.com
   ```

4. **Create Frontend Static Site**
   - New → Static Site
   - Name: `soundarch-frontend`
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`

5. **Update Frontend Environment**
   - Add `VITE_API_URL=https://soundarch-backend.onrender.com`
   - Trigger redeploy

### Render Configuration File

Create `render.yaml` in `web-app/` directory (already included).

**Note:** Free tier services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

---

## Option 3: Fly.io

**Free Tier:** 3 shared VMs, 160GB bandwidth

### Why Fly.io?
- ✅ Best for EU/Denmark (Amsterdam datacenter)
- ✅ Full VM control
- ✅ No auto-sleep
- ✅ Better performance

### Deployment Steps

1. **Install flyctl**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Deploy Backend**
   ```bash
   cd web-app/backend
   fly launch
   # Follow prompts:
   # - App name: soundarch-backend
   # - Region: Amsterdam (ams)
   # - PostgreSQL: No
   # - Redis: No
   ```

4. **Set Environment Variables**
   ```bash
   fly secrets set ENVIRONMENT=production
   fly secrets set CORS_ORIGINS=https://soundarch-frontend.fly.dev
   ```

5. **Deploy Frontend**
   ```bash
   cd ../frontend
   fly launch --image nginx:alpine
   # Follow prompts
   ```

6. **Update and Deploy**
   ```bash
   fly deploy
   ```

### Fly.io Configuration

Create `fly.toml` in `web-app/` directory (already included).

---

## Docker Deployment (Self-Hosted)

### Using Docker Compose

1. **Install Docker & Docker Compose**
   - [Docker installation guide](https://docs.docker.com/get-docker/)

2. **Clone Repository**
   ```bash
   git clone https://github.com/MarcoJ03rgensen/SoundArch.git
   cd SoundArch/web-app
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   # Edit .env files with your settings
   ```

4. **Build and Run**
   ```bash
   docker-compose up -d
   ```

5. **Access Application**
   - Frontend: http://localhost:80
   - Backend: http://localhost:8000
   - API docs: http://localhost:8000/docs

### Production Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Environment Variables

### Backend (.env)

```bash
# Required
ENVIRONMENT=production
CORS_ORIGINS=https://your-frontend-url.com

# Optional
TILE_CACHE_DIR=./cache
LOG_LEVEL=INFO
```

### Frontend (.env)

```bash
# Required
VITE_API_URL=https://your-backend-url.com

# Optional
VITE_DEFAULT_CENTER_LAT=56.26
VITE_DEFAULT_CENTER_LNG=9.50
VITE_DEFAULT_ZOOM=7
```

---

## Post-Deployment Checklist

### Backend Verification

- [ ] Health check: `curl https://your-backend/health`
- [ ] API docs accessible: `https://your-backend/docs`
- [ ] Calculate endpoint works
- [ ] CORS configured correctly
- [ ] Logs show no errors

### Frontend Verification

- [ ] Site loads correctly
- [ ] Map displays properly
- [ ] Can place sound source marker
- [ ] Calculate button works
- [ ] Results display on map
- [ ] Mobile responsive

### Performance Testing

```bash
# Test backend response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-backend/health

# Test calculation endpoint
curl -X POST https://your-backend/calculate \
  -H "Content-Type: application/json" \
  -d '{"source":{"lat":56.26,"lng":9.50},"parameters":{}}'
```

---

## Monitoring & Maintenance

### Railway
- Dashboard shows CPU, memory, network usage
- Logs available in web interface
- Automatic restarts on crashes

### Render
- Metrics dashboard included
- Email alerts for downtime
- Manual restarts available

### Fly.io
- `fly logs` for real-time logs
- `fly status` for health check
- `fly scale` to adjust resources

### Docker
```bash
# View logs
docker-compose logs -f backend

# Check container health
docker ps

# Restart service
docker-compose restart backend

# Update deployment
git pull
docker-compose up -d --build
```

---

## Troubleshooting

### Backend Not Starting

1. Check logs for Python errors
2. Verify GDAL is installed (required for DEM processing)
3. Check PORT environment variable
4. Ensure requirements.txt dependencies installed

### Frontend Can't Connect to Backend

1. Verify VITE_API_URL is correct
2. Check CORS_ORIGINS includes frontend URL
3. Ensure backend health check passes
4. Check browser console for errors

### CORS Errors

```python
# Update backend main.py CORS_ORIGINS
CORS_ORIGINS = [
    "https://your-frontend.com",
    "http://localhost:5173",  # Development
]
```

### Slow Performance

1. Enable tile caching (check TILE_CACHE_DIR)
2. Reduce DEM resolution in frontend
3. Scale up server resources
4. Add CDN for frontend static files

---

## Cost Estimates

### Free Tier Comparison

| Platform | Monthly Cost | Auto-Sleep | Best For |
|----------|-------------|------------|----------|
| Railway  | $5 credit   | No         | Development, small projects |
| Render   | $0          | Yes (15min)| Portfolio projects |
| Fly.io   | $0          | No         | EU/Denmark users, production |

### Paid Upgrades (when needed)

| Platform | Starter Price | Features |
|----------|--------------|----------|
| Railway  | $5/month     | More compute, no sleep |
| Render   | $7/month     | No sleep, better CPU |
| Fly.io   | $1.94/month  | Dedicated VM |

---

## Custom Domain (Optional)

### Railway
1. Settings → Domains
2. Add custom domain
3. Update DNS CNAME record

### Render
1. Settings → Custom Domain
2. Add domain
3. Update DNS records as shown
4. SSL auto-provisioned

### Fly.io
```bash
fly certs add yourdomain.com
# Follow DNS instructions
```

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use platform secret management
   - Rotate keys periodically

2. **CORS Configuration**
   - Whitelist specific domains
   - Don't use `*` in production

3. **HTTPS**
   - All platforms provide free SSL
   - Enforce HTTPS redirects

4. **Rate Limiting**
   - Already implemented in backend
   - Adjust limits as needed

---

## Next Steps

1. Choose deployment platform
2. Follow deployment steps
3. Configure environment variables
4. Test all functionality
5. Set up monitoring
6. (Optional) Add custom domain

**Recommended for SoundArch:** Start with **Railway** for ease of use, or **Fly.io** if you're in Denmark/EU for best performance.

---

## Support

If you encounter issues:

1. Check platform status pages
2. Review application logs
3. Consult platform documentation
4. Open GitHub issue with:
   - Platform used
   - Error messages
   - Steps to reproduce
