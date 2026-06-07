# 🔍 DIAGNOSTIC CHECKLIST: Import Path Issues to Fix

**Status:** Ready for Import Path Migration  
**Priority:** HIGH - Must complete before builds work

---

## 📍 Critical Import Paths Requiring Updates

### Web App Imports (Next.js)

**File: `/middleware.ts`**
```typescript
// Current (likely):
import { verifyAuth } from '@/services/auth'

// Should be:
import { verifyAuth } from '@/lib/auth/middleware'
```

**File: `/app/layout.tsx`**
```typescript
// Current (likely):
import { Button } from '@/components'
import { Providers } from '@/components/providers'

// Should be:
import { Button } from '@/components/ui'
import { Providers } from '@/components/providers'
```

**File: `/app/page.tsx`**
```typescript
// Current (likely):
import { DashboardComponent } from '@/components'
import { goalService } from '@/services/goalService'

// Should be:
import { DashboardComponent } from '@/components/ui/dashboard'
import { goalService } from '@/lib/services'
```

**File: `/app/api/goals/route.ts`** (and other API routes)
```typescript
// Current (likely):
import { goalService } from '@/services'
import { firebase } from '@/services/firebase'

// Should be:
import { goalService } from '@/lib/services'
import { initFirebase } from '@/lib/db/firebase'
```

**File: `/app/api/recovery/route.ts`**
```typescript
// Current (likely):
import { recoveryEngine } from '@/services/recovery'
import { gemini } from '@/services/gemini'

// Should be:
import { recoveryEngine } from '@/lib/recovery'
import { geminiClient } from '@/lib/ai'
```

### Mobile App Imports (React Native)

**File: `/mobile/App.js`** ✅ ALREADY FIXED

**File: `/mobile/screens/HomeScreen.js`** (when moved)
```javascript
// Current (likely):
import { useHaptics } from '@/hooks/useHaptics'
import NexusButton from '@/components/NexusButton'

// Should be:
import { useHaptics } from '../hooks/useHaptics'  // Relative
import NexusButton from '../components/NexusButton'  // Relative
```

**File: `/mobile/navigation/AppNavigator.js`** (when moved)
```javascript
// Current (likely):
import HomeScreen from '@/screens/HomeScreen'
import { useAuth } from '@/services/auth'

// Should be:
import HomeScreen from '../screens/HomeScreen'  // Relative
import { useAuth } from '../services/auth'  // Relative or from lib
```

### Service Layer Imports (Shared)

**File: `/lib/services.ts`**
```typescript
// Current (likely):
import { db } from '@/services/firebase'
import { auth } from '@/services/auth'

// Should be:
import { db } from '@/lib/db/firebase'
import { auth } from '@/lib/auth'
```

**File: `/lib/recovery/index.ts`**
```typescript
// Current (likely):
import { gemini } from '@/services/gemini'
import { notificationService } from '@/services/notifications'

// Should be:
import { geminiClient } from '@/lib/ai'
import { sendNotification } from '@/lib/notifications'
```

**File: `/lib/gamification/index.ts`**
```typescript
// Current (likely):
import { db } from '@/services/firebase'

// Should be:
import { db } from '@/lib/db/firebase'
```

### Chat Server Imports (Will move to `/services/chat/`)

**File: `/chat/server.js`** → `/services/chat/server.js`
```javascript
// Current (likely):
const firebase = require('@/services/firebase')
const { notificationService } = require('@/services/notifications')

// Should be:
const firebase = require('../../lib/db/firebase')
const { sendNotification } = require('../../lib/notifications')

// OR use absolute paths if configured
const firebase = require('@/lib/db/firebase')
const { sendNotification } = require('@/lib/notifications')
```

---

## 🔧 Import Path Migration Patterns

### Pattern 1: Component Imports

**Web Components:**
```typescript
❌ from '@/components'
✅ from '@/components/ui'

❌ from '@/components/dashboard'
✅ from '@/components/ui/dashboard'

❌ from '@/components (2)/NexusButton'
✅ from '@/components/native/NexusButton'
```

**Mobile Components:**
```javascript
❌ from '@/components'
✅ from '../components'

❌ from '@/components/native'
✅ from '../components'
```

### Pattern 2: Service Imports

```typescript
❌ from '@/services/firebase'
✅ from '@/lib/db/firebase'

❌ from '@/services/auth'
✅ from '@/lib/auth'

❌ from '@/services/recovery'
✅ from '@/lib/recovery'

❌ from '@/services/notifications'
✅ from '@/lib/notifications'

❌ from '@/services/gamification'
✅ from '@/lib/gamification'

❌ from '@/services/analytics'
✅ from '@/lib/analytics'
```

### Pattern 3: Chat Service

```typescript
❌ from '@/chat'
❌ from '@/services/chat' (old location)
✅ from '@/services/chat' (new location after move)
```

### Pattern 4: Database Imports

```typescript
❌ import firebase from '@/services/firebase'
❌ import { db, auth } from '@/services/firebase'
✅ import { db, auth } from '@/lib/db/firebase'
```

### Pattern 5: Utility Imports (No change needed)

```typescript
✅ from '@/lib/utils'
✅ from '@/lib/path-utils'
✅ from '@/lib/templates'
✅ from '@/types'
```

---

## 📋 Files to Check & Update

### HIGH PRIORITY (Web App - Update First)

- [ ] `/middleware.ts` - Auth imports
- [ ] `/app/layout.tsx` - Component imports
- [ ] `/app/page.tsx` - Dashboard imports
- [ ] `/app/api/goals/route.ts` - Service imports
- [ ] `/app/api/recovery/route.ts` - AI service imports
- [ ] `/lib/services.ts` - Internal service imports
- [ ] `/lib/recovery/index.ts` - Recovery engine imports
- [ ] `/lib/gamification/index.ts` - Gamification imports

