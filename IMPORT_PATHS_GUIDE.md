# ComeBack.ai - Import Path Updates

## Critical Import Path Changes

After reorganization, these paths need updating throughout the codebase:

### 1. Component Imports

**Before:**
```typescript
import { Button } from '@/components'
import NexusButton from '@/components/NexusButton'
```

**After:**
```typescript
// Web components (in /app and /lib)
import { Button } from '@/components/ui'

// React Native components (in /mobile)
import NexusButton from '@/components/native/NexusButton'
```

### 2. Service Imports

**Before:**
```typescript
import { goalService } from '@/services/goalService'
import { firebase } from '@/services/firebase'
import { chatServer } from '@/chat'
```

**After:**
```typescript
// Business services
import { goalService } from '@/lib/services/goal'
import { taskService } from '@/lib/services/task'

// Database
import { initFirebase } from '@/lib/db/firebase'

// Chat microservice
import { server } from '@/services/chat'
```

### 3. Utility Imports

**Before:**
```typescript
import { sendNotification } from '@/services/notifications'
import { authMiddleware } from '@/services/auth'
```

**After:**
```typescript
// Notifications
import { sendNotification } from '@/lib/notifications'

// Auth
import { authMiddleware } from '@/lib/auth/middleware'
```

### 4. Hook Imports (Mobile)

**Before:**
```typescript
import { useHaptics } from '@/hooks/useHaptics'
```

**After:**
```typescript
// Mobile hooks
import { useHaptics } from '@/mobile/hooks/useHaptics'
```

### 5. Screen Imports (Mobile)

**Before:**
```typescript
import HomeScreen from '@/screens/HomeScreen'
import { AppNavigator } from '@/navigation/AppNavigator'
```

**After:**
```typescript
// Mobile screens (from mobile app root)
import HomeScreen from './screens/HomeScreen'
import { AppNavigator } from './navigation/AppNavigator'

// Or from parent
import HomeScreen from '@/mobile/screens/HomeScreen'
import { AppNavigator } from '@/mobile/navigation/AppNavigator'
```

### 6. API Route Imports (Web)

**Before:**
```typescript
import { handler as goalsHandler } from '@/app/api/goals/route'
```

**After (no change):**
```typescript
import { handler as goalsHandler } from '@/app/api/goals/route'
```

### 7. Type Imports

**Before/After (no change):**
```typescript
import { Goal, Task, User } from '@/types'
```

---

## Files to Update

### Critical Files (Web App)

1. **`/app/layout.tsx`** - Provider imports
2. **`/app/page.tsx`** - Component imports
3. **`/middleware.ts`** - Auth import paths
4. **`/app/api/goals/route.ts`** - Service imports
5. **`/app/api/recovery/route.ts`** - AI service imports
6. **`/lib/services/` files** - Internal imports
7. **`/components/ui/` files** - No changes needed (isolated)

### Mobile App Files

1. **`/mobile/App.js`** - Navigation imports
2. **`/mobile/screens/HomeScreen.js`** - Service/component imports
3. **`/mobile/navigation/AppNavigator.js`** - Screen imports

### Server Files

1. **`/services/chat/server.js`** - Firebase imports
2. **`/next.config.ts`** - Path alias updates (if needed)

---

## Path Alias Configuration

### Current tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["./app/*"],
      "@/lib/*": ["./lib/*"],
      "@/components/*": ["./components/*"],
      "@/services/*": ["./services/*"]
    }
  }
}
```

These are already correct!  No changes needed to tsconfig.

---

## Migration Strategy

### Step 1: Update Service Layer

Focus on `/lib/` files first (they don't depend on UI):

```bash
# In /lib/ files, update imports to use absolute paths
# Examples:
# import { db } from '@/lib/db'
# import { sendNotification } from '@/lib/notifications'
```

### Step 2: Update Component Imports

In web components:
```bash
# Replace: import X from '@/components'
# With:    import X from '@/components/ui'
```

### Step 3: Update Mobile Imports

In mobile files:
```bash
# Use relative imports for local files
# import X from './screens/...'
# OR use absolute paths from mobile root
```

### Step 4: Verify Builds

```bash
npm run build:web    # Test Next.js build
npm run dev:web      # Test local dev
```

---

## Common Mistakes to Avoid

❌ **Don't do this:**
```typescript
import { Button } from '@/components'  // Wrong - ambiguous
import { Button } from '../components'  // Wrong - fragile relative paths
```

✅ **Do this:**
```typescript
import { Button } from '@/components/ui'  // Clear and explicit
import NexusButton from '@/components/native/NexusButton'  // Explicit for mobile
```

---

## Automated Find/Replace Commands

If you have a tool that supports regex find/replace:

### Replace 1: Button import
```
Find:    from ['"]@/components['"]
Replace: from '@/components/ui'
```

### Replace 2: Services
```
Find:    from ['"]@/services/([^'"]*)['"]
Replace: from '@/lib/services/$1'
```

### Replace 3: Chat import
```
Find:    from ['"]@/chat['"]
Replace: from '@/services/chat'
```

---

## Completion Checklist

- [ ] Updated `/lib/` imports
- [ ] Updated web component imports
- [ ] Updated API route imports
- [ ] Updated mobile screen imports
- [ ] Updated middleware imports
- [ ] Updated chat server imports
- [ ] Verified `/next.config.ts` path aliases
- [ ] Ran `npm run build:web` successfully
- [ ] Ran `npm run dev:web` successfully
- [ ] All imports resolve without errors
