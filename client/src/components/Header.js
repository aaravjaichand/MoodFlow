import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, User, Home, Camera, LogOut } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Header = () => {
  const { user } = useContext(UserContext);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
                  <span style={{ display: 'none' }}>
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
            {currentUser?.displayName?.charAt(0)?.toUpperCase() || user.name.charAt(0).toUpperCase()}
          </div>
          <span style={{
            color: 'white',
            fontWeight: '500',
            display: 'none',
          }}>
            {currentUser?.displayName || user.name}
          </span>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                await logout();
                toast.success('Logged out successfully');
                navigate('/login');
              } catch (error) {
                toast.error('Failed to logout');
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} />
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;