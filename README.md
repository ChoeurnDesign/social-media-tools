# 🚀 TikTok Manager Pro

A **professional-grade** desktop application for managing 1000+ TikTok accounts with advanced automation and multi-instance mobile views. Built with Electron, React, SQLite, and modern web technologies.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)

## ✨ Features

### 📱 Mobile Instance System (NEW!)
- **Multi-window management** - Open 3-10 TikTok accounts simultaneously in mobile-sized windows
- **Auto-arrangement** - Automatic grid layout (configurable 2-5 per row)
- **Device presets** - iPhone 13, iPhone 8, Pixel 6, Galaxy S21, and custom sizes
- **Session isolation** - Each instance runs independently with its own cookies
- **Real-time control** - Start/stop multiple instances, auto-arrange, and monitor all windows

### 🤖 Advanced Automation Engine (NEW!)
- **Auto-scroll** - Human-like scrolling with randomized timing
- **Auto-like** - Configurable probability-based liking (avoid detection)
- **Auto-follow** - Daily limits to prevent spam flags
- **Auto-comment** - Spin syntax support for varied comments `{Hello|Hi|Hey}`
- **Automation presets**:
  - 🔥 **Aggressive** - Maximum engagement for rapid growth
  - 🌿 **Organic** - Natural patterns (recommended)
  - 💬 **Engagement** - Focus on likes and comments
  - 🛡️ **Conservative** - Minimal automation
- **Bulk operations** - Apply settings to multiple accounts at once

### 🗄️ Professional Database (NEW!)
- **SQLite backend** - Handle 1000+ accounts smoothly
- **Automatic migration** - Seamlessly upgrade from old JSON storage
- **Activity logging** - Track all actions (scrolls, likes, follows, comments)
- **Session management** - Persistent sessions across restarts
- **Groups & Tags** - Organize accounts hierarchically
- **Proxy support** - Assign proxies per account

### 🎨 Beautiful Professional UI (NEW!)
- **Sidebar navigation** - LDPlayer-style collapsible sidebar
- **Dashboard** - Real-time statistics with gradient cards
- **Dark/Light themes** - Complete color system with smooth transitions
- **Responsive layout** - Works on all screen sizes
- **Modern animations** - Smooth, professional transitions
- **Search & Filter** - Quickly find accounts

### 🔐 Enterprise-Grade Security
- **AES-256 encryption** for all credentials
- **Encrypted database** - SQLite with encryption at rest
- **Context isolation** - Secure Electron configuration
- **No plain-text storage** - Passwords never stored in plain text
- **Local-only** - Your data never leaves your device

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

## 🚀 Quick Start Guide

### Adding Accounts

1. Navigate to **👥 Accounts** in the sidebar
2. Click **"+ Add Account"** button
3. Enter account information:
   - **Nickname/Label** (required) - A friendly name to identify this account (e.g., "My Personal Account")
   - **Username** (optional) - Your TikTok username for display purposes only
4. Click **"Add Account"** to save

**Important:** TikTok uses OAuth (Google, Facebook, Apple) for authentication, not username/password. After adding an account, you'll need to log in via TikTok's social login.

### Logging Into Accounts

1. **Find the account** in your list
2. **Click the "🚀 Login" button** on the account card
3. A mobile instance window will open with TikTok
4. **Log in normally** using TikTok's OAuth options (Google, Facebook, Apple, etc.)
5. The session is automatically saved

Next time you click login, you'll be logged in automatically!

### Opening Mobile Instances

1. Navigate to **📱 Mobile Instances** in the sidebar
2. Click **"▶️ Start 3 Instances"** to open 3 windows
3. Windows auto-arrange in a grid layout
4. Each window loads TikTok in mobile view
5. Log into each account normally

### Enabling Automation

1. Navigate to **🤖 Automation** in the sidebar
2. Select an automation preset:
   - **🌿 Organic** (recommended for beginners) - Natural, human-like behavior
   - **🔥 Aggressive** (maximum growth) - High engagement, higher risk
   - **💬 Engagement** (focus on interaction) - Likes and comments
   - **🛡️ Conservative** (minimal automation) - Safest approach
3. Click on accounts to configure individual settings
4. Use **"Apply Preset"** to apply settings to multiple accounts at once
5. Click **"Start"** on individual accounts to begin automation

