import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Backend URL (dynamic based on env or default)
    const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    useEffect(() => {
        // Check for token in localStorage on mount
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Optional: Check expiration
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // Ideally fetch fresh user data here, but for now decode is enough for ID
                    // We can fetch profile
                    fetchUserProfile(token);
                }
            } catch (err) {
                logout();
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (token) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                logout();
            }
        } catch (err) {
            console.error(err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    };

    const register = async (username, email, password) => {
        const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const addToHistory = async (roomId) => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${BACKEND_URL}/api/user/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ roomId })
            });
            // Optionally update local user state history
        } catch (err) {
            console.error("Failed to save history", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, addToHistory }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
