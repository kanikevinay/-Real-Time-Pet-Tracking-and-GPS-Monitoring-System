// Standalone version for Live Server (without Socket.IO)
// This provides basic functionality when using VS Code Live Server

// DOM Elements
const activePetsElement = document.getElementById('activePets');
const onlinePercentElement = document.getElementById('onlinePercent');
const petListElement = document.getElementById('petList');

// Application state
let pets = [];
let registeredPets = [];
let currentPendingPet = null;

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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    console.log('🐕 PetTracker Pro initialized (Live Server Mode)');
    
    // Check if Socket.IO is available
    if (typeof io !== 'undefined') {
        console.log('📡 Socket.IO detected - Using real-time mode');
        initializeSocketIO();
    } else {
        console.log('📡 Socket.IO not available - Using standalone mode');
        initializeStandaloneMode();
    }
}

// Dashboard navigation
function openDashboard() {
    // Check if we're in Live Server mode or Node.js server mode
    const isLiveServer = window.location.port === '5500' || window.location.port === '5501';
    
    if (isLiveServer) {
        // Open standalone dashboard for Live Server
        window.open('dashboard-standalone.html', '_blank');
    } else {
        // Open regular dashboard for Node.js server
        window.open('/dashboard', '_blank');
    }
}

function initializeSocketIO() {
    // Original Socket.IO functionality
    const socket = io();
    
    socket.on('connect', () => {
        console.log('📡 Connected to real-time system');
    });
    
    socket.on('pets_update', (petsData) => {
        pets = petsData;
        updatePetDisplay();
        updateHomepageStats();
    });
    
    socket.on('stats_update', (statsData) => {
        updateStatsFromServer(statsData);
    });
    
    socket.on('registered_pets_update', (data) => {
        registeredPets = data;
    });
}

function initializeStandaloneMode() {
    // Standalone mode without Socket.IO
    updateStablePetList();
    updateHomepageStats();
    
    // Show info message about standalone mode
    setTimeout(() => {
        showNotification('info', 'Running in standalone mode. Start the Node.js server for full functionality.');
    }, 2000);
}

function updateHomepageStats() {
    const stableStats = {
        pets: pets.length,
        online: pets.length > 0 ? Math.round((pets.filter(p => p.status !== 'offline').length / pets.length) * 100) : 0
    };
    
    if (activePetsElement) {
        activePetsElement.textContent = stableStats.pets;
    }
    if (onlinePercentElement) {
        onlinePercentElement.textContent = stableStats.online + '%';
    }
}

function updateStatsFromServer(statsData) {
    if (activePetsElement) {
        activePetsElement.textContent = statsData.activePets || 0;
    }
    if (onlinePercentElement) {
        onlinePercentElement.textContent = (statsData.onlinePercentage || 0) + '%';
    }
}

function updatePetDisplay() {
    updateStablePetList();
}

