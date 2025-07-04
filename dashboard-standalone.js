// Standalone Dashboard for Live Server
// This provides dashboard functionality when using VS Code Live Server

// Global variables
let map;
let pets = [];
let markers = [];
let currentFilter = 'all';

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('pettracker-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pettracker-theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeMap();
    initializeDashboard();
    setupEventListeners();
    showLoadingOverlay();
    
    setTimeout(() => {
        hideLoadingOverlay();
        showNotification('info', 'Dashboard loaded. Running in Live Server mode - start Node.js server for full functionality.');
    }, 2000);
});

function initializeDashboard() {
    console.log('🚀 Dashboard initialized (Live Server Mode)');
    
    // Check if Socket.IO is available
    if (typeof io !== 'undefined') {
        console.log('📡 Socket.IO detected - Using real-time mode');
        initializeSocketIO();
    } else {
        console.log('📡 Socket.IO not available - Using standalone mode');
        initializeStandaloneMode();
    }
}

function initializeSocketIO() {
    // Original Socket.IO functionality for when running with Node.js server
    const socket = io();
    
    socket.on('connect', () => {
        console.log('📡 Connected to real-time system');
        hideLoadingOverlay();
    });
    
    socket.on('pets_update', (petsData) => {
        pets = petsData;
        updateDashboard();
        updateMap();
    });
    
    socket.on('stats_update', (statsData) => {
        updateStats(statsData);
    });
    
    socket.on('disconnect', () => {
        console.log('📡 Disconnected from real-time system');
        showNotification('warning', 'Connection lost. Attempting to reconnect...');
    });
}

function initializeStandaloneMode() {
    // Standalone mode without Socket.IO
    loadSampleData();
    updateDashboard();
    updateMap();
    updateStats();
    
    // Simulate real-time updates
    setInterval(() => {
        if (pets.length > 0) {
            simulateMovement();
            updateMap();
            addActivityLog('GPS coordinates updated', 'info');
        }
    }, 5000);
}

function loadSampleData() {
    // Load sample pets from localStorage or create demo data
    const savedPets = localStorage.getItem('pettracker-pets');
    if (savedPets) {
        pets = JSON.parse(savedPets);
    } else {
        // No pets initially - user needs to add them
        pets = [];
    }
}

function simulateMovement() {
    pets.forEach(pet => {
        if (pet.isOnline) {
            // Simulate small movements
            pet.location.lat += (Math.random() - 0.5) * 0.001;
            pet.location.lng += (Math.random() - 0.5) * 0.001;
            
            // Simulate battery drain
            if (Math.random() < 0.1) {
                pet.battery = Math.max(0, pet.battery - 1);
            }
            
            // Update status based on battery
            if (pet.battery < 20) {
                pet.status = 'warning';
            } else if (pet.battery < 10) {
                pet.status = 'danger';
            } else {
                pet.status = 'safe';
            }
        }
    });
    
    // Save to localStorage
    localStorage.setItem('pettracker-pets', JSON.stringify(pets));
}

