# 🎵 TikTok Account Manager

A powerful desktop application for managing and switching between multiple TikTok accounts (10+) without needing to log in repeatedly. Built with Electron, React, and modern web technologies.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## ✨ Features

### 🔐 Secure Multi-Account Management
- **Add unlimited TikTok accounts** with encrypted credential storage
- **Edit account information** including nicknames and credentials
- **Delete accounts** with automatic session cleanup
- **AES-256 encryption** for all stored credentials
- **Master password protection** (optional)

### ⚡ Quick Account Switching
- **One-click login** to any saved account
- **Session persistence** - stay logged in across app restarts
- **Multiple sessions** - open several accounts simultaneously in separate windows
- **Visual status indicators** showing which accounts are active

### 🎨 Beautiful Modern UI
- **Dark/Light theme** toggle with smooth transitions
- **Gradient color scheme** with purple/blue aesthetic
- **Responsive design** that works on all screen sizes
- **Smooth animations** and intuitive navigation
- **Search/filter** functionality for managing many accounts

### 🔒 Security First
- Industry-standard AES-256 encryption for credentials
- Secure Electron configuration with context isolation
- Local-only storage - your data never leaves your device
- No password logging or plain-text storage
- Session cookies encrypted at rest

## 📥 Installation

### Download Pre-built Installers

