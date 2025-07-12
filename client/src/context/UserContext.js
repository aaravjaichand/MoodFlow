import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        id: 'user-1',
        name: 'Music Lover',
        email: 'user@example.com',
        favoriteGenres: ['Pop', 'Rock', 'Alternative'],
        favoriteArtists: ['Coldplay', 'The Weeknd', 'Taylor Swift'],
        profilePicture: '👤',
        joinDate: new Date('2024-01-01'),
        totalPlaylists: 12,
        totalLikes: 45,
        moodHistory: []
    });

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