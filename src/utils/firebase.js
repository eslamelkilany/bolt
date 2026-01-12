// Firebase Configuration for Kafaat Platform
// Using Firebase Realtime Database for persistent cloud storage
// Free tier: 1GB storage, 10GB/month bandwidth

import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  onValue,
  serverTimestamp
} from 'firebase/database';

// Firebase configuration - Replace with your own config for production
// This is a demo configuration - create your own at https://console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyDemo_Replace_With_Your_Own_Key",
  authDomain: "kafaat-platform.firebaseapp.com",
  databaseURL: "https://kafaat-platform-default-rtdb.firebaseio.com",
  projectId: "kafaat-platform",
  storageBucket: "kafaat-platform.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};

// Initialize Firebase (if config is valid)
let app = null;
let database = null;
let firebaseEnabled = false;

try {
  // Only initialize if we have a valid config (not demo values)
  if (!firebaseConfig.apiKey.includes('Demo_Replace')) {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    firebaseEnabled = true;
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase using demo config - using localStorage fallback');
  }
} catch (error) {
  console.log('Firebase initialization skipped:', error.message);
}

// Check if Firebase is available
export function isFirebaseEnabled() {
  return firebaseEnabled;
}

// ==================== DATABASE OPERATIONS ====================

// Get data from path
export async function getData(path) {
  if (!database) return null;
  
  try {
    const snapshot = await get(ref(database, path));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Firebase getData error:', error);
    return null;
  }
}

// Set data at path
export async function setData(path, data) {
  if (!database) return false;
  
  try {
    await set(ref(database, path), data);
    return true;
  } catch (error) {
    console.error('Firebase setData error:', error);
    return false;
  }
}

// Update data at path
export async function updateData(path, data) {
  if (!database) return false;
  
  try {
    await update(ref(database, path), data);
    return true;
  } catch (error) {
    console.error('Firebase updateData error:', error);
    return false;
  }
}

// Delete data at path
export async function deleteData(path) {
  if (!database) return false;
  
  try {
    await remove(ref(database, path));
    return true;
  } catch (error) {
    console.error('Firebase deleteData error:', error);
    return false;
  }
}

// Push new data (auto-generate ID)
export async function pushData(path, data) {
  if (!database) return null;
  
  try {
    const newRef = push(ref(database, path));
    await set(newRef, data);
    return newRef.key;
  } catch (error) {
    console.error('Firebase pushData error:', error);
    return null;
  }
}

// Listen to data changes
export function onDataChange(path, callback) {
  if (!database) return () => {};
  
  const dataRef = ref(database, path);
  return onValue(dataRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
}

// Get server timestamp
export function getServerTime() {
  return serverTimestamp();
}

export default {
  isFirebaseEnabled,
  getData,
  setData,
  updateData,
  deleteData,
  pushData,
  onDataChange,
  getServerTime
};
