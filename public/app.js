// Initialize Socket.IO connection
const socket = io();

// DOM Elements
const activePetsElement = document.getElementById('activePets');
const onlinePercentElement = document.getElementById('onlinePercent');
const petListElement = document.getElementById('petList');

// Application state
let pets = [];
let systemStats = {};
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

// Global functions for button interactions
function launchDemo() {
    // Add loading state
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Launching...';
    button.disabled = true;
    
    // Simulate loading then open dashboard
    setTimeout(() => {
        window.open('/dashboard', '_blank');
        
        // Reset button
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 1000);
    }, 1500);
}

function watchDemo() {
    // Show demo guide modal
    showDemoGuide();
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

function closeDemoGuide(element) {
    const modal = element.closest('.modal');
    if (modal) {
        modal.remove();
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Pet Registration Functions
function showRegistration() {
    document.getElementById('registrationModal').style.display = 'flex';
}

function closeRegistration() {
    document.getElementById('registrationModal').style.display = 'none';
    document.getElementById('petRegistrationForm').reset();
}

function closeDeviceModal() {
    document.getElementById('deviceModal').style.display = 'none';
    currentPendingPet = null;
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

// Update the launchDemo function to go directly to dashboard
function launchDemo() {
    window.open('/dashboard', '_blank');
}

// Utility functions
function showNotification(message, type = 'info') {
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

// Add some interactive effects
document.addEventListener('mousemove', (e) => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / centerY * 2;
    const rotateY = (centerX - x) / centerX * 2;
    
    const dashboardCard = document.querySelector('.dashboard-card');
    if (dashboardCard) {
        dashboardCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
});

// Reset card position when mouse leaves hero
document.querySelector('.hero')?.addEventListener('mouseleave', () => {
    const dashboardCard = document.querySelector('.dashboard-card');
    if (dashboardCard) {
        dashboardCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
});

// Performance monitoring
let lastUpdate = Date.now();
function trackPerformance() {
    const now = Date.now();
    const delta = now - lastUpdate;
    lastUpdate = now;
    
    if (delta > 100) { // Log if update takes more than 100ms
        console.log(`Performance: Update took ${delta}ms`);
    }
}

// Initialize performance tracking
setInterval(trackPerformance, 1000);

console.log('🚀 PetTracker Pro frontend loaded successfully!');
