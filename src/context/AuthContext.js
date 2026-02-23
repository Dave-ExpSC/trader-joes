import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guestOwnerId, setGuestOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved guest session
    const savedGuestOwnerId = sessionStorage.getItem('tj-guest-owner-id');
    if (savedGuestOwnerId) {
      setGuestOwnerId(savedGuestOwnerId);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Clear guest session if user signs in with Google
        setGuestOwnerId(null);
        sessionStorage.removeItem('tj-guest-owner-id');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginAsGuest = (ownerId) => {
    setGuestOwnerId(ownerId);
    sessionStorage.setItem('tj-guest-owner-id', ownerId);
  };

  const logout = () => {
    if (guestOwnerId) {
      setGuestOwnerId(null);
      sessionStorage.removeItem('tj-guest-owner-id');
    } else {
      signOut(auth);
    }
  };

  // The effective user ID for Firebase reads/writes:
  // - Google user: their own UID
  // - Guest: the owner's UID (read-only from their perspective)
  const effectiveUserId = guestOwnerId || user?.uid || null;
  const isGuest = !!guestOwnerId && !user;

  return (
    <AuthContext.Provider value={{ user, guestOwnerId, effectiveUserId, isGuest, loginAsGuest, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
