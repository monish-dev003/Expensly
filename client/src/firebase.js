import { initializeApp }                       from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

let app, auth, googleProvider;

try {
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    app            = initializeApp(firebaseConfig);
    auth           = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  }
} catch (e) {
  console.warn('Firebase init failed:', e.message);
}

export const isFirebaseEnabled = () => !!auth;

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) throw new Error('Firebase not configured.');
  const result = await signInWithPopup(auth, googleProvider);
  return result.user.getIdToken();
};

export const setupRecaptcha = (containerId) => {
  if (!auth) throw new Error('Firebase not configured.');
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
};

export const sendOTP = async (phoneNumber, appVerifier) => {
  if (!auth) throw new Error('Firebase not configured.');
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

export const firebaseSignOut = async () => {
  if (auth) await signOut(auth);
};

export { auth };