// Map initialization
function initializeMap() {
    // Default location (San Francisco)
    const defaultLocation = [37.7749, -122.4194];
    
    map = L.map('map').setView(defaultLocation, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add a sample marker
    L.marker(defaultLocation).addTo(map)
        .bindPopup('San Francisco<br>Sample Location')
        .openPopup();
}

function updateMap() {
    // Clear existing markers
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
    
    // Add markers for each pet
    pets.forEach(pet => {
        if (pet.location) {
            const marker = L.marker([pet.location.lat, pet.location.lng]).addTo(map);
            
            const statusColor = getStatusColor(pet.status);
            const popupContent = `
                <div class="map-popup">
                    <h3>${pet.avatar} ${pet.name}</h3>
                    <p><strong>Status:</strong> <span style="color: ${statusColor}">${pet.status}</span></p>
                    <p><strong>Battery:</strong> ${pet.battery}%</p>
                    <p><strong>Device:</strong> ${pet.id}</p>
                    <p><strong>Last Update:</strong> Just now</p>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            markers.push(marker);
        }
    });
    
    // Center map on pets if any exist
    if (pets.length > 0 && pets[0].location) {
        map.setView([pets[0].location.lat, pets[0].location.lng], 13);
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'safe': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'danger': return '#ef4444';
        default: return '#6b7280';
    }
}

function centerMap() {
    if (pets.length > 0 && pets[0].location) {
        map.setView([pets[0].location.lat, pets[0].location.lng], 13);
    }
}

function toggleSatellite() {
    // Toggle between street and satellite view
    // This would require additional tile layers in a real implementation
    showNotification('info', 'Satellite view toggle would be implemented with additional map layers.');
}

// Dashboard updates
function updateDashboard() {
    updatePetsList();
    updateStats();
}

function updatePetsList() {
    const petsList = document.getElementById('petsList');
    if (!petsList) return;
    
    const filteredPets = currentFilter === 'all' ? pets : pets.filter(pet => pet.status === currentFilter);
    
    if (filteredPets.length === 0) {
        petsList.innerHTML = `
            <div class="dashboard-empty-state">
                <i class="fas fa-paw"></i>
                <h3>No ${currentFilter === 'all' ? 'Active' : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Pets</h3>
                <p>${currentFilter === 'all' ? 'Register your first pet to start real-time tracking' : `No pets with ${currentFilter} status`}</p>
                <button class="btn-primary" onclick="window.location.href='../index.html'">
                    <i class="fas fa-plus"></i>
                    Register Pet
                </button>
            </div>
        `;
        return;
    }
    
    petsList.innerHTML = '';
    filteredPets.forEach(pet => {
        const petElement = createDashboardPetElement(pet);
        petsList.appendChild(petElement);
    });
}

function createDashboardPetElement(pet) {
    const petDiv = document.createElement('div');
    petDiv.className = 'dashboard-pet-item';
    
    const statusClass = pet.status || 'safe';
    const batteryColor = pet.battery > 50 ? '#10b981' : pet.battery > 20 ? '#f59e0b' : '#ef4444';
    
    petDiv.innerHTML = `
        <div class="pet-header">
            <div class="pet-title">
                <div class="pet-avatar-large">${pet.avatar}</div>
                <div class="pet-name-info">
                    <h3>${pet.name}</h3>
                    <div class="pet-id-info">${pet.id} • ${pet.type}</div>
                </div>
            </div>
            <div class="pet-status-badge ${statusClass}">${statusClass}</div>
        </div>
        <div class="pet-details">
            <div class="pet-detail">
                <div class="pet-detail-label">Battery</div>
                <div class="pet-detail-value" style="color: ${batteryColor}">${pet.battery}%</div>
            </div>
            <div class="pet-detail">
                <div class="pet-detail-label">Connection</div>
                <div class="pet-detail-value">${pet.isOnline ? 'Online' : 'Offline'}</div>
            </div>
            <div class="pet-detail">
                <div class="pet-detail-label">Last Update</div>
                <div class="pet-detail-value">Just now</div>
            </div>
        </div>
    `;
    
    return petDiv;
}

function updateStats(statsData = null) {
    const totalPetsEl = document.getElementById('totalPets');
    const onlinePetsEl = document.getElementById('onlinePets');
    const averageBatteryEl = document.getElementById('averageBattery');
    const connectedDevicesEl = document.getElementById('connectedDevices');
    
    if (statsData) {
        // Use real data from server
        if (totalPetsEl) totalPetsEl.textContent = statsData.activePets || 0;
        if (onlinePetsEl) onlinePetsEl.textContent = statsData.onlinePercentage + '%' || '0%';
        if (averageBatteryEl) averageBatteryEl.textContent = statsData.averageBattery + '%' || '0%';
        if (connectedDevicesEl) connectedDevicesEl.textContent = statsData.activePets || 0;
    } else {
        // Calculate from local data
        const totalPets = pets.length;
        const onlinePets = pets.filter(pet => pet.isOnline).length;
        const onlinePercentage = totalPets > 0 ? Math.round((onlinePets / totalPets) * 100) : 0;
        const averageBattery = totalPets > 0 ? Math.round(pets.reduce((sum, pet) => sum + pet.battery, 0) / totalPets) : 0;
        
        if (totalPetsEl) totalPetsEl.textContent = totalPets;
        if (onlinePetsEl) onlinePetsEl.textContent = onlinePercentage + '%';
        if (averageBatteryEl) averageBatteryEl.textContent = averageBattery + '%';
        if (connectedDevicesEl) connectedDevicesEl.textContent = totalPets;
    }
}

function filterPets() {
    const filterSelect = document.getElementById('statusFilter');
    currentFilter = filterSelect.value;
    updatePetsList();
}

// Pet management
function showAddPet() {
    const modal = document.getElementById('addPetModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function hideAddPet() {
    const modal = document.getElementById('addPetModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('addPetForm');
        if (form) form.reset();
    }
}

function handleAddPet(formData) {
    const petData = {
        id: 'GPS-' + String(Date.now()).slice(-3),
        name: formData.get('petName'),
        type: formData.get('petType'),
        avatar: formData.get('petType') === 'dog' ? '🐕' : formData.get('petType') === 'cat' ? '🐱' : '🐾',
        battery: 85 + Math.floor(Math.random() * 15),
        status: 'safe',
        isOnline: true,
        location: {
            lat: 37.7749 + (Math.random() - 0.5) * 0.01,
            lng: -122.4194 + (Math.random() - 0.5) * 0.01
        }
    };
    
    pets.push(petData);
    localStorage.setItem('pettracker-pets', JSON.stringify(pets));
    
    updateDashboard();
    updateMap();
    hideAddPet();
    
    showNotification('success', `Pet "${petData.name}" added successfully!`);
    addActivityLog(`New pet "${petData.name}" added to tracking system`, 'success');
}

// Activity logging
function addActivityLog(message, type = 'info') {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const activity = document.createElement('div');
    activity.className = 'activity-item';
    activity.innerHTML = `
        <div class="activity-icon ${type}">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info'}"></i>
        </div>
        <div class="activity-text">${message}</div>
        <div class="activity-time">Just now</div>
    `;
    
    activityList.insertBefore(activity, activityList.firstChild);
    
    // Keep only last 10 activities
    while (activityList.children.length > 10) {
        activityList.removeChild(activityList.lastChild);
    }
}

// Event listeners
function setupEventListeners() {
    // Add pet form
    const addPetForm = document.getElementById('addPetForm');
    if (addPetForm) {
        addPetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleAddPet(formData);
        });
    }
    
    // Modal close handlers
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open modals
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
        }
    });
}

// Loading overlay
function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Notification system
function showNotification(type, message) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Helper functions
function showAbout() {
    showNotification('info', 'PetTracker Pro - Professional IoT-based pet tracking system with real-time GPS monitoring.');
}

function showHelp() {
    showNotification('info', 'Use "Add Pet" to register a new pet with the tracking system. The dashboard will show real-time location and status updates.');
}

// Add notification styles if not already present
if (!document.querySelector('style[data-dashboard-notifications]')) {
    const style = document.createElement('style');
    style.setAttribute('data-dashboard-notifications', 'true');
    style.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        }
        
        .notification {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px var(--shadow);
            animation: slideInRight 0.3s ease;
            color: var(--text-primary);
        }
        
        .notification.success {
            border-left: 4px solid var(--success);
        }
        
        .notification.success i {
            color: var(--success);
        }
        
        .notification.error {
            border-left: 4px solid var(--danger);
        }
        
        .notification.error i {
            color: var(--danger);
        }
        
        .notification.warning {
            border-left: 4px solid var(--warning);
        }
        
        .notification.warning i {
            color: var(--warning);
        }
        
        .notification.info {
            border-left: 4px solid var(--info);
        }
        
        .notification.info i {
            color: var(--info);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 1.2rem;
            margin-left: auto;
        }
        
        .map-popup h3 {
            margin: 0 0 0.5rem 0;
            color: var(--text-primary);
        }
        
        .map-popup p {
            margin: 0.25rem 0;
            color: var(--text-secondary);
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
}
