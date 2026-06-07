# 🏗️ ComeBack.ai - Unified Codebase Structure

## Directory Layout

```
comeback-ai/
│
├── 📄 Core Configuration
│   ├── package.json              # ✨ UNIFIED: All dependencies
│   ├── package.json.unified      # (backup of consolidation)
│   ├── package-lock.json         # Single lock file
│   ├── .env.example              # ✨ MASTER: All environment variables
│   ├── .gitignore                # Git exclusions
│   ├── tsconfig.json             # ✨ UNIFIED: TypeScript config
│   ├── next.config.ts            # Next.js config (main framework)
│   ├── vercel.json               # Vercel deployment config
│   ├── postcss.config.mjs         # PostCSS + Tailwind
│   └── middleware.ts             # Auth middleware
│
├── 📱 MAIN WEB APP - Next.js 15 (PORT 3000)
│   ├── app/                      # ✨ Next.js App Router
│   │   ├── (app)/                # Protected routes
│   │   ├── api/                  # Backend API endpoints (18+)
│   │   ├── login/                # Auth pages
│   │   ├── signup/               
│   │   ├── pricing/              
│   │   │
│   │   ├── marketplace/          # 🆕 Integrated DePIN Marketplace
│   │   │   ├── page.tsx          # Marketplace home
│   │   │   ├── [id]/page.tsx     # Product details
│   │   │   ├── components/       # Marketplace-specific components
│   │   │   ├── lib/              # Marketplace utilities
│   │   │   └── styles/           # Marketplace styles
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── manifest.ts           # PWA manifest
│   │   └── sw.ts                 # Service Worker
│   │
│   └── public/                   # Static assets
│       ├── icons/                # App icons
│       ├── manifest.webmanifest  # PWA config
│       └── ...                   # Other static assets
│
├── 🤖 SHARED BUSINESS LOGIC - /lib/ (UNIFIED)
│   ├── ai/                       # Google Gemini 2.5
│   │   ├── config.ts             # API configuration
│   │   ├── gemini.ts             # Gemini wrapper
│   │   ├── agents/
│   │   │   ├── goal-planner.ts   # Goal → Path generation
│   │   │   ├── recovery.ts       # Recovery plan creation
│   │   │   └── motivation.ts     # Coaching & burnout detection
│   │   └── guard.ts              # Rate limiting
│   │
│   ├── auth/                     # Authentication (JWT + Firebase)
│   │   ├── jwt.ts                # JWT generation/verification
│   │   ├── password.ts           # Password hashing
│   │   ├── session.ts            # Session management
│   │   ├── firebase.ts           # Firebase Auth integration
│   │   └── middleware.ts         # Auth checks
│   │
│   ├── db/                       # Database abstraction
│   │   ├── index.ts              # MongoDB connection
│   │   ├── firebase.ts           # Firestore integration
│   │   ├── models.ts             # Mongoose schemas
│   │   └── types.ts              # TS interfaces
│   │
│   ├── gamification/             # XP, levels, streaks, badges
│   │   ├── index.ts              # Main logic
│   │   └── streak-sync.ts        # Streak calculation
│   │
│   ├── recovery/                 # Core recovery engine
│   │   ├── index.ts              # Recovery plan logic
│   │   ├── detect-miss.ts        # Miss detection
│   │   └── context.ts            # Recovery context
│   │
│   ├── notifications/            # Push notifications
│   │   ├── push.ts               # Web push
│   │   ├── schedule.ts           # Scheduling
│   │   └── types.ts              # Notification types
│   │
│   ├── services/                 # Business services
│   │   ├── goal.ts               # Goal operations
│   │   ├── task.ts               # Task operations
│   │   ├── user.ts               # User operations
│   │   └── analytics.ts          # Analytics
│   │
│   ├── offline/                  # PWA offline support
│   │   └── cache.ts              # Offline caching
│   │
│   ├── hooks/                    # Custom React hooks
│   ├── utils.ts                  # Utility functions
│   ├── templates.ts              # Goal templates
│   └── types.ts                  # Global types
│
├── 🎨 REACT COMPONENTS - /components/ (ORGANIZED)
│   ├── ui/                       # 🆕 Renamed: Base UI components (web)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── native/                   # 🆕 Renamed: React Native components
│   │   ├── NexusButton.js
│   │   ├── NexusNavBar.js
│   │   ├── AnimatedButton.js
│   │   ├── FeedCard.js
│   │   └── ... (from /components (2)/)
│   │
│   ├── dashboard/                # Dashboard specific
│   │   ├── log-history.tsx
│   │   └── task-list.tsx
│   │
│   ├── goals/                    # Goal UI
│   │   ├── goal-wizard.tsx
│   │   └── template-gallery.tsx
│   │
│   ├── chat/                     # Chat interface
│   ├── recovery/                 # Recovery UI
│   ├── gamification/             # Gamification UI
│   ├── notifications/            # Notification UI
│   ├── reviews/                  # Reviews UI
│   ├── arc/                      # Archive UI
│   │
│   ├── providers.tsx             # Context providers
│   └── pwa-register.tsx          # PWA setup
│
├── 📱 MOBILE APP - React Native / Expo (PORT 19000)
│   ├── mobile/
│   │   ├── package.json          # Separate mobile dependencies
│   │   ├── app.json              # Expo config
│   │   ├── App.js                # Entry point
│   │   │
│   │   ├── screens/              # 🆕 Moved from root
│   │   │   ├── HomeScreen.js
│   │   │   ├── DiscoverScreen.js
│   │   │   ├── InboxScreen.js
│   │   │   ├── MissionScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── ... (all Nexus Social screens)
│   │   │
│   │   ├── navigation/            # 🆕 Moved from root
│   │   │   └── AppNavigator.js
│   │   │
│   │   ├── hooks/                # React Native hooks
│   │   │   └── useHaptics.js
│   │   │
│   │   ├── services/             # Mobile services
│   │   │   ├── firebase.js
│   │   │   ├── gemini.js
│   │   │   └── auth.js
│   │   │
│   │   └── public/               # Expo assets
│   │       └── manual-test-guide.html
│   │
│   └── android/                  # 🆕 Moved: Kotlin/Jetpack Compose
│       ├── build.gradle.kts      # (from /app2)
│       ├── proguard-rules.pro
│       └── src/
│           ├── main/
│           │   ├── AndroidManifest.xml
│           │   ├── java/         # Kotlin/Java code
│           │   └── res/          # Android resources
│           ├── test/
│           └── androidTest/
│
├── 🔌 MICROSERVICES - /services/
│   ├── chat/                     # 🆕 Moved: Socket.io Chat Server (PORT 3001)
│   │   ├── package.json          # (Firebase + Socket.io deps)
│   │   ├── server.js             # Main entry
│   │   ├── setup-admin.js        # Admin setup
│   │   ├── firebase.json         # Firestore config
│   │   ├── firestore.rules       # Security rules
│   │   └── public/               # Static assets
│   │
│   └── ...                       # Additional services can go here
│
├── 📖 DOCUMENTATION
│   ├── docs/
│   │   ├── README.md             # Technical docs
│   │   ├── BUILD_PHASES.md       # Development roadmap
│   │   ├── AI_PROMPTS.md         # Gemini prompt templates
│   │   ├── MERGER.md             # This file
│   │   │
│   │   ├── ARCHIVED/             # 🆕 Old files archived
│   │   │   ├── README (2).md
│   │   │   ├── README (3).md
│   │   │   ├── README (4).md
│   │   │   ├── doc.txt
│   │   │   └── result.txt
│   │   │
│   │   ├── API.md                # API documentation
│   │   ├── SETUP.md              # Setup guide
│   │   └── DEPLOYMENT.md         # Deployment guide
│   │
│   ├── README.md                 # ✨ MAIN: Project README (ComeBack.ai)
│   └── MERGER_ANALYSIS.md        # Conflict resolution doc
│
├── 📋 TYPE DEFINITIONS
│   └── types/
│       ├── index.ts              # Global types
│       ├── models.ts             # Data model types
│       ├── api.ts                # API types
│       └── ...
│
├── ⚙️ BUILD & GRADLE (for Android only)
│   ├── build.gradle.kts          # Android root config
│   ├── settings.gradle.kts       # Gradle settings
│   ├── gradle.properties         # Gradle properties
│   ├── gradle/                   # Gradle plugins
│   └── ...
│
└── 🔧 Development Files
    ├── .env.local               # Local env (from .env.example)
    ├── .gitignore               # Git exclusions
    ├── .git/                    # Git repository
    └── node_modules/            # Dependencies
```

