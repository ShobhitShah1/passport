# Passport - Modern Password Manager

A secure, modern password manager built with React Native and Expo, featuring a Gen-Z inspired dark theme with colorful accents.

## 🎯 Project Overview

Passport is a comprehensive password manager that helps users securely store passwords for their installed applications, generate strong passwords, and manage their digital security with style.

## 🚀 Features

### Core Features
- **Secure Password Storage**: AES-256 encryption for all stored passwords
- **Installed Apps Detection**: Automatically detects installed apps on the device
- **Smart Password Generator**: Generates strong passwords with customizable criteria (15+ characters, symbols, numbers, mixed case)
- **Password Strength Analysis**: Real-time password strength assessment
- **Biometric Authentication**: Fingerprint/Face ID support for app access
- **Auto-fill Integration**: Seamless password auto-fill for supported apps

### UI/UX Features
- **Modern Gen-Z Dark Theme**: Sleek dark mode with vibrant accent colors
- **Colorful Interface**: Strategic use of neon and gradient colors for visual appeal
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Intuitive Navigation**: Tab-based navigation with modern design patterns

### Security Features
- **Zero-Knowledge Architecture**: Passwords encrypted locally, never stored in plaintext
- **Master Password Protection**: Single master password to access all stored passwords
- **Secure Key Derivation**: PBKDF2 with salt for key generation
- **Auto-lock**: Automatic app locking after inactivity
- **Breach Detection**: Check if passwords have been compromised in data breaches

## 🏗️ Technical Architecture

### Technology Stack
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based routing)
- **State Management**: React Context + useReducer
- **Storage**: Expo SecureStore for encrypted local storage
- **Encryption**: expo-crypto for AES-256 encryption
- **Authentication**: expo-local-authentication for biometric auth
- **Styling**: React Native StyleSheet with custom theming system

### Project Structure
```
passport/
├── app/                    # App screens and routing
│   ├── (tabs)/            # Tab-based navigation
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screens
├── components/            # Reusable UI components
├── constants/             # App constants and themes
├── services/              # Core business logic
│   ├── encryption/        # Encryption utilities
│   ├── password/          # Password generation and validation
│   ├── storage/           # Secure storage management
│   └── apps/              # Installed apps detection
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🎨 Design System

### Color Palette
- **Primary Dark**: #0a0a0b (Deep black background)
- **Secondary Dark**: #1a1a1b (Card backgrounds)
- **Accent Colors**:
  - Electric Blue: #00d4ff
  - Neon Green: #00ff88
  - Purple Glow: #8b5cf6
  - Pink Flash: #ff6b9d
- **Text Colors**:
  - Primary: #ffffff
  - Secondary: #a3a3a3
  - Success: #00ff88
  - Warning: #ffab00
  - Error: #ff4757

### Typography
- **Primary Font**: System default (iOS: SF Pro, Android: Roboto)
- **Accent Font**: SpaceMono for code/passwords
- **Font Sizes**: 12px, 14px, 16px, 20px, 24px, 32px

## 📋 Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up project structure and core navigation
- [ ] Implement dark theme and color system
- [ ] Create reusable UI components
- [ ] Set up secure storage and encryption services

### Phase 2: Core Features (Week 3-4)
- [ ] Master password setup and authentication
- [ ] Password storage and retrieval system
- [ ] Basic password generator
- [ ] App list and password management UI

### Phase 3: Advanced Features (Week 5-6)
- [ ] Installed apps detection
- [ ] Biometric authentication
- [ ] Password strength analysis
- [ ] Auto-fill integration

### Phase 4: Polish & Security (Week 7-8)
- [ ] Security auditing and testing
- [ ] Performance optimization
- [ ] UI/UX refinements
- [ ] Comprehensive testing

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd passport

# Install dependencies
yarn install

# Start the development server
expo start
```

### Environment Setup
1. Install Expo CLI globally: `npm install -g @expo/cli`
2. Set up iOS Simulator or Android Emulator
3. Configure biometric authentication (for physical devices)

## 🔐 Security Considerations

### Encryption Strategy
- All passwords encrypted using AES-256 before storage
- Master password never stored, only its hash
- Salt-based key derivation for additional security
- Local storage only - no cloud synchronization initially

