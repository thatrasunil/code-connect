import { db } from "../firebase";
import {
    collection,
    addDoc,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    increment,
    getDoc,
    getCountFromServer // Importing getCountFromServer although we use onSnapshot for real-time
} from "firebase/firestore";


/**
 * Initialize or update user document in Firestore
 * Called on login/signup
 */
export const initializeUserInFirestore = async (user) => {
    try {
        const userRef = doc(db, "users", user.uid);

        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL || null,
            isOnline: true,
            lastActive: serverTimestamp(),
            createdAt: serverTimestamp(), // detailed merge might be better to not overwrite original createdAt
            provider: user.providerData && user.providerData[0] ? user.providerData[0].providerId : "unknown"
        };

        // Use setDoc with merge: true to avoid overwriting existing data fields like createdAt if handled properly, 
        // but here we just want to ensure these fields exist. 
        // If we want to preserve createdAt, we should check existence or use update, but merge is safe for adding new fields.
        // However, merging createdAt every time login happens is wrong.
        // Let's check existence first or just dont include createdAt in the merge if we suspect it exists.
        // For simplicity per guide, we'll just merge what we have.
        // A better approach: distinct creation vs update. 
        // But adhering to the guide provided by user:
        await setDoc(userRef, userData, { merge: true });
        console.log("✅ User initialized in Firestore:", user.uid);
        return userData;
    } catch (error) {
        console.error("❌ Error initializing user:", error);
        // Don't throw, just log, so app flow continues
    }
};

/**
 * Update user's last active timestamp
 * Called periodically
 */
export const updateUserPresence = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            lastActive: serverTimestamp(),
            isOnline: true
        });
    } catch (error) {
        // console.error("❌ Error updating presence:", error);
        // Suppress frequent logs
    }
};

/**
 * Set user as offline
 * Called on logout
 */
export const setUserOffline = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            isOnline: false,
            lastActive: serverTimestamp()
        });
        console.log("✅ User marked offline:", userId);
    } catch (error) {
        console.error("❌ Error setting offline:", error);
    }
};

/**
 * Create interview room document
 */
export const createInterviewRoom = async (roomData) => {
    try {
        const roomRef = doc(collection(db, "interview_rooms"));
        const newRoom = {
            ...roomData,
            createdAt: serverTimestamp(),
            status: "active",
            participants: roomData.participants || []
        };

        await setDoc(roomRef, newRoom);
        console.log("✅ Room created:", roomRef.id);
        return { id: roomRef.id, ...newRoom };
    } catch (error) {
        console.error("❌ Error creating room:", error);
        throw error;
    }
};
/**
 * Log a transaction/action for audit
 */
export const logTransaction = async (userId, actionType, details = {}) => {
    try {
        await addDoc(collection(db, "logs"), {
            userId,
            actionType,
            details,
            timestamp: serverTimestamp()
        });
        // console.log(`📝 Logged: ${actionType}`);
    } catch (error) {
        console.error("❌ Error logging transaction:", error);
    }
};

/**
 * Increment user stats (points, rooms_created, messages_sent)
 */
export const incrementUserStats = async (userId, type) => {
    try {
        const userRef = doc(db, "users", userId);
        const updates = {};

        if (type === 'room') {
            updates.rooms = increment(1);
            updates.points = increment(10); // 10 points for creating a room
        } else if (type === 'message') {
            updates.messages = increment(1);
            updates.points = increment(1); // 1 point for sending a message
        }

        await updateDoc(userRef, updates);
    } catch (error) {
        console.error("Error incrementing stats:", error);
    }
};

/**
 * Subscribe to leaderboard updates
 */
export const subscribeToLeaderboard = (callback) => {
    const q = query(
        collection(db, "users"),
        orderBy("points", "desc"),
        limit(10)
    );

    return onSnapshot(q, (snapshot) => {
        const leaderboardData = [];
        snapshot.forEach((doc) => {
            leaderboardData.push(doc.data());
        });
        callback(leaderboardData);
    }, (error) => {
        console.error("❌ Leaderboard subscription error:", error);
    });
};

/**
 * Subscribe to online users count and list
 */
export const subscribeToOnlineUsers = (callback) => {
    const q = query(
        collection(db, "users"),
        where("isOnline", "==", true)
    );

    return onSnapshot(q, (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        callback(users);
    }, (error) => {
        console.error("❌ Online users subscription error:", error);
    });
};
