# 📋 ComeBack.ai Merger - Implementation Checklist

## ✅ Phase 1: Documentation & Planning (COMPLETED)

- [x] Create merger analysis document (`MERGER_ANALYSIS.md`)
- [x] Design unified folder structure (`MERGER.md`)
- [x] Document conflicts and resolutions (`CONFLICTS_RESOLVED.md`)
- [x] Create unified package.json template (`package.json.unified`)
- [x] Create mobile package.json (`mobile/package.json`)
- [x] Create master .env.example (`.env.example`)
- [x] Create setup guide (`docs/SETUP.md`)
- [x] Plan all file operations

---

## 📁 Phase 2: Folder Reorganization (READY TO EXECUTE)

### Create New Directories
```bash
# Already created:
mkdir -p mobile
mkdir -p mobile/android
mkdir -p services/chat
mkdir -p app/marketplace
```

### Files to Move

**1. Move React Native App → Mobile**
```bash
# From root to /mobile/
mv App.js → mobile/App.js
mv app.json → mobile/app.json

# From root to /mobile/screens/
mkdir -p mobile/screens
# Move all screen files from /screens/ to /mobile/screens/

# From root to /mobile/navigation/
mkdir -p mobile/navigation
# Move all navigation files from /navigation/ to /mobile/navigation/

# From root to /mobile/hooks/
mkdir -p mobile/hooks
# Move /hooks/ to /mobile/hooks/

# Create /mobile/services/
mkdir -p mobile/services
# Move mobile-specific services to /mobile/services/
```

**2. Move Android App → Mobile/Android**
```bash
# From /app2/ to /mobile/android/
mv app2/* → mobile/android/
rm -rf app2/
```

**3. Move Chat Server → Services/Chat**
```bash
# From /chat/ to /services/chat/
mv chat/server.js → services/chat/server.js
mv chat/setup-admin.js → services/chat/setup-admin.js
mv chat/firebase.json → services/chat/firebase.json
mv chat/firestore.rules → services/chat/firestore.rules
mv chat/public/ → services/chat/public/
# Keep as reference: services/chat/package.json (old, for reference)
```

**4. Organize Components**
```bash
# Create organized structure
mkdir -p components/ui
mkdir -p components/native

# Rename existing components to ui:
# mv /components/* → /components/ui/
# (Keep folders: dashboard, goals, chat, gamification, notifications, recovery, reviews, arc)

# Rename components (2) to native:
# mv /components (2)/* → /components/native/
# (AnimatedButton.js, AnimatedPage.js, etc.)
```

**5. Move Marketplace Code → App/Marketplace**
```bash
# Move Vite marketplace source code
mkdir -p app/marketplace/src
# Move marketplace-specific src files from root /src/ → /app/marketplace/src/

# Create /app/marketplace/components/ if not exists
mkdir -p app/marketplace/components
```

**6. Organize Docs**
```bash
# Create archive for old docs
mkdir -p docs/ARCHIVED

# Move old docs
mv README\ \(2\).md → docs/ARCHIVED/
mv README\ \(3\).md → docs/ARCHIVED/
mv README\ \(4\).md → docs/ARCHIVED/
mv doc.txt → docs/ARCHIVED/
mv result.txt → docs/ARCHIVED/
mv metadata\ \(2\).json → docs/ARCHIVED/
```

---

## 🗑️ Phase 3: Cleanup (READY TO EXECUTE)

### Delete Duplicate/Obsolete Files
```bash
# Delete duplicate package files
rm package\ \(2\).json
rm package\ \(3\).json
rm package-lock\ \(2\).json
rm package-lock\ \(3\).json

# Delete duplicate config files
rm tsconfig\ \(2\).json
rm vite.config.ts          # Marketplace integrated into Next.js
rm index.html              # Vite artifact

# Delete debug/temp files
rm firebase-debug.log
rm -rf .next/              # Will regenerate

# Delete old folders (after moving contents)
rm -rf chat/               # Contents moved to services/chat/
rm -rf app2/               # Contents moved to mobile/android/
rm -rf screens/            # Contents moved to mobile/screens/
rm -rf navigation/         # Contents moved to mobile/navigation/
rm -rf hooks/              # Contents moved to mobile/hooks/
rm -rf components\ \(2\)/   # Contents moved to components/native/
```

