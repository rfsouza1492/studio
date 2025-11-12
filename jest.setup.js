// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Set test environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
process.env.NODE_ENV = 'test'

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: false,
  })),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: false,
  })),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    app: { name: '[DEFAULT]' },
  })),
  setPersistence: jest.fn(() => Promise.resolve()),
  browserLocalPersistence: 'local',
  signInWithPopup: jest.fn(() => Promise.resolve({
    user: { uid: 'test-user-id' },
  })),
  signInWithRedirect: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()), // Returns unsubscribe function
  GoogleAuthProvider: jest.fn(),
  getRedirectResult: jest.fn(() => Promise.resolve(null)),
  credentialFromResult: jest.fn(() => ({ accessToken: 'test-token' })),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({
    app: { name: '[DEFAULT]' },
    type: 'firestore',
  })),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  collectionGroup: jest.fn(),
  getDocs: jest.fn(),
  writeBatch: jest.fn(() => ({
    commit: jest.fn(() => Promise.resolve()),
    delete: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
  })),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    keys: jest.fn(() => []),
    values: jest.fn(() => []),
    entries: jest.fn(() => []),
    toString: jest.fn(() => ''),
  })),
  usePathname: jest.fn(() => '/'),
}))

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