### Managing Tags

1. Navigate to **🏷️ Tags Manager**
2. Click **"Add Tag"** to create new tags
3. Choose a color for easy identification
4. Select accounts and assign tags for organization
5. Use tag filters to quickly find specific groups of accounts

### Configuring Settings

1. Navigate to **⚙️ Settings** in the sidebar
2. Configure:
   - **General:** Theme, language, startup behavior
   - **Mobile Instances:** Default device, grid layout
   - **Automation:** Global limits, safety delays
   - **Proxies:** Add and manage proxy servers
   - **Data Management:** Export, import, backup

Your credentials are encrypted and stored locally on your device.

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

- **Frontend**: React 19+ with hooks
- **Backend**: Electron 39+ for cross-platform desktop
- **Database**: SQLite (better-sqlite3) with encryption
- **Build Tool**: Vite 7+ for fast builds and HMR
- **Styling**: Custom CSS with CSS variables for theming
- **Storage**: Encrypted SQLite database
- **Encryption**: crypto-js (AES-256)
- **Automation**: Custom engine with mobile window injection
- **Charts**: Recharts for analytics (coming soon)

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 Main Process (Node.js)              │
├─────────────────────────────────────────────────────┤
│  • Database Manager (SQLite)                        │
│  • Instance Manager (Mobile Windows)                │
│  • Automation Engine (Presets & Actions)            │
│  • Session Manager (Legacy Support)                 │
│  • Migration System (JSON → SQLite)                 │
└─────────────────────────────────────────────────────┘
                         │
                    IPC Bridge
                         │
┌─────────────────────────────────────────────────────┐
│              Renderer Process (React)               │
├─────────────────────────────────────────────────────┤
│  • Layout (Sidebar, Header, Main)                   │
│  • Dashboard (Statistics & Overview)                │
│  • Accounts Manager (Grid/List Views)               │
│  • Instance Controller (Multi-Window Manager)       │
│  • Automation Panel (Settings & Presets)            │
│  • Analytics (Charts & Reports)                     │
└─────────────────────────────────────────────────────┘
                         │
                  Mobile Windows
                         │
┌─────────────────────────────────────────────────────┐
│          Mobile Instance (BrowserWindow)            │
├─────────────────────────────────────────────────────┤
│  • Mobile User Agent                                │
│  • Isolated Session (partition per account)        │
│  • Auto-Scroll Engine                               │
│  • Auto-Like System                                 │
│  • Auto-Follow System                               │
│  • Auto-Comment System                              │
└─────────────────────────────────────────────────────┘
```

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
│   ├── main/                      # Electron main process
│   │   ├── index.js              # App entry & IPC handlers (40+ endpoints)
│   │   ├── database.js           # SQLite manager with 9 tables
│   │   ├── instance-manager.js   # Mobile window manager
│   │   ├── automation-engine.js  # Automation presets & logic
│   │   ├── migration.js          # JSON → SQLite migration
│   │   ├── storage.js            # Legacy encrypted storage
│   │   ├── session.js            # Legacy session management
│   │   └── preload.js            # Secure IPC bridge
│   ├── mobile/                    # Mobile instance automation
│   │   └── mobile-preload.js     # Auto-scroll, like, follow, comment
│   ├── renderer/                  # React UI
│   │   ├── App.jsx               # Main app with routing
│   │   ├── main.jsx              # React entry point
│   │   ├── components/
│   │   │   ├── layout/           # Layout components
│   │   │   │   ├── Sidebar.jsx   # Collapsible navigation
│   │   │   │   ├── Header.jsx    # Search & theme toggle
│   │   │   │   └── Layout.jsx    # Main layout wrapper
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   │   ├── Dashboard.jsx # Statistics overview
│   │   │   │   └── StatCard.jsx  # Gradient stat cards
│   │   │   ├── instances/        # Mobile instance UI
│   │   │   │   ├── InstanceController.jsx
│   │   │   │   └── InstanceCard.jsx
│   │   │   ├── accounts/         # Account management (existing)
│   │   │   │   ├── AccountList.jsx
│   │   │   │   ├── AccountCard.jsx
│   │   │   │   └── AddAccount.jsx
│   │   │   ├── automation/       # Automation UI (coming soon)
│   │   │   ├── analytics/        # Analytics UI (coming soon)
│   │   │   ├── organization/     # Groups & tags (coming soon)
│   │   │   └── settings/         # Settings UI (coming soon)
│   │   └── styles/               # CSS files
│   │       ├── variables.css     # CSS variables & themes
│   │       ├── Layout.css        # Layout styles
│   │       ├── Sidebar.css       # Sidebar styles
│   │       ├── Header.css        # Header styles
│   │       ├── Dashboard.css     # Dashboard styles
│   │       ├── Instances.css     # Instances styles
│   │       └── ...
├── public/
│   └── index.html                # HTML template
├── build-electron.js             # Electron build script
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies & scripts
└── README.md                   # This file
```

