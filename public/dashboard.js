// Dashboard JavaScript for Real-time Pet Tracking
const socket = io();

// Global variables
let map;
let petMarkers = {};
let pets = [];
let systemStats = {};
let activityLog = [];
let alerts = [];
let currentDashboardPendingPet = null;

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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeDashboard();
    setupPetRegistrationHandlers();
    hideLoadingOverlay();
});

function initializeDashboard() {
    console.log('🐕 Initializing PetTracker Pro Dashboard...');
    
    // Initialize map
    initializeMap();
    
    // Setup socket connections
    setupSocketEvents();
    
    // Start periodic updates
    startPeriodicUpdates();
    
    // Initialize UI elements
    updateSystemStats();
    
    console.log('✅ Dashboard initialized successfully');
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }, 2000);
    }
}

// Map Initialization
function initializeMap() {
    // Default location (New York City)
    const defaultLat = 40.7128;
    const defaultLng = -74.0060;
    
    map = L.map('map').setView([defaultLat, defaultLng], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add geofence circles (example safe zones)
    const safeZone1 = L.circle([defaultLat, defaultLng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        radius: 500
    }).addTo(map);
    
    const safeZone2 = L.circle([defaultLat + 0.01, defaultLng + 0.01], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        radius: 300
    }).addTo(map);
    
    safeZone1.bindPopup('Home Safe Zone - 500m radius');
    safeZone2.bindPopup('Park Safe Zone - 300m radius');
}

// Socket Event Handlers
function setupSocketEvents() {
    socket.on('connect', () => {
        console.log('📡 Connected to real-time tracking system');
        addActivity('info', 'Connected to IoT network', 'just now');
    });
    
    socket.on('pets_update', (petsData) => {
        pets = petsData;
        updatePetMarkers();
        updatePetsList();
        updateStatistics();
    });
    
    socket.on('stats_update', (statsData) => {
        systemStats = statsData;
        updateSystemStats();
    });
    
    socket.on('alert', (alertData) => {
        addAlert(alertData);
    });
    
    socket.on('disconnect', () => {
        console.log('📡 Disconnected from tracking system');
        addActivity('warning', 'Disconnected from IoT network', 'just now');
    });
}

