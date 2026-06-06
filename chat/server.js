
const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

admin.initializeApp();

const app = express();

// Security & middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

const db = admin.firestore();

// Auth endpoints are now handled by Firebase Authentication on the client-side

app.get('/users', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/history/:room', async (req, res) => {
    const room = req.params.room;
    try {
        const messagesSnapshot = await db.collection('rooms').doc(room).collection('messages').orderBy('ts').limit(200).get();
        const messages = [];
        messagesSnapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

exports.app = functions.https.onRequest(app);

exports.onMessageSent = functions.firestore.document('/rooms/{roomId}/messages/{messageId}')
    .onCreate((snap, context) => {
        console.log('New message', snap.data());
        return null;
    });

exports.onUserCreated = functions.auth.user().onCreate((user) => {
  return db.collection('users').doc(user.uid).set({
    displayName: user.displayName,
    email: user.email,
  });
});

exports.onUserDeleted = functions.auth.user().onDelete((user) => {
  return db.collection('users').doc(user.uid).delete();
});

exports.deleteRoomHistory = functions.https.onCall(async (data, context) => {
    // Make sure the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to delete room history.');
    }

    const roomName = data.roomName;
    if (typeof roomName !== 'string' || roomName.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "roomName" argument.');
    }

    const roomRef = db.collection('rooms').doc(roomName);
    const messagesRef = roomRef.collection('messages');

    // Delete all messages in a batch
    const querySnapshot = await messagesRef.get();
    const batch = db.batch();
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // After deleting messages, delete the room document itself
    await roomRef.delete();

    return { success: true, message: `History for room "${roomName}" has been successfully deleted.` };
});
