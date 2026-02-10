import { db } from './config';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// User ID - using a simple local ID for now
// In a real app, you'd use Firebase Auth
const getUserId = () => {
  let userId = localStorage.getItem('tj-user-id');
  if (!userId) {
    userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('tj-user-id', userId);
  }
  return userId;
};

// Save products to Firebase
export const saveProductsToFirebase = async (products) => {
  try {
    const userId = getUserId();
    await setDoc(doc(db, 'users', userId), {
      products: products,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('Products saved to Firebase');
  } catch (error) {
    console.error('Error saving products to Firebase:', error);
  }
};

// Save favorites to Firebase
export const saveFavoritesToFirebase = async (favorites) => {
  try {
    const userId = getUserId();
    await setDoc(doc(db, 'users', userId), {
      favorites: favorites,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('Favorites saved to Firebase');
  } catch (error) {
    console.error('Error saving favorites to Firebase:', error);
  }
};

// Save cart to Firebase
export const saveCartToFirebase = async (cart) => {
  try {
    const userId = getUserId();
    await setDoc(doc(db, 'users', userId), {
      cart: cart,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('Cart saved to Firebase');
  } catch (error) {
    console.error('Error saving cart to Firebase:', error);
  }
};

// Load data from Firebase
export const loadDataFromFirebase = async () => {
  try {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No data found in Firebase');
      return null;
    }
  } catch (error) {
    console.error('Error loading data from Firebase:', error);
    return null;
  }
};

// Subscribe to real-time updates
export const subscribeToFirebaseUpdates = (callback) => {
  try {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to Firebase updates:', error);
    return () => {}; // Return empty function if error
  }
};