Download the latest release for your platform from the [Releases](https://github.com/ChoeurnDesign/social-media-tools/releases) page:

- **Windows**: Download `.exe` installer
- **macOS**: Download `.dmg` installer
- **Linux**: Download `.AppImage` file

### Windows Installation
1. Download the `.exe` file
2. Double-click to run the installer
3. Follow the installation wizard
4. Launch "TikTok Account Manager" from Start Menu

### macOS Installation
1. Download the `.dmg` file
2. Open the DMG file
3. Drag the app to your Applications folder
4. Launch from Applications (you may need to allow the app in System Preferences > Security & Privacy)

### Linux Installation
1. Download the `.AppImage` file
2. Make it executable: `chmod +x TikTok-Account-Manager-*.AppImage`
3. Run: `./TikTok-Account-Manager-*.AppImage`

### Build from Source

Requirements:
- Node.js 18+ and npm
- Git

```bash
# Clone the repository
git clone https://github.com/ChoeurnDesign/social-media-tools.git
cd social-media-tools

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for your platform
npm run build        # All platforms
npm run build:win    # Windows only
npm run build:mac    # macOS only
npm run build:linux  # Linux only
```

## 🚀 Usage Guide

### Adding Your First Account

1. **Launch the app** - Click the TikTok Account Manager icon
2. **Click "Add Account"** button in the top right
3. **Enter your TikTok credentials**:
   - Username (required)
   - Password (required for new accounts)
   - Nickname (optional - a friendly name for the account)
4. **Click "Add Account"** to save

Your credentials are immediately encrypted with AES-256 before being stored locally.

### Logging Into an Account

1. **Find the account** in your list (use search if you have many)
2. **Click the "🚀 Login" button** on the account card
3. A new window will open with TikTok
4. **Log in normally** in the browser window
5. The session is automatically saved

Next time you click login, you'll be logged in automatically!

### Managing Accounts

**Edit an Account:**
- Click the "✏️ Edit" button on any account card
- Update the information (leave password blank to keep current)
- Click "Update Account"

**Delete an Account:**
- Click the "🗑️ Delete" button on any account card
- Confirm the deletion
- The account and all its sessions are removed

**Search/Filter:**
- Use the search bar at the top to filter accounts by username or nickname

### Using Multiple Accounts Simultaneously

You can have multiple TikTok sessions open at the same time:

1. Click "Login" on the first account - a window opens
2. Click "Login" on another account - another window opens
3. Each window maintains its own isolated session
4. Active accounts show a green "Active" badge

### Theme Toggle

Click the **☀️/🌙 button** in the top right corner to switch between dark and light themes. Your preference is saved automatically.

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend Framework**: Electron 39+ for cross-platform desktop
- **UI Framework**: React 19+ with hooks
- **Build Tool**: Vite 7+ for fast builds
- **Styling**: Custom CSS with CSS variables for theming
- **Storage**: electron-store with encryption
- **Encryption**: crypto-js (AES-256)
- **Automation**: Browser windows with isolated sessions

### Project Structure

```
social-media-tools/
├── src/
│   ├── main/                  # Electron main process
│   │   ├── index.js          # App entry point & IPC handlers
│   │   ├── storage.js        # Encrypted credential storage
│   │   ├── session.js        # Session & window management
│   │   └── preload.js        # Secure IPC bridge
│   ├── renderer/             # React UI
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # React entry point
│   │   ├── components/       # UI components
│   │   │   ├── AccountList.jsx
│   │   │   ├── AccountCard.jsx
│   │   │   └── AddAccount.jsx
│   │   └── styles/           # CSS files
│   │       ├── App.css
│   │       ├── AccountList.css
│   │       ├── AccountCard.css
│   │       └── AddAccount.css
├── public/
│   └── index.html            # HTML template
├── .github/
│   └── workflows/
│       └── build.yml         # CI/CD for releases
├── build-electron.js         # Electron build script
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies & scripts
└── README.md               # This file
```

### Security Implementation

**Credential Encryption:**
- All passwords are encrypted using AES-256 before storage
- Encryption key is stored separately from data
- No plain-text credentials ever written to disk

**Session Security:**
- Each account gets an isolated browser session
- Cookies are encrypted when saved
- Context isolation prevents XSS attacks
- No node integration in renderer process

**IPC Security:**
- Preload script provides controlled API
- Only specific functions exposed to renderer
- All IPC calls validated in main process

## 🔧 Development

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

### Setup Development Environment

```bash
# Clone the repo
git clone https://github.com/ChoeurnDesign/social-media-tools.git
cd social-media-tools

# Install dependencies
npm install

# Start development server
npm run dev
```

This will:
1. Start Vite dev server on port 5173
2. Launch Electron with hot reload
3. Open DevTools automatically

### Available Scripts

- `npm run dev` - Start development mode
- `npm run build:renderer` - Build React app
- `npm run build:electron` - Build Electron main process
- `npm run build` - Full production build
- `npm run build:win` - Build Windows installer
- `npm run build:mac` - Build macOS installer
- `npm run build:linux` - Build Linux AppImage

### Building for Distribution

```bash
# Build for all platforms (requires appropriate OS)
npm run build

# Or build for specific platform
npm run build:win     # Windows .exe
npm run build:mac     # macOS .dmg
npm run build:linux   # Linux .AppImage
```

Installers will be in the `out/` directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### App won't start on macOS
**Solution**: Right-click the app and select "Open", then click "Open" in the security dialog. This only needs to be done once.

### "App is not signed" warning on macOS
**Solution**: This is expected for community builds. Go to System Preferences > Security & Privacy and click "Open Anyway".

### Linux AppImage won't run
**Solution**: Make sure the file is executable:
```bash
chmod +x TikTok-Account-Manager-*.AppImage
```

### Sessions not persisting
**Solution**: Make sure you're logging in through the browser window that opens, not just entering credentials. The app needs to capture the session cookies.

### Multiple accounts showing as same user
**Solution**: This can happen if TikTok's cookies conflict. Try:
1. Delete both accounts from the app
2. Restart the app
3. Add accounts one at a time, logging in completely before adding the next

### Build fails on Windows
**Solution**: Make sure you have Windows Build Tools installed:
```bash
npm install --global windows-build-tools
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is for educational and personal use only. Use responsibly and in accordance with TikTok's Terms of Service. The developers are not responsible for any misuse or violations of TikTok's policies.

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://react.dev/)
- Build tooling by [Vite](https://vitejs.dev/)
- Icons and emojis from Unicode

## 📧 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub Issues](https://github.com/ChoeurnDesign/social-media-tools/issues)
- Check the [Troubleshooting](#-troubleshooting) section above

---

Made with ❤️ by ChoeurnDesign

