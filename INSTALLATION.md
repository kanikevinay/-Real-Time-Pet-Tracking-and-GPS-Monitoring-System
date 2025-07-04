# Installation Guide

## Prerequisites

Before running PetTracker Pro, ensure you have the following installed:

### 1. Node.js Installation
Download and install Node.js from [nodejs.org](https://nodejs.org/):
- **Recommended Version**: Node.js 18 LTS or higher
- **Includes**: npm (Node Package Manager)

To verify installation:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
```

### 2. Git (Optional)
For version control and updates:
- Download from [git-scm.com](https://git-scm.com/)

## Quick Setup

1. **Open Terminal/Command Prompt** in the project directory
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start the Application**:
   ```bash
   npm start
   ```
4. **Access the Application**:
   - Homepage: http://localhost:5501
   - Dashboard: http://localhost:5501/dashboard

## VS Code Setup

If using VS Code:

1. **Open the project folder** in VS Code
2. **Install recommended extensions** (if prompted)
3. **Use VS Code Tasks**:
   - Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Type "Tasks: Run Task"
   - Select "Install Dependencies" first
   - Then select "Start PetTracker Server"

## Troubleshooting

### Node.js Not Found
- Restart your terminal/VS Code after installing Node.js
- Add Node.js to your system PATH
- Use the full path: `C:\Program Files\nodejs\npm.exe install`

### Port Already in Use
Change the port in package.json or set environment variable:
```bash
set PORT=3000 && npm start    # Windows
export PORT=3000 && npm start # Mac/Linux
```

### Permission Issues
Run as administrator or use:
```bash
npm install --unsafe-perm
```

## Features After Setup

Once running, you'll have access to:
- 🏠 **Professional Homepage** with live dashboard preview
- 📊 **Real-time Dashboard** with GPS tracking
- 🗺️ **Interactive Maps** with pet markers
- 📱 **Responsive Design** for all devices
- 🔄 **Live Updates** every 2.5 seconds
- 🔔 **Real-time Alerts** and notifications

## Support

If you encounter issues:
1. Check this installation guide
2. Verify Node.js installation
3. Ensure all dependencies are installed
4. Check the console for error messages
