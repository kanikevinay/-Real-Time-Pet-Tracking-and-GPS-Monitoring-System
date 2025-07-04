const fs = require('fs');
const path = require('path');

// Mock GPS data generator for demonstration
class GPSSimulator {
    constructor() {
        this.baseLocations = [
            { name: 'Central Park', lat: 40.7829, lng: -73.9654 },
            { name: 'Times Square', lat: 40.7580, lng: -73.9855 },
            { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 },
            { name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445 }
        ];
        
        this.pets = [
            { id: 'GPS-001', name: 'Buddy', avatar: '🐕', type: 'dog' },
            { id: 'GPS-002', name: 'Whiskers', avatar: '🐱', type: 'cat' },
            { id: 'GPS-003', name: 'Max', avatar: '🐕', type: 'dog' },
            { id: 'GPS-004', name: 'Luna', avatar: '🐱', type: 'cat' },
            { id: 'GPS-005', name: 'Charlie', avatar: '🐕', type: 'dog' }
        ];
    }
    
    generateRandomLocation(baseLocation) {
        // Generate location within 1km radius
        const radius = 0.01; // ~1km in degrees
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radius;
        
        return {
            lat: baseLocation.lat + distance * Math.cos(angle),
            lng: baseLocation.lng + distance * Math.sin(angle)
        };
    }
    
    generatePetData() {
        return this.pets.map((pet, index) => {
            const baseLocation = this.baseLocations[index % this.baseLocations.length];
            const location = this.generateRandomLocation(baseLocation);
            
            return {
                ...pet,
                battery: Math.floor(Math.random() * 40) + 60, // 60-100%
                status: Math.random() > 0.1 ? 'Safe' : 'Warning',
                location,
                lastUpdate: new Date(),
                isOnline: Math.random() > 0.05, // 95% online
                zone: baseLocation.name
            };
        });
    }
    
    simulateMovement(currentPets) {
        return currentPets.map(pet => {
            // Small random movement (within 100 meters)
            const movement = 0.001; // ~100m in degrees
            const deltaLat = (Math.random() - 0.5) * movement;
            const deltaLng = (Math.random() - 0.5) * movement;
            
            return {
                ...pet,
                location: {
                    lat: pet.location.lat + deltaLat,
                    lng: pet.location.lng + deltaLng
                },
                lastUpdate: new Date(),
                // Occasional battery drain
                battery: Math.random() < 0.1 ? 
                    Math.max(20, pet.battery - 1) : pet.battery
            };
        });
    }
    
    generateAlerts(pets) {
        const alerts = [];
        
        pets.forEach(pet => {
            if (pet.battery < 30) {
                alerts.push({
                    type: 'warning',
                    petId: pet.id,
                    petName: pet.name,
                    message: `${pet.name} has low battery (${pet.battery}%)`,
                    time: new Date().toLocaleTimeString()
                });
            }
            
            if (pet.status === 'Warning') {
                alerts.push({
                    type: 'warning',
                    petId: pet.id,
                    petName: pet.name,
                    message: `${pet.name} is outside safe zone`,
                    time: new Date().toLocaleTimeString()
                });
            }
            
            if (!pet.isOnline) {
                alerts.push({
                    type: 'danger',
                    petId: pet.id,
                    petName: pet.name,
                    message: `${pet.name} is offline - GPS connection lost`,
                    time: new Date().toLocaleTimeString()
                });
            }
        });
        
        return alerts;
    }
    
    exportSampleData() {
        const sampleData = {
            pets: this.generatePetData(),
            zones: this.baseLocations,
            systemInfo: {
                version: '1.0.0',
                uptime: '99.9%',
                totalPets: this.pets.length,
                activeConnections: Math.floor(Math.random() * 100) + 50,
                lastUpdate: new Date().toISOString()
            }
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'sample-data.json'), 
            JSON.stringify(sampleData, null, 2)
        );
        
        console.log('Sample data exported to sample-data.json');
        return sampleData;
    }
}

module.exports = GPSSimulator;