// Update Pet Markers on Map
function updatePetMarkers() {
    pets.forEach(pet => {
        const { lat, lng } = pet.location;
        
        if (petMarkers[pet.id]) {
            // Update existing marker
            petMarkers[pet.id].setLatLng([lat, lng]);
        } else {
            // Create new marker
            const icon = L.divIcon({
                html: `
                    <div class="pet-marker">
                        <div class="pet-marker-avatar">${pet.avatar}</div>
                        <div class="pet-marker-pulse"></div>
                    </div>
                `,
                className: 'custom-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            const marker = L.marker([lat, lng], { icon }).addTo(map);
            
            marker.bindPopup(`
                <div class="pet-popup">
                    <h3>${pet.name}</h3>
                    <p><strong>ID:</strong> ${pet.id}</p>
                    <p><strong>Battery:</strong> ${pet.battery}%</p>
                    <p><strong>Status:</strong> ${pet.status}</p>
                    <p><strong>Last Update:</strong> ${new Date(pet.lastUpdate).toLocaleTimeString()}</p>
                </div>
            `);
            
            petMarkers[pet.id] = marker;
        }
    });
}

// Update Pets List
function updatePetsList() {
    const petsList = document.getElementById('dashboardPetsList');
    if (!petsList) return;
    
    petsList.innerHTML = '';
    
    if (pets.length === 0) {
        petsList.innerHTML = `
            <div class="dashboard-empty-state">
                <i class="fas fa-paw"></i>
                <h3>No Active Pets</h3>
                <p>No pets are currently connected to IoT devices. Register a new pet and connect a tracking device to get started.</p>
                <button class="btn-register" onclick="showAddPetModal()">
                    <i class="fas fa-plus"></i>
                    Add First Pet
                </button>
            </div>
        `;
        return;
    }
    
    pets.forEach(pet => {
        const petElement = createDashboardPetElement(pet);
        petsList.appendChild(petElement);
    });
}

function createDashboardPetElement(pet) {
    const petDiv = document.createElement('div');
    petDiv.className = 'dashboard-pet-item';
    
    const batteryColor = pet.battery > 50 ? '#10b981' : pet.battery > 20 ? '#f59e0b' : '#ef4444';
    const statusClass = pet.status.toLowerCase();
    
    petDiv.innerHTML = `
        <div class="pet-header">
            <div class="pet-title">
                <div class="pet-avatar-large">${pet.avatar}</div>
                <div class="pet-name-info">
                    <h3>${pet.name}</h3>
                    <div class="pet-id-info">${pet.id}</div>
                </div>
            </div>
            <div class="pet-status-badge ${statusClass}">${pet.status}</div>
        </div>
        <div class="pet-details">
            <div class="pet-detail">
                <div class="pet-detail-label">Battery</div>
                <div class="pet-detail-value" style="color: ${batteryColor}">${pet.battery}%</div>
            </div>
            <div class="pet-detail">
                <div class="pet-detail-label">Location</div>
                <div class="pet-detail-value">${pet.location.lat.toFixed(4)}, ${pet.location.lng.toFixed(4)}</div>
            </div>
            <div class="pet-detail">
                <div class="pet-detail-label">Last Update</div>
                <div class="pet-detail-value">${new Date(pet.lastUpdate).toLocaleTimeString()}</div>
            </div>
        </div>
    `;
    
    // Add click handler to center map on pet
    petDiv.addEventListener('click', () => {
        map.setView([pet.location.lat, pet.location.lng], 16);
        petMarkers[pet.id].openPopup();
    });
    
    return petDiv;
}

// Update Statistics
function updateStatistics() {
    // Use system stats instead of calculating locally
    const totalPets = systemStats.activePets || 0;
    const onlinePercentage = systemStats.onlinePercentage || 0;
    const avgBattery = systemStats.averageBattery || 0;
    
    animateCounter('totalPets', totalPets);
    animateCounter('onlineStatus', onlinePercentage, '%');
    animateCounter('avgBattery', avgBattery, '%');
    
    // Update last update time
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = '2.5s';
    }
}

function updateSystemStats() {
    if (!systemStats) return;
    
    const elements = {
        systemUptime: systemStats.uptime + '%',
        updateFreq: systemStats.updateFrequency + 's',
        gpsAccuracy: systemStats.gpsAccuracy,
        monitoring: systemStats.monitoring
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Utility Functions
function animateCounter(elementId, targetValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 1000;
    const steps = Math.abs(targetValue - currentValue);
    const stepDuration = duration / Math.max(steps, 1);
    
    let current = currentValue;
    
    const timer = setInterval(() => {
        if (current === targetValue) {
            clearInterval(timer);
            return;
        }
        
        current += increment;
        element.textContent = current + suffix;
    }, stepDuration);
}

function addActivity(type, message, time) {
    const activity = { type, message, time: time || new Date().toLocaleTimeString() };
    activityLog.unshift(activity);
    
    // Keep only last 10 activities
    if (activityLog.length > 10) {
        activityLog = activityLog.slice(0, 10);
    }
    
    updateActivityFeed();
}

function updateActivityFeed() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    activityLog.forEach(activity => {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item';
        
        activityDiv.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-text">${activity.message}</div>
            <div class="activity-time">${activity.time}</div>
        `;
        
        activityList.appendChild(activityDiv);
    });
}

function getActivityIcon(type) {
    const icons = {
        info: 'info',
        success: 'check',
        warning: 'exclamation-triangle',
        danger: 'times'
    };
    return icons[type] || 'info';
}

function addAlert(alertData) {
    alerts.unshift(alertData);
    updateAlertsList();
}

function updateAlertsList() {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    alertsList.innerHTML = '';
    
    if (alerts.length === 0) {
        alertsList.innerHTML = `
            <div class="alert-item success">
                <i class="fas fa-check-circle"></i>
                <div class="alert-content">
                    <div class="alert-message">All pets are in safe zones</div>
                    <div class="alert-time">Just now</div>
                </div>
            </div>
        `;
        return;
    }
    
    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item ${alert.type}`;
        
        alertDiv.innerHTML = `
            <i class="fas fa-${getAlertIcon(alert.type)}"></i>
            <div class="alert-content">
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${alert.time}</div>
            </div>
        `;
        
        alertsList.appendChild(alertDiv);
    });
}

function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        danger: 'exclamation-circle'
    };
    return icons[type] || 'bell';
}

// Control Functions
function refreshData() {
    console.log('🔄 Refreshing data...');
    addActivity('info', 'Data refresh requested', 'just now');
    
    // Simulate refresh
    const refreshBtn = event.target.closest('button');
    const originalText = refreshBtn.innerHTML;
    
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    setTimeout(() => {
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
        addActivity('success', 'Data refreshed successfully', 'just now');
    }, 2000);
}

function centerMap() {
    if (pets.length > 0) {
        const bounds = L.latLngBounds(pets.map(pet => [pet.location.lat, pet.location.lng]));
        map.fitBounds(bounds, { padding: [20, 20] });
    }
}

function toggleSatellite() {
    // Toggle between standard and satellite view
    const currentLayer = map._layers;
    console.log('🛰️ Toggling satellite view...');
}

