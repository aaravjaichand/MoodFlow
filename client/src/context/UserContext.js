import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { ref, set, onValue, update } from 'firebase/database';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [user, setUser] = useState({
        id: '',
        name: '',
        email: '',
        favoriteGenres: [],
        favoriteArtists: [],
        profilePicture: '👤',
        joinDate: '',
        totalPlaylists: 0,
        totalLikes: 0,
        moodHistory: [],
        dayStreak: 0,
        recommendationsCount: 0,
        playlists: [],
        topGenres: [],
        recentActivity: []
    });

    // Fetch user data from Firebase Realtime Database on login
    useEffect(() => {
        if (currentUser) {
            const userRef = ref(db, `users/${currentUser.uid}`);
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    setUser({
                        id: currentUser.uid,
                        name: currentUser.displayName || 'Music Lover',
                        email: currentUser.email,
                        ...snapshot.val(),
                    });
                } else {
                    // If no data, initialize user in DB
                    const newUser = {
                        id: currentUser.uid,
                        name: currentUser.displayName || 'Music Lover',
                        email: currentUser.email,
                        favoriteGenres: [],
                        favoriteArtists: [],
                        profilePicture: '👤',
                        joinDate: new Date(currentUser.metadata.creationTime).toISOString(),
                        totalPlaylists: 0,
                        totalLikes: 0,
                        moodHistory: [],
                        dayStreak: 0,
                        recommendationsCount: 0,
                        playlists: [],
                        topGenres: [],
                        recentActivity: []
                    };
                    set(userRef, newUser);
                    setUser(newUser);
                }
            });
        }
    }, [currentUser]);

    // Update user preferences in DB
    const updateUserPreferences = (preferences) => {
        if (currentUser) {
            const userRef = ref(db, `users/${currentUser.uid}`);
            update(userRef, preferences);
            setUser(prev => ({
                ...prev,
                ...preferences
            }));
        }
    };

    // Add mood to history in DB
    const addMoodToHistory = (mood) => {
        if (currentUser) {
            const userRef = ref(db, `users/${currentUser.uid}/moodHistory`);
            const newMood = { ...mood, timestamp: new Date().toISOString() };
            const updatedHistory = [...(user.moodHistory || []), newMood];
            set(userRef, updatedHistory);
            setUser(prev => ({
                ...prev,
                moodHistory: updatedHistory
            }));
        }
    };

    // Update day streak
    const updateDayStreak = (streak) => {
        if (currentUser) {
            const userRef = ref(db, `users/${currentUser.uid}`);
            update(userRef, { dayStreak: streak });
            setUser(prev => ({ ...prev, dayStreak: streak }));
        }
    };

    // Update recommendations count
    const incrementRecommendationsCount = () => {
        if (currentUser) {
            const userRef = ref(db, `users/${currentUser.uid}`);
            const newCount = (user.recommendationsCount || 0) + 1;
            update(userRef, { recommendationsCount: newCount });
            setUser(prev => ({ ...prev, recommendationsCount: newCount }));
        }
    };

    // Update playlists
    const updatePlaylists = (playlists) => {
        if (currentUser) {
            const userRef = ref(db, `users/${currentUser.uid}`);
            update(userRef, { playlists, totalPlaylists: playlists.length });
            setUser(prev => ({ ...prev, playlists, totalPlaylists: playlists.length }));
        }
    };

    // Update top genres
    const updateTopGenres = (topGenres) => {
        if (currentUser) {
            const userRef = ref(db, `users/${currentUser.uid}`);
            update(userRef, { topGenres });
            setUser(prev => ({ ...prev, topGenres }));
        }
    };

    // Update recent activity
    const updateRecentActivity = (recentActivity) => {
        if (currentUser) {
            const userRef = ref(db, `users/${currentUser.uid}`);
            update(userRef, { recentActivity });
            setUser(prev => ({ ...prev, recentActivity }));
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            updateUserPreferences,
            addMoodToHistory,
            updateDayStreak,
            incrementRecommendationsCount,
            updatePlaylists,
            updateTopGenres,
            updateRecentActivity
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export { UserContext };