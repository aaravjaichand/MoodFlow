import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Heart, User, Home, Camera } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Header = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/mood-analyzer', label: 'Mood Analyzer', icon: Camera },
    { path: '/playlists', label: 'Playlists', icon: Music },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '16px 24px',
        margin: '16px',
        borderRadius: '20px',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Music size={24} color="white" />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>
            MoodFlow
          </h1>
        </motion.div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'white',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                  }}
                >
                  <Icon size={20} />
                  <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span style={{
            color: 'white',
            fontWeight: '500',
            display: 'none',
            '@media (min-width: 768px)': { display: 'block' },
          }}>
            {user.name}
          </span>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;