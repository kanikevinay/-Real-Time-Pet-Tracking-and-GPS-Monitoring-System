const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Production-ready configuration
const PORT = process.env.PORT || 5501;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const io = socketIo(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Pet data storage - starts empty, pets are only added when registered with IoT devices
let pets = [];

// Registered pets awaiting IoT device connection
let registeredPets = [];

// IoT devices that can be paired with pets
let availableDevices = [
  { id: 'GPS-001', type: 'GPS Collar', isConnected: false },
  { id: 'GPS-002', type: 'GPS Collar', isConnected: false },
  { id: 'GPS-003', type: 'GPS Collar', isConnected: false },
  { id: 'GPS-004', type: 'GPS Tag', isConnected: false },
  { id: 'GPS-005', type: 'GPS Tag', isConnected: false }
];

// System statistics - now calculated dynamically
function calculateSystemStats() {
  const activePets = pets.length;
  const onlinePets = pets.filter(pet => pet.isOnline).length;
  const onlinePercentage = activePets > 0 ? Math.round((onlinePets / activePets) * 100) : 0;
  
  return {
    uptime: 99.9,
    updateFrequency: 2.5,
    monitoring: '24/7',
    gpsAccuracy: '5m',
    activePets: activePets,
    onlinePercentage: onlinePercentage,
    totalRegistered: registeredPets.length + activePets,
    averageBattery: activePets > 0 ? Math.round(pets.reduce((sum, pet) => sum + pet.battery, 0) / activePets) : 0
  };
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/pets', (req, res) => {
  res.json(pets);
});

app.get('/api/stats', (req, res) => {
  res.json(calculateSystemStats());
});

app.get('/api/registered-pets', (req, res) => {
  res.json(registeredPets);
});

app.get('/api/available-devices', (req, res) => {
  res.json(availableDevices.filter(device => !device.isConnected));
});

// Register a new pet
app.post('/api/register-pet', (req, res) => {
  const { name, species, breed, age, avatar } = req.body;
  
  if (!name || !species) {
    return res.status(400).json({ error: 'Name and species are required' });
  }
  
  const newPet = {
    id: uuidv4(),
    name,
    species,
    breed: breed || '',
    age: age || '',
    avatar: avatar || (species.toLowerCase().includes('dog') ? '🐕' : species.toLowerCase().includes('cat') ? '🐱' : '🐾'),
    registeredAt: new Date(),
    status: 'Pending Device'
  };
  
  registeredPets.push(newPet);
  res.json({ success: true, pet: newPet });
});

// Connect IoT device to registered pet
app.post('/api/connect-device', (req, res) => {
  const { petId, deviceId } = req.body;
  
  const petIndex = registeredPets.findIndex(pet => pet.id === petId);
  const deviceIndex = availableDevices.findIndex(device => device.id === deviceId);
  
  if (petIndex === -1 || deviceIndex === -1) {
    return res.status(400).json({ error: 'Pet or device not found' });
  }
  
  if (availableDevices[deviceIndex].isConnected) {
    return res.status(400).json({ error: 'Device already connected' });
  }
  
  // Move pet from registered to active
  const pet = registeredPets.splice(petIndex, 1)[0];
  availableDevices[deviceIndex].isConnected = true;
  
  // Create active pet with device
  const activePet = {
    id: deviceId,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    avatar: pet.avatar,
    battery: Math.floor(Math.random() * 30) + 70, // 70-100%
    status: 'Safe',
    location: {
      lat: 40.7128 + (Math.random() - 0.5) * 0.01,
      lng: -74.0060 + (Math.random() - 0.5) * 0.01
    },
    lastUpdate: new Date(),
    isOnline: true,
    connectedAt: new Date()
  };
  
  pets.push(activePet);
  
  // Broadcast updates
  io.emit('pets_update', pets);
  io.emit('stats_update', calculateSystemStats());
  
  res.json({ success: true, pet: activePet });
});

// Disconnect device
app.post('/api/disconnect-device', (req, res) => {
  const { deviceId } = req.body;
  
  const petIndex = pets.findIndex(pet => pet.id === deviceId);
  const deviceIndex = availableDevices.findIndex(device => device.id === deviceId);
  
  if (petIndex === -1 || deviceIndex === -1) {
    return res.status(400).json({ error: 'Pet or device not found' });
  }
  
  // Remove from active pets and mark device as available
  pets.splice(petIndex, 1);
  availableDevices[deviceIndex].isConnected = false;
  
  // Broadcast updates
  io.emit('pets_update', pets);
  io.emit('stats_update', calculateSystemStats());
  
  res.json({ success: true });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial data
  socket.emit('pets_update', pets);
  socket.emit('stats_update', calculateSystemStats());
  socket.emit('registered_pets_update', registeredPets);
  
  // Handle pet location updates
  socket.on('update_pet_location', (data) => {
    const petIndex = pets.findIndex(pet => pet.id === data.petId);
    if (petIndex !== -1) {
      pets[petIndex].location = data.location;
      pets[petIndex].lastUpdate = new Date();
      
      // Broadcast to all clients
      io.emit('pets_update', pets);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulate real-time pet location updates only for active pets
setInterval(() => {
  if (pets.length > 0) {
    pets.forEach(pet => {
      // Simulate small location changes (within 100 meters)
      const latChange = (Math.random() - 0.5) * 0.001; // ~100m
      const lngChange = (Math.random() - 0.5) * 0.001; // ~100m
      
      pet.location.lat += latChange;
      pet.location.lng += lngChange;
      pet.lastUpdate = new Date();
      
      // Occasionally simulate battery drain
      if (Math.random() < 0.1) {
        pet.battery = Math.max(20, pet.battery - 1);
      }
    });
    
    // Broadcast updates only if there are active pets
    io.emit('pets_update', pets);
  }
  
  // Always broadcast updated stats
  io.emit('stats_update', calculateSystemStats());
}, 2500); // Update every 2.5 seconds as shown in the UI

server.listen(PORT, () => {
  console.log(`🐕 PetTracker Pro server running on port ${PORT}`);
  console.log(`📱 Homepage: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
});
