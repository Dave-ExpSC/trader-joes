import { db } from './config';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// Generate a random 8-character alphanumeric share code
export const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. "ABCD-1234"
};

// Save a share code for a user (owner)
export const saveShareCode = async (userId, shareCode) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      shareCode: shareCode,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Also store a reverse lookup: shareCode -> userId
    await setDoc(doc(db, 'shareCodes', shareCode), {
      ownerId: userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving share code:', error);
  }
};

// Delete old share code reverse lookup
export const deleteShareCode = async (shareCode) => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'shareCodes', shareCode));
  } catch (error) {
    console.error('Error deleting share code:', error);
  }
};

// Look up owner userId from a share code
export const lookupShareCode = async (shareCode) => {
  try {
    const normalized = shareCode.trim().toUpperCase();
    const docSnap = await getDoc(doc(db, 'shareCodes', normalized));
    if (docSnap.exists()) {
      return docSnap.data().ownerId;
    }
    return null;
  } catch (error) {
    console.error('Error looking up share code:', error);
    return null;
  }
};

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
    }
    return null;
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
