
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];
const displayName = process.argv[3] || 'Admin';

if (!email) {
  console.error('Usage: node setup-admin.js <email> [displayName]');
  process.exit(1);
}

async function setupAdmin() {
  try {
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log('Updating existing user...');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('Creating new user...');
        userRecord = await admin.auth().createUser({
          email: email,
          displayName: displayName,
        });
      } else {
        throw error;
      }
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`✅ Successfully set admin privileges for ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