### Database Schema

The app uses SQLite with the following tables:

- **accounts** - User account credentials and stats
- **sessions** - Session cookies and authentication data
- **automation_settings** - Per-account automation configuration
- **activity_logs** - Track all automation actions
- **groups** - Hierarchical account organization
- **account_groups** - Account-to-group mapping
- **tags** - Tags for categorization
- **account_tags** - Account-to-tag mapping
- **proxies** - Proxy server configurations
- **account_proxies** - Account-to-proxy mapping

### Security Implementation

**Database Encryption:**
- SQLite database with AES-256 encryption at rest
- Passwords encrypted before database storage
- Cookies encrypted in sessions table
- No plain-text credentials ever written to disk

**Session Isolation:**
- Each mobile instance has its own Electron partition
- Isolated cookies prevent cross-account contamination
- Context isolation in all BrowserWindows
- No node integration in renderer processes

**IPC Security:**
- Controlled API through preload script
- All IPC calls validated in main process
- Type checking on all parameters
- No direct file system access from renderer

## 🆕 What's New in Version 2.0

### Major Features ✅
- ✅ **SQLite Database** - Professional backend replacing JSON storage
- ✅ **Mobile Instance System** - Open multiple TikTok windows simultaneously
- ✅ **Automation Engine** - Auto-scroll, auto-like, auto-follow, auto-comment
- ✅ **Professional UI** - LDPlayer-style sidebar navigation
- ✅ **Dashboard** - Real-time statistics with gradient cards
- ✅ **Dark/Light Themes** - Complete CSS variable system
- ✅ **Migration System** - Automatic upgrade from v1.0
- ✅ **Settings Page** - Comprehensive configuration for all app features
- ✅ **Tags Manager** - Full tag management with color coding and filtering
- ✅ **Automation UI** - Complete automation control panel with presets

### OAuth Authentication Flow ✅
- ✅ **Removed password requirement** - TikTok uses OAuth (Google, Facebook, Apple)
- ✅ **Simplified account creation** - Only nickname/label required
- ✅ **Better UX** - Clear instructions on authentication flow

### Breaking Changes
- **Authentication:** Accounts no longer require passwords. Use TikTok's OAuth login after creating accounts.
- Database migrated from JSON to SQLite (automatic migration on first launch)
- Login now opens mobile instances instead of full browser windows
- New IPC API (backward compatible with old methods)

### Performance Improvements
- Handles 1000+ accounts smoothly
- Faster search and filtering
- Optimized rendering with React 19
- Lazy loading for large account lists

### Completed Features
- 📊 Settings page with 6 sections (General, Instances, Automation, Proxies, Data, About)
- 🏷️ Full tags manager with color picker and bulk operations
- 🤖 Complete automation UI with 4 presets and granular controls
- 🔐 Improved security with optional password storage
- 💾 Content queue database schema ready
- ⚙️ App settings persistence

### Coming Soon
- 📊 Advanced analytics with charts (Recharts integration)
- 🎥 Content queue for scheduled uploads
- 📤 Import/Export functionality implementation
- 🗂️ Groups/folders manager UI
- 📈 Enhanced dashboard with activity feed and trends
- 📤 Import/Export functionality
- 🎥 Content queue for scheduled uploads
- ⚙️ Comprehensive settings panel
- All passwords are encrypted using AES-256 before storage
- Encryption key is stored separately from data
- No plain-text credentials ever written to disk
- **Note**: Current implementation uses a static encryption key for simplicity. For enhanced security in production deployments, consider implementing:
  - Master password-based key derivation using PBKDF2
  - System keychain integration for key storage
  - Per-installation unique encryption keys

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

