import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Components
import Header from './components/Header';
import Home from './pages/Home';
import MoodAnalyzer from './pages/MoodAnalyzer';
import Playlists from './pages/Playlists';
import Profile from './pages/Profile';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { SocketContext } from './context/SocketContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/AuthContext';

console.log('API KEY:', process.env.REACT_APP_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <SocketContext.Provider value={socket}>
        <UserProvider>
          <Router>
            <div className="App">
              <Header />
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Home user={user} />
                      </motion.div>
                    </ProtectedRoute>
                  } />
                  <Route path="/mood-analyzer" element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <MoodAnalyzer />
                      </motion.div>
                    </ProtectedRoute>
                  } />
                  <Route path="/playlists" element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Playlists />
                      </motion.div>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Profile />
                      </motion.div>
                    </ProtectedRoute>
                  } />
                </Routes>
              </AnimatePresence>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  },
                }}
              />
            </div>
          </Router>
        </UserProvider>
      </SocketContext.Provider>
    </AuthProvider>
  );
}

export default App;