---

## 📦 Phase 4: Configuration Updates (READY TO EXECUTE)

### Replace Root Package.json
```bash
# Backup current
cp package.json package.json.backup

# Replace with unified version
cp package.json.unified package.json
rm package.json.unified
```

### Verify New Structure
```bash
# Check key files exist
ls -la package.json            # Should be unified
ls -la mobile/package.json     # Mobile dependencies
ls -la .env.example            # Master env template
ls -la mobile/android/         # Android project
ls -la services/chat/          # Chat microservice
ls -la app/marketplace/        # Marketplace integrated
```

---

## 🔄 Phase 5: Import Path Updates (NEEDS MANUAL REVIEW)

### Files Requiring Import Updates

**Web App Components:**
```
grep -r "from '@/components'" app/ --include="*.tsx" --include="*.ts"
# Update to: from '@/components/ui'
```

**React Native Components:**
```
grep -r "import.*from.*NexusButton\|AnimatedButton\|FeedCard" mobile/ --include="*.js"
# Update to: from '@/components/native/...'
```

**Services:**
```
grep -r "from '@/services/" app/ lib/ --include="*.ts" --include="*.tsx"
# Update to: from '@/lib/services/'
```

**Chat Service:**
```
grep -r "from '@/chat" --include="*.ts" --include="*.tsx"
# Update to: from '@/services/chat'
```

### Commands to Find Imports
```bash
# Find all relative imports
grep -r "from ['\"]\./" /workspaces/nrx --include="*.ts" --include="*.tsx" --include="*.js"

# Find all @/ imports
grep -r "from ['\"]@/" /workspaces/nrx --include="*.ts" --include="*.tsx" --include="*.js"
```

---

## ✅ Phase 6: Verification

### After File Moves - Run Tests
```bash
# Install unified dependencies
npm install

# Install mobile dependencies
cd mobile && npm install && cd ..

# Test web build
npm run build:web

# Test Next.js dev server
npm run dev:web
# Should see: ▲ Next.js 15.2.1

# Test chat server
npm run dev:chat
# Should see: listening on port 3001

# Test mobile (if setup)
cd mobile && npm start
# Should see: Expo CLI ready

# Test Android (if Android Studio available)
cd mobile/android && ./gradlew build
```

### File Structure Verification Checklist
- [ ] `package.json` at root (unified)
- [ ] `package.json` in `/mobile/` (React Native)
- [ ] `.env.example` at root with all env vars
- [ ] `/mobile/screens/` exists with all screens
- [ ] `/mobile/android/` has build.gradle.kts
- [ ] `/services/chat/` has server.js
- [ ] `/components/ui/` has web components
- [ ] `/components/native/` has RN components
- [ ] `/app/marketplace/` exists
- [ ] `/lib/` has ai/, auth/, db/, services/, gamification/, recovery/
- [ ] `/docs/ARCHIVED/` has old files
- [ ] Old folders deleted: `/app2/`, `/chat/`, `/screens/`, `/navigation/`, `/hooks/`, `/components (2)/`
- [ ] Old config files deleted: `tsconfig (2).json`, `vite.config.ts`

---

## 📊 Complete File Mapping