---

## 🎯 Project Mapping

| Project | Location | Framework | Status |
|---------|----------|-----------|--------|
| **ComeBack.ai Web** | `/app` + `/lib` | Next.js 15 | ✅ Main app |
| **DePIN Marketplace** | `/app/marketplace` | Integrated in Next.js | ✅ Merged |
| **React Native** | `/mobile` | Expo 51 | ✅ Organized |
| **Nexus Social** | `/mobile/screens` | React Native | ✅ Merged into mobile |
| **Android Native** | `/mobile/android` | Kotlin/Compose | ✅ Reorganized |
| **Chat Server** | `/services/chat` | Socket.io/Express | ✅ Microservice |

---

## 🔄 Import Path Changes

### Before → After

```typescript
// Web Components
// Before: import { Button } from "@/components"
// After:  import { Button } from "@/components/ui"

// React Native Components
// Before: import NexusButton from "@/NexusButton"
// After:  import NexusButton from "@/components/native/NexusButton"

// Services
// Before: import authService from "@/services/authService"
// After:  import { authService } from "@/lib/services/auth"

// Database
// Before: import { firebase } from "@/services/firebase"
// After:  import { initFirebase } from "@/lib/db/firebase"

// AI
// Before: import gemini from "@/services/gemini"
// After:  import { generatePath } from "@/lib/ai/agents/goal-planner"

// Chat Server
// Before: import { server } from "@/chat/server"
// After:  import { server } from "@/services/chat"
```

---

## ✨ Key Improvements

✅ **Single source of truth** for dependencies and config  
✅ **Clear folder organization** - no duplicate names  
✅ **Unified database layer** - MongoDB + Firestore  
✅ **Centralized AI** - all Gemini calls go through `/lib/ai`  
✅ **Shared utilities** - auth, notifications, gamification centralized  
✅ **Modular services** - chat server is isolated but integrated  
✅ **Easy to run** - simple npm scripts for full stack  
✅ **Production-ready** - organized for scale and maintenance