### MEDIUM PRIORITY (After Files Move)

- [ ] `/mobile/screens/HomeScreen.js` → Mobile path updates
- [ ] `/mobile/screens/ProfileScreen.js` → Mobile path updates
- [ ] `/mobile/screens/DiscoverScreen.js` → Mobile path updates
- [ ] `/mobile/screens/AuthScreen.js` → Mobile path updates
- [ ] `/mobile/screens/MissionScreen.js` → Mobile path updates
- [ ] `/mobile/screens/InboxScreen.js` → Mobile path updates
- [ ] `/mobile/screens/ConnectScreen.js` → Mobile path updates
- [ ] `/mobile/navigation/AppNavigator.js` → Screen imports

### LOW PRIORITY (Server - Update Last)

- [ ] `/services/chat/server.js` → Service imports (when moved)
- [ ] `/services/chat/setup-admin.js` → Service imports (when moved)

---

## 🧪 Testing Import Fixes

### Quick Verification Commands

```bash
# Check if imports resolve (run after updates)
npm run build:web

# Show any import errors
npm run lint

# Check TypeScript errors
npx tsc --noEmit

# Find remaining import issues
grep -r "@/services/firebase" --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "@/services/auth" --include="*.ts" --include="*.tsx"
grep -r "@/components\"" --include="*.ts" --include="*.tsx"  # Ambiguous component imports
```

---

## ✅ Completion Checklist

### Phase 1: Web Imports (Must Complete First)
- [ ] middleware.ts fixed
- [ ] app/layout.tsx fixed
- [ ] app/page.tsx fixed
- [ ] API routes fixed (at least 3 routes)
- [ ] lib/services.ts fixed
- [ ] lib/recovery/index.ts fixed
- [ ] lib/gamification/index.ts fixed
- [ ] npm run build:web passes
- [ ] No TypeScript errors

### Phase 2: Mobile Imports (After Files Move)
- [ ] mobile/screens/* fixed
- [ ] mobile/navigation/* fixed
- [ ] All relative paths working
- [ ] Mobile app can start

### Phase 3: Service Imports (After Files Move)
- [ ] services/chat/server.js fixed
- [ ] Chat server can start
- [ ] Socket.io connections work

### Phase 4: Verification
- [ ] npm run build:web ✅
- [ ] npm run dev:web ✅ (runs on port 3000)
- [ ] npm run dev:chat ✅ (runs on port 3001)
- [ ] npm run dev:mobile ✅ (Expo on 19000)
- [ ] No import errors anywhere

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module '@/components'"
```
Error: Cannot find module '@/components' from '/workspaces/nrx/app/page.tsx'
```
**Solution:** Update to `'@/components/ui'` instead

**Fix Pattern:**
```bash
grep -r "from '@/components'" app/
grep -r 'from "@/components"' app/

# Replace:
sed -i "s|from '@/components'|from '@/components/ui'|g" app/**/*.tsx
sed -i 's|from "@/components"|from "@/components/ui"|g' app/**/*.tsx
```

### Issue: "Cannot find module '@/services/firebase'"
```
Error: Cannot find module '@/services/firebase' from '/workspaces/nrx/middleware.ts'
```
**Solution:** Update to `'@/lib/db/firebase'`

**Fix Pattern:**
```bash
sed -i "s|from '@/services/firebase'|from '@/lib/db/firebase'|g" **/*.ts
sed -i "s|from '@/services/firebase'|from '@/lib/db/firebase'|g" **/*.tsx
```

### Issue: "Cannot find module '@/services/auth'"
```
Error: Cannot find module '@/services/auth' from '/workspaces/nrx/middleware.ts'
```
**Solution:** Update to `'@/lib/auth'` or `'@/lib/auth/middleware'`

---

## 💾 Automated Fix Script (Optional)

```bash
#!/bin/bash
# Fix common import paths

echo "🔄 Fixing import paths..."

# Web components
find app lib -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|from '@/components'|from '@/components/ui'|g"

# Firebase imports
find app lib services -name "*.ts" -o -name "*.tsx" -o -name "*.js" | xargs sed -i "s|from '@/services/firebase'|from '@/lib/db/firebase'|g"

# Auth imports
find app lib services -name "*.ts" -o -name "*.tsx" -o -name "*.js" | xargs sed -i "s|from '@/services/auth'|from '@/lib/auth'|g"

# Chat imports
find app lib -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|from '@/chat'|from '@/services/chat'|g"

echo "✅ Import paths fixed!"
```

---

## 🎯 Recommended Execution Order

1. **FIRST:** Read this file completely
2. **SECOND:** Update HIGH PRIORITY files (web imports)
3. **THIRD:** Run `npm run build:web` and fix any remaining errors
4. **FOURTH:** Move files (if not already done)
5. **FIFTH:** Update MEDIUM PRIORITY files (mobile imports)
6. **SIXTH:** Update LOW PRIORITY files (server imports)
7. **FINALLY:** Verify all builds work

---

## 📞 If You Get Stuck

**Error:** Import not found  
**Solution:** Check if the file exists in the new location using:
```bash
find . -name "firebase.ts" -o -name "firebase.js"
find . -name "recovery" -type d
```

**Error:** Path doesn't resolve  
**Solution:** Check tsconfig.json paths:
```bash
cat tsconfig.json | grep -A 5 paths
```

**Error:** Circular dependency  
**Solution:** Ensure `/lib/` files don't import from `/app/`

---

**Status: Ready for Import Path Migration 🚀**

Use this guide + IMPORT_PATHS_GUIDE.md to complete the merger!
