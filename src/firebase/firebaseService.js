import { db } from './config';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// Save products to Firebase for a specific user
export const saveProductsToFirebase = async (userId, products) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      products: products,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving products to Firebase:', error);
  }
};

// Save favorites to Firebase for a specific user
export const saveFavoritesToFirebase = async (userId, favorites) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      favorites: favorites,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving favorites to Firebase:', error);
  }
};

// Save cart to Firebase for a specific user
export const saveCartToFirebase = async (userId, cart) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      cart: cart,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving cart to Firebase:', error);
  }
};

// Load data from Firebase for a specific user
export const loadDataFromFirebase = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error loading data from Firebase:', error);
    return null;
  }
};

// Subscribe to real-time updates for a specific user
export const subscribeToFirebaseUpdates = (userId, callback) => {
  try {
    const docRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to Firebase updates:', error);
    return () => {};
  }
};
