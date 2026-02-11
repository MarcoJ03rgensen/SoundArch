# Next Steps - Getting Your Application Live

**You now have a complete, production-ready web application!** 🎉

Here's exactly what to do next.

---

## 👀 Review the Pull Request

**Pull Request Created:** [#1](https://github.com/MarcoJ03rgensen/SoundArch/pull/1)

1. **Review the changes:**
   - Visit: https://github.com/MarcoJ03rgensen/SoundArch/pull/1
   - Look at files changed
   - Read the PR description

2. **Merge when ready:**
   ```bash
   # Option A: Via GitHub website (recommended)
   # Click "Merge pull request" button
   
   # Option B: Command line
   git checkout main
   git merge web-app-improvements
   git push origin main
   ```

---

## 🚀 Deploy to Production (Choose One)

### Option 1: Railway (Recommended - Easiest)

**Why Railway:**
- ✅ Free $5/month credit
- ✅ Auto-deploy from GitHub
- ✅ No sleep/downtime
- ✅ Easy setup

**Steps:**

1. **Sign up:** https://railway.app (use GitHub login)

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `MarcoJ03rgensen/SoundArch`
   - Branch: `main` (after merging PR)

3. **Configure backend service:**
   - Root directory: `web-app/backend`
   - Build command: Auto-detected
   - Start command: Auto-detected from railway.json

4. **Add environment variables:**
   ```
   ENVIRONMENT=production
   CORS_ORIGINS=https://your-frontend-url.railway.app
   ```

5. **Deploy frontend (separate service):**
   - Add new service from same repo
   - Root directory: `web-app/frontend`
   - Static site configuration
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

6. **Update CORS:**
   - Get frontend URL from Railway
   - Add to backend CORS_ORIGINS
   - Redeploy backend

7. **Done!** 🎉
   - Backend: `https://soundarch-backend.railway.app`
   - Frontend: `https://soundarch-frontend.railway.app`

**Time estimate:** 15 minutes

---

### Option 2: Render (Free Tier)

**Why Render:**
- ✅ 100% free
- ✅ Auto-SSL certificates
- ✅ Easy PostgreSQL if needed later
- ⚠️ Auto-sleeps after 15 min inactivity

**Steps:**

1. **Sign up:** https://render.com

2. **Create Blueprint:**
   - New → Blueprint
   - Connect GitHub repository
   - Uses `render.yaml` (already configured)

3. **Wait for deployment:**
   - Backend and frontend deploy automatically
   - Takes ~5-10 minutes

4. **Get URLs:**
   - Backend: `https://soundarch-backend.onrender.com`
   - Frontend: `https://soundarch-frontend.onrender.com`

5. **Update environment variables:**
   - In Render dashboard, add:
   ```
   VITE_API_URL=https://soundarch-backend.onrender.com
   CORS_ORIGINS=https://soundarch-frontend.onrender.com
   ```

**Time estimate:** 20 minutes (including build time)

**Note:** First request after sleep takes ~30 seconds to wake up.

---

### Option 3: Fly.io (Best for EU/Denmark)

**Why Fly.io:**
- ✅ Amsterdam datacenter (closest to Denmark)
- ✅ No auto-sleep
- ✅ Better performance for EU users
- ✅ Free tier sufficient

**Steps:**

1. **Install flyctl:**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux/WSL
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   flyctl auth login
   ```

3. **Deploy backend:**
   ```bash
   cd web-app/backend
   flyctl launch
   # Choose:
   # - App name: soundarch-backend
   # - Region: ams (Amsterdam)
   # - PostgreSQL: No
   # - Redis: No
   ```

4. **Set secrets:**
   ```bash
   flyctl secrets set ENVIRONMENT=production
   flyctl secrets set CORS_ORIGINS=https://soundarch-frontend.fly.dev
   ```

5. **Deploy frontend:**
   ```bash
   cd ../frontend
   flyctl launch
   # App name: soundarch-frontend
   ```

6. **Update frontend env:**
   ```bash
   flyctl secrets set VITE_API_URL=https://soundarch-backend.fly.dev
   ```

**Time estimate:** 25 minutes

---

### Option 4: Docker (Self-Hosted)

**Why Docker:**
- ✅ Full control
- ✅ Run on your own server
- ✅ No third-party dependencies

**Steps:**

1. **Install Docker:**
   - Follow: https://docs.docker.com/get-docker/

2. **Clone and configure:**
   ```bash
   git clone https://github.com/MarcoJ03rgensen/SoundArch.git
   cd SoundArch/web-app
   
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   # Edit .env files as needed
   ```

3. **Build and run:**
   ```bash
   docker-compose up -d
   ```

4. **Access:**
   - Frontend: http://localhost:80
   - Backend: http://localhost:8000
   - API docs: http://localhost:8000/docs

**Time estimate:** 30 minutes (including Docker installation)

---

## ✅ Post-Deployment Testing

### 1. Backend Health Check

```bash
# Replace with your backend URL
curl https://your-backend-url.com/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

### 2. API Documentation

Visit: `https://your-backend-url.com/docs`

- Should show interactive API documentation
- Try the `/calculate` endpoint with example data

### 3. Frontend Functionality

Test these features:

- [ ] Site loads correctly
- [ ] Map displays
- [ ] Click to place marker
- [ ] Select bell type
- [ ] Adjust parameters
- [ ] Click "Calculate"
- [ ] Contours appear on map
- [ ] Results show in panel
- [ ] Export GeoJSON works

### 4. Mobile Testing

- [ ] Load on phone/tablet
- [ ] Map is responsive
- [ ] Controls are accessible
- [ ] Touch interactions work

---

## 📝 Update Documentation

### 1. Add Your URL to README

Edit `web-app/README.md`:

```markdown
## Quick Start

### For Researchers

1. **Access the web application:**
   - Live demo: https://your-app-url.com  ← ADD THIS
   - Or run locally (see below)
```

### 2. Update QUICKSTART.md

Add your deployed URL in Step 1:

```markdown
**Option A: Use Deployed Version**
- Visit: https://your-app-url.com  ← ADD THIS
- No installation required
```

### 3. Share Your Application

Create social media posts, emails, etc. Example:

> 🔔 Introducing SoundArch Web Application!
> 
> Calculate acoustic propagation for archaeological research - now in your browser!
> 
> ✅ ISO 9613-2:2024 compliant
> ✅ Church bell validation
> ✅ Terrain-aware calculations
> ✅ Interactive map visualization
> 
> Try it: https://your-app-url.com
> 
> GitHub: https://github.com/MarcoJ03rgensen/SoundArch
> #Archaeoacoustics #OpenScience #Research

---

## 🎓 Start Using It

### Example 1: Your First Calculation

1. **Open your deployed app**
2. **Click on map** somewhere in Denmark (e.g., Aarhus area)
3. **Select "Medium Bell"** (default)
4. **Keep default weather** (15°C, 70% humidity)
5. **Click "Calculate Propagation"**
6. **Wait 5-10 seconds**
7. **See results!**
   - Colored contours show audibility zones
   - Max distance shown in results panel
   - Try zooming in/out

### Example 2: Compare Bell Sizes

1. **Place marker** at same location
2. **Select "Small Bell"**
3. **Calculate** - note the distance
4. **Change to "Large Bell"**
5. **Calculate again**
6. **Compare:** Large bell audible much farther!

### Example 3: Export to QGIS

1. **Run a calculation**
2. **Click "Export GeoJSON"**
3. **Open QGIS**
4. **Layer → Add Layer → Add Vector Layer**
5. **Select downloaded GeoJSON file**
6. **Style as needed**
7. **Overlay with historical maps**

---

## 📚 Learn More

### Read the Documentation

1. **README.md** - Complete project guide
2. **QUICKSTART.md** - 5-minute tutorial
3. **ACADEMIC_VALIDATION.md** - Validation details
4. **DEPLOYMENT.md** - Detailed platform guides
5. **EXAMPLES.json** - 8 ready-to-use scenarios

### Run the Test Suite

```bash
cd web-app/backend
pytest tests/test_acoustic_engine.py -v

# All tests should pass ✅
```

### Understand the Science

- Read **ACADEMIC_VALIDATION.md** section on ISO 9613-2:2024
- Check Valencia Cathedral validation
- Review uncertainty analysis (±3.2 dB)
- Understand limitations for your use case

---

## 👥 Share with Community

### Academic Community

- Email archaeoacoustics researchers
- Post to relevant academic forums
- Present at conferences
- Submit to relevant journals

### Social Media

- Twitter/X: #Archaeoacoustics #OpenScience
- LinkedIn: Post in archaeology groups
- ResearchGate: Share project
- Academia.edu: Post documentation

### GitHub

- Star the repository ⭐
- Share with colleagues
- Open discussions for questions
- Contribute improvements

---

## 🔧 Customize (Optional)

### Change Colors

Edit `frontend/src/App.tsx`:

```typescript
// Isoline colors
const getColorForDb = (db: number) => {
  if (db >= 60) return '#ff0000';  // Red - change to your color
  if (db >= 50) return '#ff8800';  // Orange
  if (db >= 40) return '#ffcc00';  // Yellow
  if (db >= 30) return '#88ff00';  // Green
  return '#0088ff';                 // Blue
};
```

### Adjust Default Settings

Edit `frontend/src/components/Controls.tsx`:

```typescript
const [temperature, setTemperature] = useState(15);  // Change default
const [humidity, setHumidity] = useState(70);        // Change default
```

### Add Custom Bell Types

Edit `backend/main.py`:

```python
CHURCH_BELL_PROFILES = {
    # Add your custom bell
    "custom_bell": {
        "source_level_db": 118,
        "fundamental_hz": 275,
        "description": "My Custom Bell"
    },
    # ... existing bells
}
```

---

## ❓ Troubleshooting

### Backend Won't Start

1. Check logs in platform dashboard
2. Verify Python version (3.11+)
3. Ensure GDAL is installed
4. Check environment variables

### Frontend Shows Errors

1. Check browser console (F12)
2. Verify VITE_API_URL is correct
3. Check CORS configuration in backend
4. Try hard refresh (Ctrl+Shift+R)

### Calculations Timeout

1. Reduce max distance (10km default)
2. Decrease number of angles (360 default)
3. Lower DEM resolution
4. Check backend logs for errors

### Need Help?

- GitHub Issues: https://github.com/MarcoJ03rgensen/SoundArch/issues
- Include:
  - What you tried
  - What happened
  - What you expected
  - Platform (Railway/Render/Fly.io/Docker)
  - Browser/OS if frontend issue

---

## 🎓 Citation

When you use this in research:

```
Jørgensen, M. (2026). SoundArch: ISO 9613-2:2024 Compliant Acoustic 
Propagation Calculator for Archaeological Research (Version 2.0.0) 
[Computer software]. https://github.com/MarcoJ03rgensen/SoundArch
```

And cite the standards/references used - see README.md

---

## 🚀 You're Ready!

**Checklist:**

- [ ] Pull request merged to main
- [ ] Deployed to hosting platform
- [ ] Tested all functionality
- [ ] Updated documentation with URLs
- [ ] Ran first successful calculation
- [ ] Shared with colleagues

**What you have:**

✅ Production-ready web application  
✅ ISO standards compliant  
✅ Academically validated  
✅ Comprehensive documentation  
✅ Multiple deployment options  
✅ Test suite included  
✅ Ready for research use

**Next steps:**

1. Deploy (15-30 minutes)
2. Test (10 minutes)
3. Use (start your research!)
4. Share (help the community)

---

**Congratulations!** 🎉

You now have a complete, academically rigorous, production-ready acoustic propagation calculator for your archaeoacoustic research.

**Happy calculating!** 🔔

---

*Questions? Open a GitHub issue or discussion.*
