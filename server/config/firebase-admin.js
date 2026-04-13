const admin = require('firebase-admin');

let initialized = false;

const getAdmin = () => {
  if (initialized) return admin;

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (!b64) {
    console.warn('⚠️  Firebase Admin not configured — Google auth disabled.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
    console.log('✅ Firebase Admin initialized');
    return admin;
  } catch (err) {
    console.error('❌ Firebase Admin init error:', err.message);
    return null;
  }
};

module.exports = { getAdmin };