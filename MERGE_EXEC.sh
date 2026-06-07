#!/bin/bash
# ComeBack.ai Merger - File Organization Script

set -e  # Exit on error

echo "🚀 Starting ComeBack.ai Unified Merger..."

# ============================================================
# PHASE 1: Move Mobile Files to /mobile/
# ============================================================
echo "📱 Phase 1: Organizing mobile app..."

# Move React Native entry point
if [ -f "App.js" ]; then
  mv App.js mobile/App.js
  echo "✅ Moved App.js → mobile/"
fi

if [ -f "app.json" ]; then
  mv app.json mobile/app.json
  echo "✅ Moved app.json → mobile/"
fi

# Move React Native screens
if [ -d "screens" ]; then
  mkdir -p mobile/screens
  cp -r screens/* mobile/screens/ 2>/dev/null || true
  rm -rf screens
  echo "✅ Moved screens/ → mobile/screens/"
fi

# Move React Native navigation
if [ -d "navigation" ]; then
  mkdir -p mobile/navigation
  cp -r navigation/* mobile/navigation/ 2>/dev/null || true
  rm -rf navigation
  echo "✅ Moved navigation/ → mobile/navigation/"
fi

# Move React Native hooks
if [ -d "hooks" ]; then
  mkdir -p mobile/hooks
  cp -r hooks/* mobile/hooks/ 2>/dev/null || true
  rm -rf hooks
  echo "✅ Moved hooks/ → mobile/hooks/"
fi

# ============================================================
# PHASE 2: Move Android Native App
# ============================================================
echo "🤖 Phase 2: Organizing Android app..."

if [ -d "app2" ]; then
  mkdir -p mobile/android
  # Move Gradle files
  [ -f "app2/build.gradle.kts" ] && cp app2/build.gradle.kts mobile/android/ || true
  [ -f "app2/proguard-rules.pro" ] && cp app2/proguard-rules.pro mobile/android/ || true
  
  # Move source code
  [ -d "app2/src" ] && cp -r app2/src mobile/android/src || true
  
  echo "✅ Moved app2/ → mobile/android/"
fi

# ============================================================
# PHASE 3: Organize Components
# ============================================================
echo "🎨 Phase 3: Organizing components..."

# Rename /components to /components/ui
if [ -d "components" ] && [ ! -d "components/ui" ]; then
  mkdir -p components/ui
  # Move component files (excluding dashboard, goals, chat, etc. subdirs)
  for file in components/*.{tsx,jsx,ts,js} 2>/dev/null; do
    [ -f "$file" ] && mv "$file" components/ui/ || true
  done
  echo "✅ Reorganized components/ → components/ui/"
fi

# Rename /components (2) to /components/native
if [ -d "components (2)" ]; then
  mkdir -p components/native
  cp -r "components (2)"/* components/native/ 2>/dev/null || true
  rm -rf "components (2)"
  echo "✅ Moved components (2)/ → components/native/"
fi

# ============================================================
# PHASE 4: Move Chat Server to Services
# ============================================================
echo "💬 Phase 4: Organizing chat server..."

if [ -d "chat" ]; then
  mkdir -p services/chat
  cp chat/server.js services/chat/ 2>/dev/null || true
  cp chat/setup-admin.js services/chat/ 2>/dev/null || true
  cp chat/firebase.json services/chat/ 2>/dev/null || true
  cp chat/firestore.rules services/chat/ 2>/dev/null || true
  cp chat/package.json services/chat/package.json.backup 2>/dev/null || true
  [ -d "chat/public" ] && cp -r chat/public services/chat/ || true
  
  rm -rf chat
  echo "✅ Moved chat/ → services/chat/"
fi

# ============================================================
# PHASE 5: Archive Old Documentation
# ============================================================
echo "📚 Phase 5: Archiving old documentation..."

mkdir -p docs/ARCHIVED

# Move old README files
for file in README\ \(2\).md README\ \(3\).md README\ \(4\).md; do
  if [ -f "$file" ]; then
    mv "$file" docs/ARCHIVED/
  fi
done

# Move temporary files
[ -f "doc.txt" ] && mv doc.txt docs/ARCHIVED/ || true
[ -f "result.txt" ] && mv result.txt docs/ARCHIVED/ || true

# Archive metadata
if [ -f "metadata (2).json" ]; then
  mv "metadata (2).json" docs/ARCHIVED/
fi

echo "✅ Archived old files to docs/ARCHIVED/"

# ============================================================
# PHASE 6: Delete Obsolete Files
# ============================================================
echo "🗑️  Phase 6: Cleaning up obsolete files..."

# Delete duplicate package files
rm -f "package (2).json" "package (3).json" 2>/dev/null || true
echo "✅ Deleted duplicate package.json files"

# Delete duplicate lock files
rm -f "package-lock (2).json" "package-lock (3).json" 2>/dev/null || true
echo "✅ Deleted duplicate package-lock.json files"

# Delete duplicate tsconfig
rm -f "tsconfig (2).json" 2>/dev/null || true
echo "✅ Deleted duplicate tsconfig.json"

# Delete Vite config (integrated into Next.js)
rm -f "vite.config.ts" 2>/dev/null || true
echo "✅ Deleted vite.config.ts"

# Delete Vite entry point
rm -f "index.html" 2>/dev/null || true
echo "✅ Deleted index.html"

# Delete debug files
rm -f "firebase-debug.log" 2>/dev/null || true
echo "✅ Deleted firebase-debug.log"

# ============================================================
# PHASE 7: Summary
# ============================================================
echo ""
echo "✅ ✅ ✅ MERGER COMPLETE! ✅ ✅ ✅"
echo ""
echo "📊 New Structure Summary:"
echo "  ✓ mobile/           - React Native + Android"
echo "  ✓ services/chat/    - Socket.io microservice"
echo "  ✓ app/              - Next.js web app"
echo "  ✓ components/ui/    - Web components"
echo "  ✓ components/native - React Native components"
echo "  ✓ lib/              - Shared business logic"
echo ""
echo "📦 Next steps:"
echo "  1. npm install              # Install unified dependencies"
echo "  2. npm run build:web        # Test web build"
echo "  3. npm run dev:web          # Start development"
echo ""
