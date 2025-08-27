# 🏢 Apartment Building Showcase - Professional 3D Construction Demo

A professional 3D interactive website for construction companies featuring a scroll-based apartment building architectural tour. Perfect for client presentations and showcasing modern apartment complex construction capabilities.

## 🎯 Professional Demo Concept

This production-ready showcase demonstrates a sophisticated 3D experience where clients can:

1. **🏢 Building Overview** - Aerial view of the complete apartment complex
2. **🚪 Main Entrance** - Lobby and reception design showcase  
3. **🏠 Wing Elevations** - Unit layouts and balcony arrangements
4. **🌿 Rear Courtyard** - Outdoor amenities and landscaping
5. **🔧 Structural Details** - Construction quality and materials
6. **🏗️ Rooftop Views** - Multi-story engineering excellence
7. **🧱 Material Close-ups** - Building materials and craftsmanship
8. **🌳 Landscaping** - Property development integration
9. **🌅 Aerial Complex** - Complete development layout
10. **🔄 Seamless Loop** - Infinite tour for continuous presentations

## 🚀 Quick Start

### Option 1: Live Demo (Recommended)
Visit the deployed demo: `https://3d-website-liard.vercel.app/`

### Option 2: Local Development
```bash
# Clone or download the project
git clone https://github.com/eyaso/3d-website.git
cd 3d-website

# Start a local server (Python example)
python -m http.server 8080
# OR use Live Server in VS Code
# OR use Node.js serve: npx serve .

# Open in browser
open http://localhost:8080
```

## ✨ Professional Features

- ✅ **Modern Apartment Building** - GLB 3D model with realistic materials
- ✅ **Professional Grass Landscaping** - High-quality texture mapping
- ✅ **Scroll-based Architecture Tour** - Smooth 10-phase camera transitions  
- ✅ **Infinite Loop Presentation** - Perfect for client demos
- ✅ **Ultra-smooth Navigation** - Optimized damping and easing
- ✅ **Responsive Design** - Desktop, tablet, and mobile compatible
- ✅ **Professional UI** - Clean, client-appropriate interface
- ✅ **Smart Loading** - Optimized GLB format for fast loading
- ✅ **Cross-browser Compatible** - Works on all modern browsers

## 🏗️ Technology Stack

### Core Technologies
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Modern styling with smooth animations  
- **JavaScript ES6+** - Interactive functionality and scroll handling
- **Three.js r128** - Professional 3D rendering engine
- **WebGL** - Hardware-accelerated graphics

### 3D Pipeline
- **GLB Format** - Optimized web 3D format with embedded textures
- **PBR Materials** - Physically based rendering for realistic lighting
- **Smart Scaling** - Automatic model sizing and positioning
- **Professional Lighting** - Multi-light setup for architectural presentation

## 📐 Project Structure

```
3d-website/                          # Production-ready apartment showcase
├── index.html                       # Professional HTML with apartment branding
├── style.css                        # Modern UI styling (unchanged)
├── script.js                        # Clean GLB-only 3D functionality  
├── models/
│   ├── Apartment_building.glb       # Main 3D apartment building model
│   ├── grass.jpg                    # Professional grass field texture
│   └── README.md                    # Model documentation and specs
└── README.md                        # This file - project documentation
```

## 🎮 User Controls

### Desktop
- **Mouse Wheel** - Smooth navigation through architectural tour
- **Page Scroll** - Alternative navigation method
- **Trackpad** - Natural scroll gestures

### Mobile & Tablet  
- **Touch Scroll** - Vertical swipe navigation
- **Momentum Scrolling** - Natural mobile feel
- **Responsive Layout** - Optimized for all screen sizes

## 🎨 Customization Guide

### Replace Apartment Building
1. **Export your building as GLB** from Blender/3ds Max/SketchUp
2. **Replace** `models/Apartment_building.glb` with your model
3. **Ensure proper scale** - Real-world apartment building dimensions
4. **Test automatic scaling** - System auto-adjusts camera positions

### Update Branding
1. **Company name** - Edit in `index.html` (line 18)
2. **Colors** - Modify CSS variables in `style.css`
3. **Phase descriptions** - Update `phases` array in `script.js`
4. **Contact info** - Edit footer content in `index.html`

### Camera Tour Adjustment
```javascript
// In script.js - Update phase positions for your building
const phases = [
    {
        number: "01", title: "Building Overview",
        camera: { x: 15, y: 35, z: 25 }, // Adjust for your model
        target: { x: 0, y: 5, z: 0 }
    },
    // ... more phases
];
```

## 📊 Performance Metrics

### Loading Performance
- **GLB Model:** ~10MB compressed 3D apartment building
- **Grass Texture:** ~140KB high-quality grass field
- **Total Assets:** ~10.2MB (including Three.js CDN)
- **First Load:** ~2-4 seconds on broadband
- **Subsequent Loads:** Instant (browser cached)

### Browser Support
- ✅ **Chrome 80+** (Recommended)
- ✅ **Firefox 75+** 
- ✅ **Safari 13+**
- ✅ **Edge 80+**
- ✅ **Mobile browsers** (iOS Safari, Chrome Mobile)

### Model Requirements
- **Format:** GLB (GLTF Binary) only
- **Size:** Recommended under 50MB for web performance
- **Scale:** Real-world apartment building dimensions
- **Materials:** PBR materials for realistic lighting
- **Textures:** Embedded in GLB file

## 📄 License

Professional construction company demonstration. Customize and deploy for your construction business presentations.

---

**🏢 Ready for professional client demos and construction company showcases.**

*Built with modern web technologies for the next generation of construction marketing.*