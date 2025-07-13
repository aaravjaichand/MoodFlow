import { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        id: '',
        name: 'Music Lover',
        email: '',
        favoriteGenres: ['Pop', 'Rock', 'Alternative'],
        favoriteArtists: ['Coldplay', 'The Weeknd', 'Taylor Swift'],
        profilePicture: '👤',
        joinDate: new Date('2024-01-01'),
        totalPlaylists: 12,
        totalLikes: 45,
        moodHistory: []
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(prev => ({
                    ...prev,
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                }));
            } else {
                // Only try to sign in anonymously if not already signed in
                if (!auth.currentUser) {
                    signInAnonymously(auth).catch(err => {
                        console.error('Anonymous sign-in error:', err);
                    });
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const updateUserPreferences = (preferences) => {
        setUser(prev => ({
            ...prev,
            ...preferences
        }));
    };

    const addMoodToHistory = (mood) => {
        setUser(prev => ({
            ...prev,
            moodHistory: [...prev.moodHistory, { ...mood, timestamp: new Date() }]
        }));
    };

    return (
        <UserContext.Provider value={{ user, setUser, updateUserPreferences, addMoodToHistory }}>
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