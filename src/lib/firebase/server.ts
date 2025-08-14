// src/lib/firebase/server.ts
import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

let app: admin.app.App;

// Create a new function to get the initialized app
const getFirebaseAdminApp = (): admin.app.App => {
  if (admin.apps.length > 0 && app) {
    return app;
  }

  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  // Check if credentials are provided
  if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    console.warn("Firebase Admin credentials not provided in .env. Server-side Firebase features will be disabled.");
    // Return a dummy object if not initialized to avoid hard crashes
    return { name: 'mock-app', options: {} } as admin.app.App; 
  }

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
    return app;
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
    throw new Error('Failed to initialize Firebase Admin SDK. Please check your service account credentials.');
  }
};


// Conditionally initialize and export services
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;

try {
  const initializedApp = getFirebaseAdminApp();
  // Only initialize services if the app is not the mock app
  if (initializedApp.name !== 'mock-app') {
    adminAuth = initializedApp.auth();
    adminDb = initializedApp.firestore();
    adminStorage = initializedApp.storage();
  }
} catch (e) {
  // Errors are already logged in getFirebaseAdminApp
}


export { adminAuth, adminDb, adminStorage };
