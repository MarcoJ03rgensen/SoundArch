# SoundArch Quick Start Guide

**Get calculating in 5 minutes**

---

## For Researchers (Web Interface)

### Step 1: Access the Application

**Option A: Use Deployed Version**
- Visit: [Your deployed URL]
- No installation required

**Option B: Run Locally**
```bash
# Clone
git clone https://github.com/MarcoJ03rgensen/SoundArch.git
cd SoundArch/web-app

# Backend (Terminal 1)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (Terminal 2)  
cd frontend
npm install
npm run dev

# Open: http://localhost:5173
```

### Step 2: Place Sound Source

1. **Click on map** where church/bell tower is located
2. Red marker appears at your click point

### Step 3: Configure Parameters

**Bell Type:**
- Small: Village chapel (105 dB)
- Medium: Parish church (115 dB) ← **Default**
- Large: Cathedral (120 dB)

**Atmospheric Conditions:**
- Temperature: 15°C (typical)
- Humidity: 70% (moderate)
- Keep defaults for standard conditions

**Advanced (Optional):**
- Source height: Bell tower height (default 30m)
- Ground factor: 0-1 (0=hard, 1=soft, default 0.5)

### Step 4: Calculate

1. Click **"Calculate Propagation"** button
2. Wait 5-10 seconds (processing terrain)
3. Colored contours appear on map:
   - **Red:** Very audible (>60 dB)
   - **Orange:** Clearly audible (50-60 dB)
   - **Yellow:** Audible (40-50 dB)  
   - **Green:** Barely audible (30-40 dB)
   - **Blue:** Threshold (~20 dB)

### Step 5: Interpret Results

**Maximum Audible Distance:**
- Shown in results panel
- Typical: 3-8 km depending on bell size

**Isoline Contours:**
- Each line = constant sound level
- Terrain effects visible (valleys vs hills)

**Export (Optional):**
- Click "Export GeoJSON"
- Import to QGIS for further analysis

---

## Example Scenarios

### Medieval Danish Church

**Setup:**
- Location: 56.26°N, 9.50°E (example in Jutland)
- Bell type: Medium (typical parish church)
- Temperature: 15°C
- Humidity: 70%
- Source height: 25m (stone tower)

**Expected Result:**
- Audibility: ~6 km radius
- Sound visible in valleys, reduced over hills

**Use Case:**
- "Could neighboring village hear this church?"
- Compare isoline radius with village distance

### Cathedral Bell Analysis

**Setup:**
- Bell type: Large
- Source height: 40m (tall spire)
- Same atmospheric conditions

**Expected Result:**
- Audibility: ~8 km radius
- Demonstrates territorial reach of cathedral

**Use Case:**
- "How far did ceremonial bells travel?"
- Model acoustic landscape of medieval city

---

## Troubleshooting

### "No contours appear"
- Check if bell type is selected
- Ensure source marker is placed
- Verify map has loaded completely
- Try closer zoom level

### "Calculation takes too long"
- Reduce max distance (default: 10 km)
- Decrease number of angles (default: 360)
- Lower DEM resolution (trade accuracy for speed)

### "Results seem wrong"
- Check atmospheric parameters (extreme values affect range)
- Verify source height is reasonable (10-50m typical)
- Consider terrain: mountains block sound significantly

### "Map not loading"
- Check internet connection (needs to load tiles)
- Try refreshing page
- Clear browser cache

---

## Command Line Quick Test

**Test backend directly:**

```bash
# Start backend
cd backend
uvicorn main:app --reload

# In another terminal, test calculation
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "lat": 56.26,
      "lng": 9.50
    },
    "parameters": {
      "bell_type": "medium_bell"
    }
  }' | jq '.max_audible_distance'

# Should output: ~5800 (meters)
```

---

## Next Steps

1. **Explore different locations**
   - Test various terrains (flat, hilly, mountainous)
   - Compare coastal vs inland propagation

2. **Vary parameters**
   - Try different bell sizes
   - Test atmospheric variations
   - Adjust source height

3. **Export for analysis**
   - Export GeoJSON
   - Import to QGIS
   - Overlay with historical maps

4. **Read detailed documentation**
   - [README.md](README.md) - Full documentation
   - [ACADEMIC_VALIDATION.md](ACADEMIC_VALIDATION.md) - Validation details
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Hosting instructions

---

## Support

**Issues?**
- GitHub Issues: https://github.com/MarcoJ03rgensen/SoundArch/issues
- Include: what you tried, what happened, what you expected

**Questions?**
- Check [README.md](README.md) first
- Open a GitHub discussion for research questions

---

**Happy calculating!** 🔔