```
MOVED TO:
├── mobile/
│   ├── App.js                  (from root)
│   ├── app.json                (from root)
│   ├── package.json            (created)
│   ├── screens/                (from /screens/)
│   ├── navigation/             (from /navigation/)
│   ├── hooks/useHaptics.js     (from /hooks/)
│   └── android/                (from /app2/)
│
├── services/chat/
│   ├── server.js               (from /chat/)
│   ├── setup-admin.js          (from /chat/)
│   ├── firebase.json           (from /chat/)
│   ├── firestore.rules         (from /chat/)
│   └── public/                 (from /chat/public/)
│
├── components/
│   ├── ui/                     (from /components/)
│   └── native/                 (from /components (2)/)
│
├── app/marketplace/            (from /src/ Vite code)
│
└── docs/ARCHIVED/
    ├── README (2).md
    ├── README (3).md
    ├── README (4).md
    ├── doc.txt
    ├── result.txt
    └── metadata (2).json

DELETED:
├── package (2).json            ❌
├── package (3).json            ❌
├── package-lock (2).json       ❌
├── package-lock (3).json       ❌
├── tsconfig (2).json           ❌
├── vite.config.ts              ❌
├── index.html                  ❌
├── firebase-debug.log          ❌
├── chat/                        ❌ (moved to services/chat/)
├── app2/                        ❌ (moved to mobile/android/)
├── screens/                     ❌ (moved to mobile/screens/)
├── navigation/                  ❌ (moved to mobile/navigation/)
├── hooks/                       ❌ (moved to mobile/hooks/)
└── components (2)/             ❌ (moved to components/native/)

CREATED:
├── mobile/package.json         ✨
├── app/marketplace/            ✨
├── services/chat/              ✨
├── components/ui/              ✨
├── components/native/          ✨
├── docs/ARCHIVED/              ✨
└── .env.example                ✨ (new master env)
```

---

## 🚀 Commands to Execute (In Order)

```bash
# 1. Backup current state
git checkout -b merger/unify-codebase

# 2. Replace package.json
cp package.json.unified package.json

# 3. Create directories
mkdir -p mobile/android services/chat app/marketplace
mkdir -p components/ui components/native docs/ARCHIVED

# 4. Move files (use platform-specific commands)
# Windows/Mac/Linux: Use file manager or individual mv commands

# 5. Delete obsolete files
rm package\ \(2\).json package\ \(3\).json package-lock\ \(2\).json package-lock\ \(3\).json
rm tsconfig\ \(2\).json vite.config.ts index.html firebase-debug.log
rm -rf chat app2 screens navigation hooks components\ \(2\)/ src

# 6. Install dependencies
npm install
cd mobile && npm install && cd ..

# 7. Verify build
npm run build:web
npm run dev:web  # Test local
```

---

## 📝 Import Path Migration (Examples)

### Before → After

**Web Components:**
```typescript
// BEFORE
import { Button } from '@/components'
import { Card } from '@/components'

// AFTER
import { Button } from '@/components/ui'
import { Card } from '@/components/ui'
```

**Services:**
```typescript
// BEFORE
import { goalService } from '@/services/goalService'

// AFTER
import { goalService } from '@/lib/services/goal'
```

**Database:**
```typescript
// BEFORE
import { firebase } from '@/services/firebase'

// AFTER
import { initFirebase } from '@/lib/db/firebase'
```

**Chat:**
```typescript
// BEFORE
import { chat } from '@/chat'

// AFTER
import { server } from '@/services/chat'
```

---

## ✨ Final Verification

Run this command to verify the new structure:
```bash
tree -L 2 -a > /tmp/tree-structure.txt
cat /tmp/tree-structure.txt
```

Expected output shows all folders and files in the correct hierarchy.

---

## 🎯 Success Criteria

✅ All files organized in new structure  
✅ Single `package.json` at root  
✅ Single `package.json` in `/mobile/`  
✅ All imports updated and building  
✅ `npm run dev:web` works  
✅ `npm run dev:chat` works  
✅ `npm run dev:mobile` works  
✅ No build errors  
✅ Git history preserved (via branch)  

---

**Ready to merge! 🚀**