function filterPets() {
    const filter = document.getElementById('statusFilter').value;
    const petItems = document.querySelectorAll('.dashboard-pet-item');
    
    petItems.forEach(item => {
        const status = item.querySelector('.pet-status-badge').textContent.toLowerCase();
        
        if (filter === 'all' || status === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function clearAlerts() {
    alerts = [];
    updateAlertsList();
    addActivity('info', 'Alerts cleared by user', 'just now');
}

function showHelp() {
    alert('PetTracker Pro Dashboard Help:\n\n• Click on pets in the list to center map\n• Use filter to show specific pet statuses\n• Map shows real-time GPS positions\n• Green circles are safe zones\n• System updates every 2.5 seconds');
}

function showSettings() {
    alert('Settings panel coming soon!\n\nFeatures will include:\n• Notification preferences\n• Geofence configuration\n• Update frequency settings\n• Export options');
}

function exportData() {
    const data = {
        pets: pets,
        systemStats: systemStats,
        activityLog: activityLog,
        exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pettracker-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    addActivity('success', 'Data exported successfully', 'just now');
}

// Periodic Updates
function startPeriodicUpdates() {
    setInterval(() => {
        // Add random activity for demo
        if (Math.random() < 0.1) {
            const activities = [
                'GPS signal strength optimal',
                'Geofence boundary check completed',
                'Battery levels monitored',
                'IoT device status verified'
            ];
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            addActivity('info', randomActivity, new Date().toLocaleTimeString());
        }
    }, 10000); // Every 10 seconds
}

// Pet Registration Functions for Dashboard
function setupPetRegistrationHandlers() {
    const dashboardPetForm = document.getElementById('dashboardPetForm');
    if (dashboardPetForm) {
        dashboardPetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await handleDashboardPetRegistration(formData);
        });
    }
    
    // Modal close handlers
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function showAddPetModal() {
    document.getElementById('addPetModal').style.display = 'flex';
}

function closeAddPetModal() {
    document.getElementById('addPetModal').style.display = 'none';
    document.getElementById('dashboardPetForm').reset();
}

function closeDashboardDeviceModal() {
    document.getElementById('dashboardDeviceModal').style.display = 'none';
    currentDashboardPendingPet = null;
}

async function handleDashboardPetRegistration(formData) {
    const petData = {
        name: formData.get('name'),
        species: formData.get('species'),
        breed: formData.get('breed'),
        age: formData.get('age'),
        avatar: formData.get('avatar')
    };
    
    try {
        const response = await fetch('/api/register-pet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(petData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentDashboardPendingPet = result.pet;
            closeAddPetModal();
            showDashboardDeviceConnection(result.pet);
            showDashboardNotification(`${result.pet.name} registered successfully!`, 'success');
            addActivity('success', `Pet "${result.pet.name}" registered`, 'just now');
        } else {
            showDashboardNotification('Registration failed: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showDashboardNotification('Registration failed. Please try again.', 'error');
    }
}

async function showDashboardDeviceConnection(pet) {
    document.getElementById('dashboardPendingPetName').textContent = pet.name;
    
    try {
        const response = await fetch('/api/available-devices');
        const devices = await response.json();
        
        const deviceList = document.getElementById('dashboardAvailableDevices');
        deviceList.innerHTML = '';
        
        if (devices.length === 0) {
            deviceList.innerHTML = `
                <div class="no-devices">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No IoT devices available for connection.</p>
                    <p>Your pet is registered and will appear in the dashboard once a device becomes available.</p>
                </div>
            `;
        } else {
            devices.forEach(device => {
                const deviceElement = document.createElement('div');
                deviceElement.className = 'device-item';
                deviceElement.innerHTML = `
                    <div class="device-info">
                        <div class="device-id">${device.id}</div>
                        <div class="device-type">${device.type}</div>
                    </div>
                    <button class="btn-connect" onclick="connectDashboardDevice('${pet.id}', '${device.id}')">
                        <i class="fas fa-link"></i>
                        Connect
                    </button>
                `;
                deviceList.appendChild(deviceElement);
            });
        }
        
        document.getElementById('dashboardDeviceModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading devices:', error);
        showDashboardNotification('Failed to load available devices.', 'error');
    }
}

async function connectDashboardDevice(petId, deviceId) {
    try {
        const response = await fetch('/api/connect-device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ petId, deviceId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeDashboardDeviceModal();
            showDashboardNotification(`Device ${deviceId} connected successfully!`, 'success');
            addActivity('success', `Device ${deviceId} connected to ${result.pet.name}`, 'just now');
            // The socket will handle updating the UI with the new active pet
        } else {
            showDashboardNotification('Device connection failed: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Device connection error:', error);
        showDashboardNotification('Device connection failed. Please try again.', 'error');
    }
}

function showDashboardNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'info' ? '#3b82f6' : type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add CSS for custom map markers
const markerStyles = `
<style>
.pet-marker {
    position: relative;
    width: 40px;
    height: 40px;
}

.pet-marker-avatar {
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 3px solid #10b981;
    position: relative;
    z-index: 2;
}

.pet-marker-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    background: rgba(16, 185, 129, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse-marker 2s infinite;
    z-index: 1;
}

@keyframes pulse-marker {
    0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0;
    }
}

.pet-popup {
    font-family: 'Inter', sans-serif;
    min-width: 200px;
}

.pet-popup h3 {
    margin: 0 0 10px 0;
    color: #1f2937;
    font-weight: 700;
}

.pet-popup p {
    margin: 5px 0;
    color: #6b7280;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', markerStyles);

console.log('🚀 PetTracker Pro Dashboard loaded successfully!');
