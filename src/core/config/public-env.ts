const DEFAULTS = {
  apiBaseUrl: 'https://api.qabile.com',
  googleClientId: '310722452133-6i01jlb6adl7aana4tub9iuc1qt4efds.apps.googleusercontent.com',
  firebase: {
    apiKey: 'AIzaSyAHwv2b0rYcRoIkthpPMRKNHPAG91H5KkY',
    authDomain: 'qabile.firebaseapp.com',
    projectId: 'qabile',
    storageBucket: 'qabile.firebasestorage.app',
    messagingSenderId: '633527158445',
    appId: '1:633527158445:web:9fe7ff6a983a7f6444a824',
    vapidKey:
      'BNlHZhyEDTKhmrdb0ljNoC9ujFY8bBpjg3kGtR2J60VgYUmsSnbRhUjSyupc8lspYQxZ1E808F64Ud-PxVTVLTc',
  },
} as const;

function read(value: string | undefined, fallback: string): string {
  return (value ?? '').trim() || fallback;
}

export const publicEnv = {
  apiBaseUrl: read(process.env.NEXT_PUBLIC_API_BASE_URL, DEFAULTS.apiBaseUrl),
  googleClientId: read(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, DEFAULTS.googleClientId),
};

export interface FirebaseMessagingConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

export function getFirebaseConfig(): FirebaseMessagingConfig {
  return {
    apiKey: read(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, DEFAULTS.firebase.apiKey),
    authDomain: read(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, DEFAULTS.firebase.authDomain),
    projectId: read(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, DEFAULTS.firebase.projectId),
    storageBucket: read(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      DEFAULTS.firebase.storageBucket,
    ),
    messagingSenderId: read(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      DEFAULTS.firebase.messagingSenderId,
    ),
    appId: read(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, DEFAULTS.firebase.appId),
    vapidKey: read(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, DEFAULTS.firebase.vapidKey),
  };
}
