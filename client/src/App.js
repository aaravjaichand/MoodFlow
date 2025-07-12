import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

// Components
import Header from './components/Header';
import Home from './pages/Home';
import MoodAnalyzer from './pages/MoodAnalyzer';
import Playlists from './pages/Playlists';
import Profile from './pages/Profile';

// Context
import { SocketContext } from './context/SocketContext';
import { UserProvider } from './context/UserContext';

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <UserProvider>
        <Router>
          <div className="App">
            <Header />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Home />
                  </motion.div>
                } />
                <Route path="/mood-analyzer" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <MoodAnalyzer />
                  </motion.div>
                } />
                <Route path="/playlists" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Playlists />
                  </motion.div>
                } />
                <Route path="/profile" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Profile />
                  </motion.div>
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
  );
}

export default App;