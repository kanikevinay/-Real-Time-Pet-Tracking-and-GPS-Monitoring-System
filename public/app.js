// PetTracker Pro - Homepage JavaScript
console.log('🚀 Loading PetTracker Pro...');

// Debug: Check if we're in the right environment
console.log('📍 Current location:', window.location.href);
console.log('🌐 User agent:', navigator.userAgent);

// Initialize Socket.IO connection (with fallback)
let socket;
try {
    if (typeof io !== 'undefined') {
        socket = io();
        console.log('✅ Socket.IO connected');
    } else {
        throw new Error('Socket.IO not available');
    }
} catch (error) {
    console.log('⚠️ Socket.IO not available, using fallback mode');
    socket = {
        on: () => {},
        emit: () => {},
        connected: false
    };
}

// DOM Elements
let activePetsElement, onlinePercentElement, petListElement;

// Application state
let pets = [];
let systemStats = {};
let registeredPets = [];
let currentPendingPet = null;

// Theme management functions (defined first)
function initializeTheme() {
    const savedTheme = localStorage.getItem('pettracker-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    console.log('🎨 Theme initialized:', savedTheme);
}

function toggleTheme() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log(`🎨 Toggling theme from ${currentTheme} to ${newTheme}`);
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('pettracker-theme', newTheme);
        updateThemeIcon(newTheme);
        showNotification(`Switched to ${newTheme} mode`, 'success');
        
        console.log('✅ Theme toggled successfully to:', newTheme);
    } catch (error) {
        console.error('❌ Error toggling theme:', error);
        showNotification('Error switching theme', 'error');
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Navigation and demo functions
function launchDemo() {
    console.log('🚀 Launching demo...');
    showNotification('Opening dashboard...', 'info');
    
    try {
        // Check if we're in the same domain
        const currentDomain = window.location.hostname;
        const dashboardUrl = window.location.origin + '/dashboard';
        
        console.log('🌐 Opening dashboard at:', dashboardUrl);
        
        // Try to navigate in same window first
        if (currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1')) {
            window.location.href = dashboardUrl;
        } else {
            // For deployed version, open in same window
            window.open(dashboardUrl, '_self');
        }
        
        setTimeout(() => {
            showNotification('Dashboard opened successfully!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('❌ Error launching dashboard:', error);
        showNotification('Error opening dashboard. Please try again.', 'error');
        
        // Fallback: try opening in new window
        try {
            window.open('/dashboard', '_blank');
        } catch (fallbackError) {
            console.error('❌ Fallback failed:', fallbackError);
        }
    }
}

function watchDemo() {
    console.log('📖 Opening demo guide...');
    showDemoGuide();
}

function showDemoGuide() {
    console.log('📋 Showing demo guide modal...');
    
    // Remove existing modal if any
    const existingModal = document.querySelector('.demo-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal demo-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>🐕 PetTracker Pro Demo Guide</h2>
                <button class="modal-close" onclick="closeDemoGuide()">&times;</button>
            </div>
            <div style="padding: 2rem;">
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">How to Use PetTracker Pro</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="width: 40px; height: 40px; background: var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">1</div>
                            <div>
                                <strong>Register Your Pet</strong><br>
                                <span style="color: var(--text-secondary);">Click "Register Pet" and fill in your pet's information</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="width: 40px; height: 40px; background: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">2</div>
                            <div>
                                <strong>Connect IoT Device</strong><br>
                                <span style="color: var(--text-secondary);">Choose from available GPS collars or tags to pair with your pet</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="width: 40px; height: 40px; background: var(--info); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">3</div>
                            <div>
                                <strong>Monitor Live</strong><br>
                                <span style="color: var(--text-secondary);">View real-time GPS tracking, battery status, and safety alerts</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 2rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">🚀 Live Features</h4>
                    <p style="color: var(--text-secondary); margin: 0;">Real-time GPS • Battery monitoring • Geofencing • Instant alerts • 24/7 tracking</p>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeDemoGuide()">Close Guide</button>
                    <button type="button" class="btn-primary" onclick="closeDemoGuide(); launchDemo();">Try Dashboard</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    showNotification('Demo guide opened!', 'success');
}

function closeDemoGuide() {
    console.log('❌ Closing demo guide...');
    const modal = document.querySelector('.demo-modal');
    if (modal) {
        modal.remove();
    }
}

// Pet registration functions
function showRegistration() {
    console.log('📝 Opening pet registration...');
    
    try {
        const modal = document.getElementById('registrationModal');
        if (modal) {
            modal.style.display = 'flex';
            showNotification('Registration form opened', 'info');
            console.log('✅ Registration modal opened successfully');
        } else {
            console.error('❌ Registration modal not found in DOM');
            
            // Try to create the modal if it doesn't exist
            createRegistrationModal();
            setTimeout(() => {
                const newModal = document.getElementById('registrationModal');
                if (newModal) {
                    newModal.style.display = 'flex';
                    showNotification('Registration form created and opened', 'success');
                }
            }, 100);
        }
    } catch (error) {
        console.error('❌ Error opening registration modal:', error);
        showNotification('Error opening registration form', 'error');
    }
}

function closeRegistration() {
    console.log('❌ Closing registration...');
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('petRegistrationForm');
        if (form) form.reset();
    }
}

function closeDeviceModal() {
    console.log('❌ Closing device modal...');
    const modal = document.getElementById('deviceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function submitRegistration() {
    console.log('📝 Submitting pet registration...');
    
    try {
        const form = document.getElementById('petRegistrationForm');
        if (!form) {
            console.error('❌ Registration form not found');
            showNotification('Registration form not found', 'error');
            return;
        }
        
        const formData = new FormData(form);
        
        const petData = {
            name: formData.get('name')?.trim(),
            species: formData.get('species'),
            breed: formData.get('breed')?.trim() || '',
            age: formData.get('age')?.trim() || '',
            avatar: formData.get('avatar') || getDefaultAvatar(formData.get('species'))
        };
        
        console.log('📋 Pet data collected:', petData);
        
        // Validate required fields
        if (!petData.name || !petData.species) {
            showNotification('Please fill in required fields (Name and Species)', 'error');
            return;
        }
        
        if (petData.name.length < 2) {
            showNotification('Pet name must be at least 2 characters long', 'error');
            return;
        }
        
        // Store pet data globally for device pairing
        currentPendingPet = petData;
        
        // Send to server if socket is available
        if (socket && socket.connected) {
            socket.emit('register_pet', petData);
        } else {
            console.log('📡 Socket not available, storing pet data locally');
            
            // Store in localStorage as fallback
            const existingPets = JSON.parse(localStorage.getItem('pettracker-pets') || '[]');
            existingPets.push({
                ...petData,
                id: Date.now().toString(),
                registeredAt: new Date().toISOString()
            });
            localStorage.setItem('pettracker-pets', JSON.stringify(existingPets));
        }
        
        // Show success message
        showNotification(`${petData.name} registered successfully! Please pair with a device.`, 'success');
        
        // Close registration modal and show device pairing
        closeRegistration();
        
        setTimeout(() => {
            const deviceModal = document.getElementById('deviceModal');
            if (deviceModal) {
                // Update pending pet name in device modal
                const pendingPetName = document.getElementById('pendingPetName');
                if (pendingPetName) {
                    pendingPetName.textContent = petData.name;
                }
                deviceModal.style.display = 'flex';
                populateAvailableDevices();
            } else {
                console.log('🔧 Creating device modal...');
                createRegistrationModal();
                setTimeout(() => {
                    const newDeviceModal = document.getElementById('deviceModal');
                    if (newDeviceModal) {
                        const pendingPetName = document.getElementById('pendingPetName');
                        if (pendingPetName) {
                            pendingPetName.textContent = petData.name;
                        }
                        newDeviceModal.style.display = 'flex';
                        populateAvailableDevices();
                    }
                }, 200);
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Error submitting registration:', error);
        showNotification('Error registering pet. Please try again.', 'error');
    }
}

function getDefaultAvatar(species) {
    const avatars = {
        'dog': '🐕',
        'cat': '🐱',
        'bird': '🐦',
        'rabbit': '🐰',
        'other': '🐾'
    };
    return avatars[species] || '🐾';
}

function pairDevice(deviceId) {
    console.log('🔗 Pairing device:', deviceId);
    
    // Send pairing request to server
    socket.emit('pair_device', { deviceId });
    
    // Show success message
    showNotification(`Device ${deviceId} paired successfully! Your pet is now being tracked.`, 'success');
    
    // Close device modal
    closeDeviceModal();
    
    // Refresh data
    setTimeout(() => {
        location.reload();
    }, 2000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeApp();
    setupEventListeners();
    startAnimations();
});

function initializeApp() {
    console.log('🐕 PetTracker Pro initialized');
    
    // Connect to real-time updates
    socket.on('connect', () => {
        console.log('📡 Connected to real-time system');
    });
    
    socket.on('pets_update', (petsData) => {
        pets = petsData;
        updatePetDisplay();
    });
    
    socket.on('stats_update', (statsData) => {
        systemStats = statsData;
        updateStatsDisplay();
    });
    
    socket.on('registered_pets_update', (data) => {
        registeredPets = data;
    });
    
    socket.on('disconnect', () => {
        console.log('📡 Disconnected from real-time system');
    });
    
    // Start live demo effect for homepage
    startLiveDemoEffect();
}

function updatePetDisplay() {
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
        return;
    }
    
    petListElement.innerHTML = '';
    
    pets.forEach(pet => {
        const petElement = createPetElement(pet);
        petListElement.appendChild(petElement);
    });
    
    // Update homepage stats when pets change
    updateHomepageStats();
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

function updateStatsDisplay() {
    if (activePetsElement) {
        animateNumber(activePetsElement, systemStats.activePets || 0);
    }
    
    if (onlinePercentElement) {
        animateNumber(onlinePercentElement, systemStats.onlinePercentage || 0, '%');
    }
}

// Display stable values for homepage dashboard
function startLiveDemoEffect() {
    // Show stable, accurate values instead of cycling demo
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
    
    // Update pet list with actual or empty state
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

function animateNumber(element, targetValue, suffix = '') {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 500; // ms
    const steps = Math.abs(targetValue - currentValue);
    const stepDuration = duration / Math.max(steps, 1);
    
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current + suffix;
        
        if (current === targetValue) {
            clearInterval(timer);
        }
    }, stepDuration);
}

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
    
    // Mobile menu toggle (if implemented)
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Add intersection observer for animations
    setupIntersectionObserver();
    
    // Modal close handlers
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    if (window.scrollY > 100) {
        if (currentTheme === 'dark') {
            navbar.style.background = 'rgba(31, 41, 55, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        }
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        if (currentTheme === 'dark') {
            navbar.style.background = 'rgba(31, 41, 55, 0.95)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
        navbar.style.boxShadow = 'none';
    }
}

function setupIntersectionObserver() {
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
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

function startAnimations() {
    // Add loading animation to hero elements
    const heroElements = document.querySelectorAll('.hero-content > *');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Dashboard card animation
    const dashboardCard = document.querySelector('.dashboard-card');
    if (dashboardCard) {
        dashboardCard.style.opacity = '0';
        dashboardCard.style.transform = 'translateY(50px) scale(0.95)';
        
        setTimeout(() => {
            dashboardCard.style.transition = 'all 0.8s ease';
            dashboardCard.style.opacity = '1';
            dashboardCard.style.transform = 'translateY(0) scale(1)';
        }, 800);
    }
}

function showDemoGuide() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>🐕 PetTracker Pro Demo Guide</h2>
                <button class="modal-close" onclick="closeDemoGuide(this)">&times;</button>
            </div>
            <div style="padding: 2rem;">
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">How to Use PetTracker Pro</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="width: 40px; height: 40px; background: var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">1</div>
                            <div>
                                <strong>Register Your Pet</strong><br>
                                <span style="color: var(--text-secondary);">Click "Register Pet" and fill in your pet's information</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="width: 40px; height: 40px; background: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">2</div>
                            <div>
                                <strong>Connect IoT Device</strong><br>
                                <span style="color: var(--text-secondary);">Choose from available GPS collars or tags to pair with your pet</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="width: 40px; height: 40px; background: var(--info); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">3</div>
                            <div>
                                <strong>Monitor Live</strong><br>
                                <span style="color: var(--text-secondary);">View real-time GPS tracking, battery status, and safety alerts</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 2rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">🚀 Live Features</h4>
                    <p style="color: var(--text-secondary); margin: 0;">Real-time GPS • Battery monitoring • Geofencing • Instant alerts • 24/7 tracking</p>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeDemoGuide(this)">Close Guide</button>
                    <button type="button" class="btn-primary" onclick="closeDemoGuide(this); launchDemo();">Try Dashboard</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Handle pet registration form submission
async function handlePetRegistration(formData) {
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
            currentPendingPet = result.pet;
            closeRegistration();
            showDeviceConnection(result.pet);
            showNotification(`${result.pet.name} registered successfully!`, 'success');
        } else {
            showNotification('Registration failed: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

async function showDeviceConnection(pet) {
    document.getElementById('pendingPetName').textContent = pet.name;
    
    try {
        const response = await fetch('/api/available-devices');
        const devices = await response.json();
        
        const deviceList = document.getElementById('availableDevices');
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
                    <button class="btn-connect" onclick="connectDevice('${pet.id}', '${device.id}')">
                        <i class="fas fa-link"></i>
                        Connect
                    </button>
                `;
                deviceList.appendChild(deviceElement);
            });
        }
        
        document.getElementById('deviceModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading devices:', error);
        showNotification('Failed to load available devices.', 'error');
    }
}

async function connectDevice(petId, deviceId) {
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
            closeDeviceModal();
            showNotification(`Device ${deviceId} connected successfully!`, 'success');
            // The socket will handle updating the UI with the new active pet
        } else {
            showNotification('Device connection failed: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Device connection error:', error);
        showNotification('Device connection failed. Please try again.', 'error');
    }
}

// Function to create registration modal if missing
function createRegistrationModal() {
    console.log('🔧 Creating registration modal...');
    
    const modalHTML = `
        <!-- Pet Registration Modal -->
        <div id="registrationModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Register New Pet</h2>
                    <button class="modal-close" onclick="closeRegistration()">&times;</button>
                </div>
                <form id="petRegistrationForm" class="registration-form" onsubmit="event.preventDefault(); submitRegistration();">
                    <div class="form-group">
                        <label for="petName">Pet Name *</label>
                        <input type="text" id="petName" name="name" required placeholder="Enter your pet's name">
                    </div>
                    
                    <div class="form-group">
                        <label for="petSpecies">Species *</label>
                        <select id="petSpecies" name="species" required>
                            <option value="">Select species</option>
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
                            <option value="bird">Bird</option>
                            <option value="rabbit">Rabbit</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="petBreed">Breed</label>
                        <input type="text" id="petBreed" name="breed" placeholder="Enter breed (optional)">
                    </div>
                    
                    <div class="form-group">
                        <label for="petAge">Age</label>
                        <input type="text" id="petAge" name="age" placeholder="Enter age (optional)">
                    </div>
                    
                    <div class="form-group">
                        <label for="petAvatar">Avatar</label>
                        <select id="petAvatar" name="avatar">
                            <option value="">Auto-select</option>
                            <option value="🐕">🐕 Dog</option>
                            <option value="🐱">🐱 Cat</option>
                            <option value="🐦">🐦 Bird</option>
                            <option value="🐰">🐰 Rabbit</option>
                            <option value="🐾">🐾 Other</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeRegistration()">Cancel</button>
                        <button type="submit" class="btn-primary">Register Pet</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Device Connection Modal -->
        <div id="deviceModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Connect IoT Device</h2>
                    <button class="modal-close" onclick="closeDeviceModal()">&times;</button>
                </div>
                <div class="device-connection">
                    <p>Your pet <strong id="pendingPetName"></strong> has been registered successfully!</p>
                    <p>Now select an available IoT device to connect:</p>
                    
                    <div id="availableDevices" class="device-list">
                        <!-- Devices will be populated here -->
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeDeviceModal()">Skip for Now</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    populateAvailableDevices();
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
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
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(300px);
        transition: transform 0.3s ease;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle" style="margin-right: 0.5rem;"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 PetTracker Pro initialized and ready!');
    
    // Populate available devices for demo
    populateAvailableDevices();
    
    // Initialize system stats
    updateSystemStats();
});

// Make functions globally available
window.showNotification = showNotification;
window.toggleTheme = toggleTheme;
window.launchDemo = launchDemo;
window.watchDemo = watchDemo;
window.showRegistration = showRegistration;
window.closeRegistration = closeRegistration;
window.closeDeviceModal = closeDeviceModal;
window.submitRegistration = submitRegistration;
window.pairDevice = pairDevice;
window.closeDemoGuide = closeDemoGuide;

// Debug: Verify functions are accessible
console.log('🔧 Function verification:');
console.log('  toggleTheme:', typeof window.toggleTheme);
console.log('  launchDemo:', typeof window.launchDemo);
console.log('  showRegistration:', typeof window.showRegistration);
console.log('  watchDemo:', typeof window.watchDemo);

console.log('🚀 All functions loaded and globally accessible');
