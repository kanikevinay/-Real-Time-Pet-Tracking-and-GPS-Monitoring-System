# 🐕 PetTracker Pro - Real-Time Pet Tracking System

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=render)](https://your-app-name.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/yourusername/pettracker-pro)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

A professional, real-time IoT-based pet tracking and GPS monitoring system built with modern web technologies. Features live GPS updates, geofencing, dark/light themes, and a responsive dashboard.

## 🌟 Features

- **Real-Time GPS Tracking** - Live location updates via Socket.IO
- **Interactive Maps** - Leaflet.js integration with custom markers
- **IoT Device Management** - Connect and pair GPS collars/tags
- **Geofencing** - Virtual boundaries with instant alerts
- **Dark/Light Themes** - Full theme support with smooth transitions
- **Responsive Design** - Works perfectly on desktop and mobile
- **Live Dashboard** - Real-time statistics and monitoring
- **Pet Registration** - Easy pet onboarding with device pairing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern web browser

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pettracker-pro.git
   cd pettracker-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:5501
   ```

## 🌐 Production Deployment

### Deploy to Render

1. **Push to GitHub** (see GitHub setup below)

2. **Deploy to Render**
   - Fork this repository
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node.js
   - Click "Create Web Service"

3. **Access your live app**
   - Your app will be live at `https://your-app-name.onrender.com`

### Environment Variables (Optional)

```env
PORT=5501
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

## 📱 Usage

### Homepage Features
- System status and live dashboard preview
- Pet registration with device pairing
- Theme toggle (dark/light mode)
- Responsive design for all devices

### Dashboard Features
- Real-time GPS tracking map
- Pet status monitoring
- System statistics and analytics
- Activity feed and alerts
- Device management

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Mapping**: Leaflet.js with OpenStreetMap
- **Icons**: Font Awesome
- **Security**: Helmet.js, CORS
- **Real-time**: WebSocket communication

## 📚 Project Structure

```
pettracker-pro/
├── public/                 # Frontend files
│   ├── homepage.html      # Landing page
│   ├── dashboard.html     # Real-time dashboard
│   ├── styles.css         # Homepage styles + themes
│   ├── dashboard.css      # Dashboard-specific styles
│   ├── app.js            # Homepage functionality
│   └── dashboard.js      # Dashboard functionality
├── server.js             # Express server + Socket.IO
├── package.json          # Dependencies and scripts
├── .gitignore           # Git ignore rules
├── .env.example         # Environment variables template
└── README.md            # This file
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Homepage |
| `GET` | `/dashboard` | Dashboard |
| `POST` | `/api/register-pet` | Register new pet |
| `POST` | `/api/pair-device` | Pair IoT device |
| `GET` | `/api/devices` | Get available devices |

## 🌙 Theme Support

- **Dark/Light Themes** - Complete theme system
- **System Preference Detection** - Respects OS settings  
- **Manual Toggle** - Switch themes instantly
- **Persistent Storage** - Remembers your choice
- **Full Coverage** - All components themed

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Content Security Policy
- Input validation and sanitization
- XSS protection

## 📱 Mobile Responsive

Fully optimized for:
- Desktop computers
- Tablets  
- Mobile phones
- Various screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [Leaflet.js](https://leafletjs.com/) for interactive maps
- [Font Awesome](https://fontawesome.com/) for icons
- [Express.js](https://expressjs.com/) for backend

---

<p align="center">Made with ❤️ for pet safety</p>
