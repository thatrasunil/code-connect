import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const BACKEND_URL = config.BACKEND_URL;

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    await fetchUserProfile(token);
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
                setUser(userData);
            } else {
                logout();
            }
        } catch (err) {
            console.error(err);
            logout();
        }
    };

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
                return { success: true };
            } else {
                return { success: false, error: data.detail || "Login failed" };
            }
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (res.ok) {
                // Auto-login after register? Or just return success
                return { success: true };
            } else {
                const data = await res.json();
                // Format error message from Django serializer errors
                const errorMsg = Object.values(data).flat().join(', ');
                return { success: false, error: errorMsg || "Registration failed" };
            }
        } catch (err) {
            return { success: false, error: "Network error" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
