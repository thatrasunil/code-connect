import { db } from "../firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    onSnapshot
} from "firebase/firestore";

// User operations
export const createUser = async (userId, userData) => {
    try {
        await setDoc(doc(db, "users", userId), {
            ...userData,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

// Interview room operations
export const createInterviewRoom = async (roomData) => {
    try {
        const docRef = await addDoc(collection(db, "interview_rooms"), {
            ...roomData,
            status: "active",
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating room:", error);
        throw error;
    }
};

// Quiz results
export const saveQuizResult = async (userId, quizData) => {
    try {
        await addDoc(collection(db, "quiz_results"), {
            userId,
            ...quizData,
            completedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw error;
    }
};

// Real-time listener for rooms
export const subscribeToRoom = (roomId, callback) => {
    return onSnapshot(doc(db, "interview_rooms", roomId), callback);
};

// Watch my rooms
export const watchMyRooms = (userId, callback) => {
    const q = query(
        collection(db, "interview_rooms"),
        where("participants", "array-contains", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(rooms);
    });
};
