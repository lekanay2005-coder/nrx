import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  updateProfile 
} from 'firebase/auth';

const STORAGE_KEYS = {
  USER_SESSION: '@nexus_auth_user_session',
};

// Dynamic listener collection for instant updates
const listeners = new Set();
let cachedUserVal = undefined; // local state tracker

function notifyListeners(user) {
  cachedUserVal = user;
  listeners.forEach(fn => {
    try {
      fn(user);
    } catch (e) {
      console.warn("Auth listener notification failed:", e);
    }
  });
}

/**
 * Service to handle secure sign-in, account creation, and session state.
 * Implements real Firebase auth with responsive local persistence fallbacks.
 */
export const AuthService = {
  /**
   * Listen to active session changes. Handles both Firebase auth and simulated storage.
   */
  subscribeToAuthChanges: (onUserChanged) => {
    listeners.add(onUserChanged);

    // If we've already resolved a value, immediately invoke with it
    if (cachedUserVal !== undefined) {
      onUserChanged(cachedUserVal);
    } else {
      // Run initial check
      AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION).then(cached => {
        if (cached) {
          const parsedObj = JSON.parse(cached);
          cachedUserVal = parsedObj;
          onUserChanged(parsedObj);
        } else {
          cachedUserVal = null;
          onUserChanged(null);
        }
      }).catch(() => {
        cachedUserVal = null;
        onUserChanged(null);
      });
    }

    let firebaseUnsub = null;
    if (auth) {
      firebaseUnsub = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Goal Restarter',
            isSimulated: false,
          };
          await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(userObj));
          notifyListeners(userObj);
        } else {
          // If we had a firebase session, clear it.
          // If it was simulated, keep it unless specifically logged out
          if (cachedUserVal && !cachedUserVal.isSimulated) {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
            notifyListeners(null);
          }
        }
      });
    }

    return () => {
      listeners.delete(onUserChanged);
      if (firebaseUnsub) firebaseUnsub();
    };
  },

  /**
   * Sign in an existing user and retrieve their Firestore profile data
   */
  login: async (email, password) => {
    const trimmedEmail = email.trim();

    // Try firebase authentication if available and configured
    if (auth && !auth.config?.apiKey?.includes("FakeKey")) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const firebaseUser = userCredential.user;
        const userObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Goal Restarter',
          isSimulated: false,
          streak: 14,
          xp: 2450,
          reliability: 98,
        };

        // Load profile from Firestore if online and configured
        try {
          const { db } = require('./firebase');
          if (db) {
            const { doc, getDoc, setDoc } = require('firebase/firestore');
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              const remoteData = docSnap.data();
              Object.assign(userObj, remoteData);
            } else {
              // Create default profile document
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: userObj.displayName,
                streak: 14,
                xp: 2450,
                reliability: 98,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          }
        } catch (dbErr) {
          console.warn("Could not load/create Firestore profile during email login:", dbErr);
        }

        await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(userObj));
        notifyListeners(userObj);
        return { success: true, user: userObj };
      } catch (error) {
        console.warn("Firebase Auth failed:", error);
        return { success: false, error: getFriendlyErrorMessage(error.code || error.message) };
      }
    }

    // Sandbox/Local simulated authentication fallback
    console.log("[Auth Service] Sandbox Authentication context active.");
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    const simUser = {
      uid: 'sim_' + Math.floor(Math.random() * 1000000),
      email: trimmedEmail,
      displayName: trimmedEmail.split('@')[0],
      isSimulated: true,
      streak: 14,
      xp: 2450,
      reliability: 98,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(simUser));
    notifyListeners(simUser);
    return { success: true, user: simUser };
  },

  /**
   * Create a new user profile and initialize profile data in Firestore
   */
  signup: async (email, password, displayName) => {
    const trimmedEmail = email.trim();
    const trimmedVal = (displayName || '').trim();
    const finalName = trimmedVal || trimmedEmail.split('@')[0];

    // Try real firebase account registration if active of config
    if (auth && !auth.config?.apiKey?.includes("FakeKey")) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const firebaseUser = userCredential.user;
        
        // Update display name profile trigger
        try {
          await updateProfile(firebaseUser, { displayName: finalName });
        } catch (nameErr) {
          console.warn("Could not save display name profile metadata:", nameErr);
        }

        const userObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: finalName,
          isSimulated: false,
          streak: 14,
          xp: 2450,
          reliability: 98,
        };

        // Create profile document in Firestore
        try {
          const { db } = require('./firebase');
          if (db) {
            const { doc, setDoc } = require('firebase/firestore');
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: finalName,
              streak: 14,
              xp: 2450,
              reliability: 98,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        } catch (dbErr) {
          console.warn("Could not save profile in Firestore during email signup:", dbErr);
        }

        await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(userObj));
        notifyListeners(userObj);
        return { success: true, user: userObj };
      } catch (error) {
        return { success: false, error: getFriendlyErrorMessage(error.code || error.message) };
      }
    }

    // Sandbox/Local simulation fallback
    console.log("[Auth Service] Creating account in local database state simulator.");
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    const simUser = {
      uid: 'sim_' + Math.floor(Math.random() * 1000000),
      email: trimmedEmail,
      displayName: finalName,
      isSimulated: true,
      streak: 14,
      xp: 2450,
      reliability: 98,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(simUser));
    notifyListeners(simUser);
    return { success: true, user: simUser };
  },

  /**
   * Google Sign-In with Firebase Authentication or custom simulated accounts
   */
  loginWithGoogle: async (simulatedAccount = null) => {
    // If real Firebase environment is active, use standard popup/redirect authentication
    if (auth && !auth.config?.apiKey?.includes("FakeKey")) {
      try {
        const { GoogleAuthProvider, signInWithPopup } = require('firebase/auth');
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const firebaseUser = userCredential.user;
        
        const userObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Google Restarter',
          isSimulated: false,
          streak: 14,
          xp: 2450,
          reliability: 98,
        };

        // Load profile from Firestore or write default
        try {
          const { db } = require('./firebase');
          if (db) {
            const { doc, getDoc, setDoc } = require('firebase/firestore');
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              Object.assign(userObj, docSnap.data());
            } else {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: userObj.displayName,
                streak: 14,
                xp: 2450,
                reliability: 98,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          }
        } catch (dbErr) {
          console.warn("Could not handle Firestore profile during Google Sign-In:", dbErr);
        }

        await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(userObj));
        notifyListeners(userObj);
        return { success: true, user: userObj };
      } catch (error) {
        console.warn("Firebase Google Auth failed:", error);
        return { success: false, error: getFriendlyErrorMessage(error.code || error.message) };
      }
    }

    // In local sandbox simulation mode, check if we need to let user pick credentials
    if (!simulatedAccount) {
      return { success: true, isSimulatedOnly: true };
    }

    // Process Google account simulation
    console.log("[Auth Service] Google Sign-In Sandbox Login initiated for:", simulatedAccount.email);
    const simUserObj = {
      uid: 'google_sim_' + Math.floor(Math.random() * 1000000),
      email: simulatedAccount.email,
      displayName: simulatedAccount.displayName,
      isSimulated: true,
      streak: 14,
      xp: 2450,
      reliability: 98,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(simUserObj));
    notifyListeners(simUserObj);
    return { success: true, user: simUserObj };
  },

  /**
   * Update and save user profile data both in cache and Firestore
   */
  saveUserProfile: async (uid, profileData) => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      let sessionObj = cached ? JSON.parse(cached) : {};
      
      const updatedUser = {
        ...sessionObj,
        ...profileData,
        uid,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(updatedUser));
      notifyListeners(updatedUser);

      // Persist to Cloud Firestore if enabled
      if (!updatedUser.isSimulated) {
        const { db } = require('./firebase');
        if (db) {
          const { doc, setDoc } = require('firebase/firestore');
          const userDocRef = doc(db, 'users', uid);
          await setDoc(userDocRef, {
            uid,
            email: updatedUser.email || '',
            displayName: updatedUser.displayName || '',
            streak: updatedUser.streak || 14,
            xp: updatedUser.xp || 2450,
            reliability: updatedUser.reliability || 98,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          console.log("[AuthService] Firestore profile successfully merged.");
        }
      }
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Save User Profile Failed:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Terminate current user session
   */
  logout: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      if (auth) {
        await firebaseSignOut(auth);
      }
      notifyListeners(null);
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Maps raw system errors to human-friendly feedback banners.
 */
function getFriendlyErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address format is not structured correctly.';
    case 'auth/user-disabled':
      return 'This user login is suspended.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email address or password. Double-check and try again.';
    case 'auth/email-already-in-use':
      return 'This email is already linked to an existing account.';
    case 'auth/weak-password':
      return 'Security threshold not met: Password is too weak.';
    case 'auth/operation-not-allowed':
      return 'Email/Password registration is disabled in Atlas Console.';
    default:
      return code || 'An unexpected authentication exception transpired.';
  }
}
