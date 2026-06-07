# 🚀 ComeBack.ai - Setup & Run Guide

## Prerequisites

Ensure you have:
- **Node.js** >= 18.0.0
- **npm** >= 10.0.0 (or yarn, pnpm)
- **Git**
- **Android Studio** (for native Android development - optional)
- **Xcode** (for iOS development - optional)
- **Google Cloud Account** (for Gemini API)
- **MongoDB Atlas Account** (for database)
- **Firebase Project** (optional, for real-time features)
- **Stripe Account** (for payments)
- **Resend Account** (for email)

---

## 📦 Installation

### 1. Clone & Navigate
```bash
git clone https://github.com/Oliversmoke/nrx.git comeback-ai
cd comeback-ai
```

### 2. Set Up Environment Variables
```bash
# Copy the master environment template
cp .env.example .env.local

# Edit with your actual values
nano .env.local  # or use your preferred editor
```

**Required minimum values:**
```
MONGODB_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-secret-key
FIREBASE_PROJECT_ID=your-firebase-project
STRIPE_SECRET_KEY=your-stripe-key
```

### 3. Install Root Dependencies
```bash
npm install
```

### 4. Install Mobile Dependencies (if using React Native)
```bash
cd mobile
npm install
cd ..
```

---

## 🏃 Running the Application

### Option 1: Full Stack (Web + Chat Server)

```bash
# Runs both Next.js web app and Socket.io chat server concurrently
npm run dev
```

**Outputs:**
- 🌐 **Web App**: http://localhost:3000
- 💬 **Chat Server**: http://localhost:3001

### Option 2: Web App Only

```bash
npm run dev:web
```

**Outputs:**
- 🌐 **Web App**: http://localhost:3000

### Option 3: Chat Server Only

```bash
npm run dev:chat
```

**Outputs:**
- 💬 **Chat Server**: http://localhost:3001

### Option 4: React Native / Expo (Mobile)

```bash
# In a new terminal
npm run dev:mobile

# Or navigate to mobile folder first
cd mobile
npm start

# Then choose:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Press 'w' for web browser
# - Scan QR code with Expo Go app on physical device
```

**Outputs:**
- 📱 **Expo Dev Server**: http://localhost:19000
- 📝 **Expo CLI**: Terminal for logs and commands

### Option 5: Native Android (Kotlin/Jetpack Compose)

```bash
cd mobile/android

# Build debug APK
./gradlew assembleDebug

# Or open in Android Studio
open -a "Android Studio" .
```

---

## 🛠️ Development Commands

### Web & Server
```bash
npm run dev          # Full stack (web + chat)
npm run dev:web      # Next.js only
npm run dev:chat     # Socket.io server only
npm run build:web    # Build Next.js for production
npm run lint         # Run ESLint
npm run clean        # Clear build artifacts
```

### Mobile (React Native)
```bash
cd mobile

npm start            # Start Expo dev server
npm run android      # Start with Android emulator
npm run ios          # Start with iOS simulator
npm run web          # Run in browser
npm run build        # Build for deployment
npm run eas-build    # Build on EAS (cloud build)
```

### Android Native
```bash
cd mobile/android

./gradlew build      # Build debug
./gradlew assemble   # Build release APK
./gradlew installDebug    # Install on emulator
./gradlew test       # Run unit tests
```

---

## 📱 Database Setup

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Add to `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/comeback-ai
   ```
4. Models automatically initialize on first connection

### Firestore (Optional)

1. Create Firebase project at [firebase.google.com](https://firebase.google.com)
2. Download service account key
3. Add to `.env.local`:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   ```

---

## 🤖 AI Setup - Google Gemini

1. Go to [Google AI Studio](https://ai.google.dev/studio)
2. Create API key
3. Add to `.env.local`:
   ```
   GEMINI_API_KEY=your-api-key
   ```
4. The app uses three AI agents:
   - **Goal Planner** - Creates learning paths
   - **Recovery Agent** - Generates recovery plans
   - **Motivation Agent** - Provides coaching

---

## 💳 Payments & Email Setup

### Stripe
1. Get API keys from [stripe.com](https://stripe.com)
2. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   ```

### Resend (Email)
1. Get API key from [resend.com](https://resend.com)
2. Add to `.env.local`:
   ```
   RESEND_API_KEY=your-api-key
   ```

### Web Push Notifications
1. Generate VAPID key:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx
   VAPID_PRIVATE_KEY=xxx
   ```

---

## 🔌 Socket.io Chat Server

The chat server runs independently but is part of the full stack.

### Manual Start
```bash
node services/chat/server.js
```

### Configuration
See `/services/chat/server.js` for Socket.io options:
- CORS settings
- Authentication
- Message persistence
- Room management

### Chat Features
- ✅ Public channels
- ✅ Private messages
- ✅ Group rooms
- ✅ JWT authentication
- ✅ Message history via Firestore

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Expo Issues

```bash
# Clear Expo cache
rm -rf $TMPDIR/expo-*
npm run dev:mobile
```

### Android Build Issues

```bash
cd mobile/android

# Clean Gradle
./gradlew clean

# Rebuild
./gradlew build
```

### Database Connection Errors

- Verify MongoDB URI in `.env.local`
- Check whitelist IP in MongoDB Atlas dashboard
- Ensure network access is enabled

### Gemini API Errors

- Verify API key is correct
- Check rate limits on Google Cloud console
- Ensure API is enabled in Google Cloud project

---

## 📊 Project Structure Quick Reference

```
comeback-ai/
├── app/              # Next.js web app (main)
├── mobile/           # React Native + Android
├── services/chat/    # Socket.io microservice
├── lib/              # Shared business logic
├── components/       # All UI components
├── types/            # TypeScript definitions
├── docs/             # Documentation
├── package.json      # ✨ Unified dependencies
├── .env.example      # ✨ Master env template
└── next.config.ts    # Next.js configuration
```

---

## 🚢 Deployment

### Web App (Next.js) → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then re-deploy with vercel --prod
```

### Chat Server → Google Cloud Run

```bash
# Build image
docker build -t comeback-ai-chat services/chat/

# Push to Google Container Registry
docker tag comeback-ai-chat gcr.io/YOUR-PROJECT/comeback-ai-chat
docker push gcr.io/YOUR-PROJECT/comeback-ai-chat

# Deploy to Cloud Run
gcloud run deploy comeback-ai-chat \
  --image gcr.io/YOUR-PROJECT/comeback-ai-chat \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Mobile → Expo & Google Play Store

```bash
# Build with EAS
cd mobile
npm run eas-build

# Submit to app stores (requires developer accounts)
eas submit --platform android
eas submit --platform ios
```

---

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://react-native.dev/docs)
- [Expo Docs](https://docs.expo.dev)
- [Google Gemini API](https://ai.google.dev/docs)
- [Socket.io Docs](https://socket.io/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [Firebase Docs](https://firebase.google.com/docs)

---

## 🎯 Next Steps

1. **Set up environment variables** → copy and complete `.env.local`
2. **Install dependencies** → `npm install && cd mobile && npm install`
3. **Start development** → `npm run dev`
4. **Create first goal** → Navigate to signup at http://localhost:3000/signup
5. **Test chat server** → Connect to http://localhost:3001
6. **Deploy when ready** → See deployment guides above

**Happy coding! 🚀**