function updateStablePetList() {
    if (!petListElement) return;
    
    if (pets.length === 0) {
        petListElement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paw"></i>
                <p>No active pets. Register your first pet to get started!</p>
                <button class="btn-register" onclick="showRegistration()">
                    <i class="fas fa-plus"></i>
                    Register Pet
                </button>
            </div>
        `;
    } else {
        petListElement.innerHTML = '';
        pets.forEach(pet => {
            const petElement = createPetElement(pet);
            petListElement.appendChild(petElement);
        });
    }
}

function createPetElement(pet) {
    const petDiv = document.createElement('div');
    petDiv.className = 'pet-item';
    petDiv.style.animation = 'fadeInUp 0.5s ease forwards';
    
    const statusClass = pet.status.toLowerCase();
    const batteryColor = pet.battery > 50 ? '#10b981' : pet.battery > 20 ? '#f59e0b' : '#ef4444';
    
    petDiv.innerHTML = `
        <div class="pet-avatar">${pet.avatar}</div>
        <div class="pet-info">
            <div class="pet-name">${pet.name}</div>
            <div class="pet-id">${pet.id} • Battery <span style="color: ${batteryColor}">${pet.battery}%</span></div>
        </div>
        <div class="pet-status ${statusClass}">${pet.status}</div>
    `;
    
    return petDiv;
}

// Pet Registration Functions
function showRegistration() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function hideRegistration() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('petRegistrationForm');
        if (form) form.reset();
    }
}

function showPairing(petData) {
    currentPendingPet = petData;
    const modal = document.getElementById('devicePairingModal');
    const devicesList = document.getElementById('availableDevices');
    
    if (!modal || !devicesList) return;
    
    // Sample devices for standalone mode
    const sampleDevices = [
        { id: 'GPS-001', type: 'GPS Collar', isConnected: false },
        { id: 'GPS-002', type: 'GPS Collar', isConnected: false },
        { id: 'GPS-003', type: 'GPS Tag', isConnected: false }
    ];
    
    devicesList.innerHTML = '';
    sampleDevices.forEach(device => {
        if (!device.isConnected) {
            const deviceElement = document.createElement('div');
            deviceElement.className = 'device-item';
            deviceElement.innerHTML = `
                <div class="device-info">
                    <i class="fas fa-microchip"></i>
                    <div>
                        <strong>${device.id}</strong>
                        <span>${device.type}</span>
                    </div>
                </div>
                <button class="btn-primary" onclick="pairDevice('${device.id}')">
                    Pair Device
                </button>
            `;
            devicesList.appendChild(deviceElement);
        }
    });
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hidePairing() {
    const modal = document.getElementById('devicePairingModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentPendingPet = null;
    }
}

function pairDevice(deviceId) {
    if (!currentPendingPet) return;
    
    // In standalone mode, just show success message
    showNotification('success', `Pet "${currentPendingPet.name}" successfully paired with device ${deviceId}!`);
    hidePairing();
    hideRegistration();
    
    // Add demo pet to the list
    const demoPet = {
        ...currentPendingPet,
        id: deviceId,
        battery: 85,
        status: 'safe',
        avatar: currentPendingPet.type === 'dog' ? '🐕' : currentPendingPet.type === 'cat' ? '🐱' : '🐾',
        isOnline: true
    };
    
    pets.push(demoPet);
    updatePetDisplay();
    updateHomepageStats();
}

// Demo Guide Functions
function showDemoGuide() {
    const modal = document.getElementById('demoGuideModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function hideDemoGuide() {
    const modal = document.getElementById('demoGuideModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Event Listeners
function setupEventListeners() {
    // Pet registration form handler
    const registrationForm = document.getElementById('petRegistrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await handlePetRegistration(formData);
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Modal close handlers
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

async function handlePetRegistration(formData) {
    const petData = {
        name: formData.get('petName'),
        type: formData.get('petType'),
        age: parseInt(formData.get('petAge')),
        owner: {
            name: formData.get('ownerName'),
            phone: formData.get('ownerPhone')
        }
    };
    
    // Validation
    if (!petData.name || !petData.type || !petData.age || !petData.owner.name || !petData.owner.phone) {
        showNotification('error', 'Please fill in all required fields.');
        return;
    }
    
    try {
        // Check if Socket.IO is available for real registration
        if (typeof io !== 'undefined') {
            const response = await fetch('/api/register-pet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(petData)
            });
            
            if (response.ok) {
                const result = await response.json();
                showNotification('success', `Pet "${petData.name}" registered successfully!`);
                showPairing(petData);
            } else {
                throw new Error('Registration failed');
            }
        } else {
            // Standalone mode - simulate registration
            showNotification('success', `Pet "${petData.name}" registered successfully!`);
            showPairing(petData);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('error', 'Registration failed. Please try again.');
    }
}

// Notification System
function showNotification(type, message) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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

// Animations
function startAnimations() {
    // Add entrance animations to elements as they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe feature cards and stat items
    document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// CSS Animations (add to head if not in CSS file)
if (!document.querySelector('style[data-pettracker-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-pettracker-animations', 'true');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
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
        }
        
        .notification.success {
            border-left: 4px solid var(--success);
            color: var(--success);
        }
        
        .notification.error {
            border-left: 4px solid var(--danger);
            color: var(--danger);
        }
        
        .notification.info {
            border-left: 4px solid var(--info);
            color: var(--info);
        }
        
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
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
