import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import config from '../config';
import {
    initializeUserInFirestore,
    updateUserPresence,
    setUserOffline,
    logTransaction
} from '../services/firestoreService';


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authMethod, setAuthMethod] = useState(null); // 'firebase' or 'backend'

    const BACKEND_URL = config.BACKEND_URL;

    // Listen for Firebase auth state changes
    useEffect(() => {
        let presenceInterval;

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
            if (firebaseUserData) {
                setFirebaseUser(firebaseUserData);
                setUser({
                    id: firebaseUserData.uid,
                    username: firebaseUserData.displayName || firebaseUserData.email?.split('@')[0],
                    email: firebaseUserData.email,
                    photoURL: firebaseUserData.photoURL,
                    provider: 'firebase'
                });
                setAuthMethod('firebase');
                setLoading(false);

                // Firestore Integration
                initializeUserInFirestore(firebaseUserData);

                // Start heartbeat
                updateUserPresence(firebaseUserData.uid);
                presenceInterval = setInterval(() => {
                    updateUserPresence(firebaseUserData.uid);
                }, 30000);

            } else {
                if (presenceInterval) clearInterval(presenceInterval);

                // Check for backend JWT auth if no Firebase user
                checkBackendAuth();
            }
        });

        return () => {
            unsubscribe();
            if (presenceInterval) clearInterval(presenceInterval);
        };
    }, []);

    const checkBackendAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout(); // This calls internal logout
                } else {
                    await fetchUserProfile(token);
                    setAuthMethod('backend');
                }
            } catch (err) {
                console.error("Token invalid", err);
                logout();
            }
        }
        setLoading(false);
    };

    const fetchUserProfile = async (token) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser({ ...userData, provider: 'backend' });
            } else {
                logout();
            }
        } catch (err) {
            console.error(err);
            logout();
        }
    };

    // Firebase Email/Password Login
    const loginWithFirebase = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            logTransaction(result.user.uid, 'USER_LOGIN', { method: 'password' });
            return { success: true, user: result.user };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Firebase Google Sign-In
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            logTransaction(result.user.uid, 'USER_LOGIN', { method: 'google' });
            return { success: true, user: result.user };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Firebase Email/Password Registration
    const registerWithFirebase = async (email, password, displayName) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Update profile with display name
            if (displayName) {
                await updateProfile(result.user, { displayName });
            }
            logTransaction(result.user.uid, 'USER_REGISTER', { method: 'password' });
            return { success: true, user: result.user };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Backend JWT Login (existing)
    const login = async (username, password) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.access);
                localStorage.setItem('refresh', data.refresh);
                await fetchUserProfile(data.access);
                setAuthMethod('backend');
                return { success: true };
            } else {
                let errorMsg = "Login failed";
                if (data.detail) {
                    errorMsg = typeof data.detail === 'object' ? JSON.stringify(data.detail) : String(data.detail);
                }
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    };

    // Backend Registration (existing)
    const register = async (username, email, password) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (res.ok) {
                return { success: true };
            } else {
                const data = await res.json();
                let errorMsg = "Registration failed";
                try {
                    // Try to flatten Django field errors
                    errorMsg = Object.keys(data).map(key => {
                        const val = data[key];
                        return `${key}: ${Array.isArray(val) ? val.join(' ') : String(val)}`;
                    }).join(', ');
                } catch (e) {
                    errorMsg = JSON.stringify(data);
                }
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    };

    // Universal Logout
    const logout = async () => {
        // Set offline in Firestore if firebase user
        if (firebaseUser?.uid) {
            setUserOffline(firebaseUser.uid);
        }

        // Clear backend tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');

        // Sign out from Firebase
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Firebase signout error:', err);
        }

        setUser(null);
        setFirebaseUser(null);
        setAuthMethod(null);
    };

    const value = {
        user,
        firebaseUser,
        authMethod,
        loading,
        // Backend auth methods
        login,
        register,
        // Firebase auth methods
        loginWithFirebase,
        loginWithGoogle,
        registerWithFirebase,
        // Universal
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
