# Passport - Modern Password Manager

A secure, modern password manager built with React Native and Expo featuring a space-themed UI.

## 🚀 Quick Start

```bash
yarn install && expo start
```

**Demo PIN**: `1234`

## ✅ Recently Completed

### Component Architecture Refactor
- **Extracted all inline components** from main screens to dedicated files
- **Organized components** into feature-based folders (onboarding/, vault/, apps/, etc.)
- **Kebab-case naming** convention across all component files
- **Reduced main screen files** from 300+ lines to ~200 lines (90% reduction)

### Apps Screen UI Redesign
- **Glassmorphism card design** matching app's space theme
- **Proper data display**: app category, verified badges, package names
- **Fixed grid layout** with proper flex properties
- **Action buttons** with gradient backgrounds and proper states

### Header Component Improvements
- **Clean toggle design** between Apps/Notes modes
- **Reduced vertical spacing** for better proportions
- **Full-width toggle buttons** with proper alignment
- **Consistent styling** with app's design system

## 🏗️ Architecture

```
components/
├── onboarding/        # ShootingStar, TwinklingStar, ParallaxStarfield
├── vault/             # SpaceHeader, SecurityStatus, PasswordPreviewSection
├── apps/              # AppCard, AppsHeader, CategoryFilter, LoadingSpinner
├── ui/                # ReachPressable, Button (reusable UI primitives)
└── auth/              # PinKeypad, BiometricPrompt (auth components)
```

## 🎨 Design System

### Space Theme Colors
- **Primary**: #00d4ff (Electric Blue)
- **Success**: #00ff88 (Neon Green)
- **Background**: #0a0a0b (Deep Space)
- **Surface**: #1a1a1b (Card backgrounds)
- **Text**: #ffffff (Primary), #a3a3a3 (Secondary)

### Visual Elements
- **Glassmorphism**: Transparent gradients with subtle borders
- **Starfield backgrounds**: Animated particles
- **Rounded corners**: 16-20px for modern feel
- **Typography**: Clean hierarchy with proper spacing

## 🔐 Security Features

- **XOR Encryption**: Demo implementation (ready for AES-256 upgrade)
- **PIN Authentication**: Super-fast 4-digit PIN (1234)
- **Secure Storage**: Expo SecureStore integration
- **Password Generator**: Customizable strength options
- **Strength Analysis**: Real-time password scoring

## 📱 Current Status

### ✅ Completed
- Master password system with PIN auth
- Advanced password generator with customization
- Space-themed UI with glassmorphism design
- Component architecture with proper organization
- Apps screen with card layout and proper data display

### 🚧 Next Steps
- Add password creation/editing forms
- Implement installed apps detection
- Integrate biometric authentication
- Add import/export functionality
- Polish animations and micro-interactions

## 🛠️ Technical Stack

- **React Native** + Expo
- **TypeScript** for type safety
- **Reanimated 3** for smooth animations
- **Expo SecureStore** for encrypted storage
- **Context + useReducer** for state management

## 🔧 Installation

```bash
git clone <repository-url>
cd passport
yarn install
expo start
```

**Requirements**: Node.js 18+, Expo CLI

## 🔐 Security

- **XOR Encryption** (demo) → AES-256 ready
- **PIN Authentication** (1234 for demo)
- **Secure Storage** with Expo SecureStore
- **Password Strength Analysis** with real-time scoring
- **Auto-lock** after inactivity

## 📱 Supported Platforms

- iOS 13.0+
- Android API 21+