### Data Protection
- Automatic app locking after 5 minutes of inactivity
- Screen recording prevention
- Screenshot blocking for sensitive screens
- Memory clearing on app backgrounding

### Password Generation
- Minimum 15 characters for generated passwords
- Cryptographically secure random number generation
- Customizable character sets (uppercase, lowercase, numbers, symbols)
- Entropy calculation for strength assessment

## 🛠️ Current Implementation Status

### ✅ **Completed Features:**

**🔐 Core Security Infrastructure:**
- ✅ Master password system with secure hashing
- ✅ XOR-based encryption for demo (ready for AES-256 upgrade)
- ✅ Secure storage using Expo SecureStore
- ✅ Password generation with cryptographic randomness
- ✅ Real-time password strength analysis

**🎨 Modern UI/UX:**
- ✅ **Unique Gen-Z Dark Theme** with electric gradients
- ✅ **Glassmorphic UI elements** with neon accents
- ✅ **Dynamic color gradients** throughout the app
- ✅ **Smooth animations** and micro-interactions
- ✅ **Responsive layout** for all screen sizes

**🚀 App Flow:**
- ✅ **Beautiful onboarding** with animated feature highlights
- ✅ **Secure master password setup** with real-time validation
- ✅ **Biometric authentication** (UI ready, integration pending)
- ✅ **Main vault dashboard** with security score visualization
- ✅ **Tab navigation** (Vault, Generator, Settings)

**🔧 Technical Foundation:**
- ✅ **TypeScript** with full type safety
- ✅ **React Native** with Expo managed workflow
- ✅ **Context-based state management** 
- ✅ **Modular architecture** with service separation
- ✅ **Custom UI component library**

### 🎯 **Unique Visual Features:**

**Gradient System:**
- **Electric Blue** (#00d4ff) → **Purple Glow** (#8b5cf6)
- **Neon Green** (#00ff88) → **Pink Flash** (#ff6b9d)
- **Dynamic security score** visualization with color-coded gradients
- **Animated gradient backgrounds** throughout the app

**Interactive Elements:**
- **Glowing action buttons** with gradient animations
- **Floating card design** with depth and shadows
- **Color-coded password strength** indicators
- **Dynamic app icons** with consistent color generation

### 🚧 **Next Phase Implementation:**

**Priority 1 - Core Functionality:**
- [ ] Password list screen with search/filter
- [ ] Add/Edit password forms
- [ ] Password generator screen with customizable options
- [ ] Auto-fill integration setup

**Priority 2 - Advanced Features:**
- [ ] Installed apps detection (Mobile)
- [ ] Password breach detection
- [ ] Biometric authentication integration
- [ ] Import/export functionality

**Priority 3 - Polish:**
- [ ] Settings screen with theme customization
- [ ] Analytics and security reports
- [ ] Tutorial system
- [ ] Performance optimizations

## 🎨 **Design Philosophy**

**Gen-Z Aesthetic:**
- **Dark-first design** with strategic neon highlights
- **Gradient-heavy interface** with smooth color transitions
- **Minimalist but expressive** visual language
- **Performance-optimized** animations and transitions

**Unique Visual Identity:**
- Custom color palette inspired by cyberpunk aesthetics
- Glassmorphic elements with subtle transparency
- Dynamic gradients that respond to user interaction
- Modern typography with carefully chosen font weights

## 🧪 Testing Strategy

- Unit tests for encryption/decryption functions
- Integration tests for storage operations
- UI tests for critical user flows
- Security testing for authentication flows

## 📱 Supported Platforms

- iOS 13.0+
- Android API level 21+
- Expo development builds for enhanced features

## 🚀 **Getting Started**

```bash
# Install dependencies
yarn install

# Start development server
expo start

# Run on iOS simulator
expo start --ios

# Run on Android emulator
expo start --android
```

## 🤝 Contributing

1. Follow the established code style and patterns
2. Write tests for new functionality
3. Update documentation as needed
4. Ensure all security requirements are met

## 📄 License

This project is licensed under the MIT License.

---

*Building secure, stylish password management for the modern user with cutting-edge Gen-Z aesthetics.*