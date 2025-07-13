import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Music, Heart, Zap, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const Home = ({ user }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
          <p style={{ marginTop: '10px' }}>
            {isLogin ? 'No account?' : 'Already have an account?'}{' '}
            <span
              style={{ color: '#667eea', cursor: 'pointer' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </form>
        <style>{`
          .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .auth-form {
            background: white;
            padding: 32px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            display: flex;
            flex-direction: column;
            min-width: 320px;
          }
          .auth-form h2 {
            margin-bottom: 18px;
            color: #764ba2;
          }
          .auth-form input {
            margin-bottom: 14px;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
          }
          .auth-form button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 8px;
          }
          .auth-form button:hover {
            background: #764ba2;
          }
          .auth-error {
            color: #fa709a;
            margin-bottom: 8px;
            font-size: 0.95rem;
          }
        `}</style>
      </div>
    );
  }

  const features = [
    {
      icon: Camera,
      title: 'AI Mood Detection',
      description: 'Real-time facial analysis to detect your current mood and emotions',
      color: '#667eea'
    },
    {
      icon: Music,
      title: 'Smart Recommendations',
      description: 'AI-powered music suggestions based on your mood and preferences',
      color: '#764ba2'
    },
    {
      icon: Heart,
      title: 'Personalized Playlists',
      description: 'Create and share mood-based playlists with friends',
      color: '#f093fb'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Live mood tracking and instant music recommendations',
      color: '#4facfe'
    },
    {
      icon: Users,
      title: 'Social Features',
      description: 'Connect with friends and discover music together',
      color: '#43e97b'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Track your mood patterns and music listening habits',
      color: '#fa709a'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            color: 'white',
            marginBottom: '24px',
            lineHeight: '1.2',
          }}
        >
          Discover Music Through
          <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
          }}>
            Your Emotions
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px',
            lineHeight: '1.6',
          }}
        >
          Experience the future of music discovery with AI-powered mood analysis. 
          Let your emotions guide you to the perfect soundtrack for every moment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/mood-analyzer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
              style={{ fontSize: '1.1rem', padding: '16px 32px' }}
              onClick={() => toast.success('Starting mood analysis...')}
            >
              <Camera size={20} />
              Start Mood Analysis
            </motion.button>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-secondary"
            style={{ fontSize: '1.1rem', padding: '16px 32px' }}
            onClick={() => toast.success('Demo mode activated!')}
          >
            <Music size={20} />
            Try Demo
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          maxWidth: '1200px',
          margin: '0 auto 80px',
          padding: '0 20px',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          Powered by Advanced AI
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                className="card"
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Icon size={28} color="white" />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '12px',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6',
                }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.8 }}
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
          }}
        >
          Ready to Experience the Future?
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '32px',
            lineHeight: '1.6',
          }}
        >
          Join thousands of users who are already discovering music in a whole new way.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.8 }}
        >
          <Link to="/mood-analyzer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
              style={{ fontSize: '1.2rem', padding: '20px 40px' }}
              onClick={() => toast.success('Welcome to MoodFlow! 🎵')}
            >
              <Zap size={24} />
              Get Started Now
            </motion.button>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Home;