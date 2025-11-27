# PocketLedger 💰

A modern, offline-first React Native mobile app for tracking personal income and expenses. Built with Expo Router, featuring local SQLite storage with automatic cloud sync to Firebase Firestore.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg?style=flat&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript)

## ✨ Features

- **💳 Transaction Management**: Track income and expenses with categories, notes, and dates
- **🔒 Firebase Authentication**: Secure user authentication with email/password
- **📱 Offline-First Architecture**: Full functionality without internet connection using SQLite
- **☁️ Cloud Sync**: Automatic synchronization with Firebase Firestore when online
- **🎨 Modern UI**: Clean, polished interface with dark/light theme support
- **📊 Categorization**: Organize transactions with customizable categories and icons
- **🔄 Real-time Updates**: Seamless data sync across devices
- **📤 Export-Ready**: Built with EAS for easy APK/App Bundle generation

## 🏗️ Tech Stack

### Frontend
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0) - Development tooling and managed workflow
- **Expo Router** (~6.0) - File-based routing with typed routes
- **TypeScript** (5.9) - Type-safe development
- **React Navigation** - Navigation with bottom tabs

### Backend & Storage
- **Firebase Auth** - User authentication and session management
- **Firebase Firestore** - Cloud database for sync
- **Expo SQLite** - Local offline database
- **AsyncStorage** - Persistent key-value storage

### Additional Libraries
- **React Native Reanimated** - Smooth animations
- **Expo Haptics** - Tactile feedback
- **UUID** - Unique ID generation for transactions
- **Expo Image Picker** - Profile/receipt image uploads

## 📁 Project Structure

```
PocketLedger/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx            # Dashboard/Home
│   │   ├── transactions.tsx     # Transaction list
│   │   └── settings.tsx         # User settings
│   ├── add-transaction.tsx      # Add new transaction
│   ├── view-transaction.tsx     # Transaction details
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   └── ui/                      # UI primitives
├── constants/                    # App constants & theme
├── db/                          # Database layer
│   ├── sqlite.ts               # SQLite initialization
│   └── transactionsRepo.ts     # Transaction repository
├── firebase/                     # Firebase configuration
│   ├── config.ts               # Firebase setup
│   └── sync.ts                 # Sync logic
├── hooks/                       # Custom React hooks
│   └── useAuth.tsx             # Authentication hook
└── assets/                      # Images and static files
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (for building): `npm install -g eas-cli`
- **Android Studio** or **Xcode** (for emulators)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RoaaK95/PocketLedger.git
   cd PocketLedger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Update `firebase/config.ts` with your Firebase credentials

4. **Start the development server**
   ```bash
   npm start
   ```

### Running the App

- **iOS Simulator**: `npm run ios`
- **Android Emulator**: `npm run android`
- **Web Browser**: `npm run web`
- **Physical Device**: Scan QR code with Expo Go app

## 📱 Building for Production

### Android APK

```bash
npx eas build -p android --profile apk
```

### Android App Bundle (Google Play)

```bash
npx eas build -p android --profile production
```

### iOS

```bash
npx eas build -p ios --profile production
```

## 🗄️ Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,           -- 'income' or 'expense'
  amount REAL NOT NULL,
  categoryId TEXT NOT NULL,
  note TEXT,
  date TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  syncStatus TEXT NOT NULL      -- 'synced', 'pending', 'error'
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  createdAt TEXT NOT NULL
);
```

## 🔄 Sync Architecture

The app implements an **offline-first** approach:

1. **Local Operations**: All CRUD operations happen on SQLite first
2. **Sync Queue**: Changes are marked with `syncStatus: 'pending'`
3. **Background Sync**: When online, pending changes sync to Firestore
4. **Conflict Resolution**: Server timestamp-based merge strategy
5. **Fallback**: Full offline functionality maintained


## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android emulator/device |
| `npm run ios` | Run on iOS simulator/device |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset project to clean state |

## 🔐 Security Notes

- Firebase API keys are included for demo purposes
- **For production**: Use environment variables and secrets management
- Implement proper security rules in Firestore
- Enable app check for production builds

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.


---

⭐ If you find this project useful, please consider giving it a star!
 
 
