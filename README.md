# PocketLedger 💰

A modern, offline-first React Native mobile app for tracking personal income and expenses with automatic cloud sync, smart notifications, and multi-currency support.

[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)

## ✨ Features

- **Transaction tracking** with income/expense categorization
- **Offline-first architecture** — full functionality without internet using SQLite
- **Automatic cloud sync** to Firebase Firestore with conflict resolution
- **Smart notification center** — in-app notifications, salary reminders, transaction alerts
- **Multi-currency support** — 13+ currencies (USD, EUR, GBP, IQD, SAR, AED, KWD, etc.)
- **User profiles** with display names and profile pictures
- **Real-time dashboard** showing income, expenses, and balance
- **Manual sync controls** — pull from cloud, restore from backup
- **Firebase authentication** with email/password and password recovery

## 🛠️ Tech Stack

- React Native + TypeScript
- Expo Router for file-based navigation
- Firebase (Auth + Firestore) for cloud sync
- Expo SQLite for local database
- Expo Notifications for push & local notifications
- React Native Reanimated for animations
- AsyncStorage for user preferences

## 🧠 Technical Decisions

- Used **offline-first architecture** to ensure app works without internet, syncing later when online.
- Applied **SQLite** for local data persistence with automatic Firestore sync.
- Used **Expo Notifications** for reliable salary reminders and transaction alerts.
- Split sync logic, database operations, and UI components for maintainability.

## 📦 Usage Example

- Sign up or sign in with email/password
- Add income/expense transactions with categories
- View dashboard showing balance and recent transactions
- Switch currency in settings (USD, EUR, IQD, etc.)
- Configure salary reminders for monthly notifications
- Sync data across devices via Firebase
- Work offline — data syncs automatically when online

## 🌱 Why This Project?

- Helps people manage personal finances and track spending habits
- Works offline-first for reliability in areas with poor connectivity
- Multi-currency support for travelers and international users
- Smart notifications to maintain financial discipline
- A practical tool with real-world financial impact

## 🔮 Future Improvements

- Multi-language support
- Server timestamp-based conflict resolution for multi-device editing
- Monthly/yearly budget tracking and spending limits
- Category-wise spending analytics and charts
- CSV/PDF export functionality
- Recurring transaction scheduling

# 👥 Contributing

Feel free to fork, open issues, or send PRs. Let's make personal finance management accessible to everyone.

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
