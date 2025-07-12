import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

const SpotifyPlayer = ({ currentSong, isPlaying, onPlayPause, onNext, onPrevious }) => {
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef(null);

    // Initialize Spotify Web Playback SDK
    useEffect(() => {
        const initializeSpotify = async () => {
            try {
                // Check if Spotify is available
                if (!window.Spotify) {
                    console.log('Spotify Web Playback SDK not available');
                    return;
                }

                // Request authorization
                const token = await getSpotifyToken();
                if (!token) {
                    console.log('No Spotify token available');
                    return;
                }

                const player = new window.Spotify.Player({
                    name: 'MoodFlow Player',
                    getOAuthToken: cb => { cb(token); }
                });

                // Error handling
                player.addListener('initialization_error', ({ message }) => {
                    console.error('Spotify initialization error:', message);
                    toast.error('Failed to connect to Spotify');
                });

                player.addListener('authentication_error', ({ message }) => {
                    console.error('Spotify authentication error:', message);
                    toast.error('Spotify authentication failed');
                });

                player.addListener('account_error', ({ message }) => {
                    console.error('Spotify account error:', message);
                    toast.error('Spotify account error');
                });

                player.addListener('playback_error', ({ message }) => {
                    console.error('Spotify playback error:', message);
                    toast.error('Playback error');
                });

                // Playback status updates
                player.addListener('player_state_changed', state => {
                    if (state) {
                        const { position, duration } = state;
                        if (duration > 0) {
                            setProgress((position / duration) * 100);
                        }
                    }
                });

                // Ready
                player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    setDeviceId(device_id);
                    setIsSpotifyConnected(true);
                    toast.success('Connected to Spotify!');
                });

                // Not Ready
                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                    setIsSpotifyConnected(false);
                });

                // Connect to the player
                const success = await player.connect();
                if (success) {
                    setPlayer(player);
                }
            } catch (error) {
                console.error('Spotify initialization error:', error);
                toast.error('Failed to initialize Spotify player');
            }
        };

        initializeSpotify();

        return () => {
            if (player) {
                player.disconnect();
            }
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, []);

    // Get Spotify token from server
    const getSpotifyToken = async () => {
        try {
            const response = await fetch('/api/spotify-token');
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Failed to get Spotify token:', error);
            return null;
        }
    };

    // Play a song on Spotify
    const playSongOnSpotify = async (song) => {
        if (!player || !deviceId || !song.spotifyUrl) {
            toast.error('Spotify not connected or song not available');
            return;
        }

        try {
            // Extract track ID from Spotify URL
            const trackId = song.spotifyUrl.split('/track/')[1]?.split('?')[0];
            if (!trackId) {
                toast.error('Invalid Spotify track URL');
                return;
            }

            // Start playback
            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await getSpotifyToken()}`
                },
            });

            toast.success(`Now playing: ${song.title}`);
        } catch (error) {
            console.error('Failed to play song:', error);
            toast.error('Failed to play song on Spotify');
        }
    };

    // Control playback
    const togglePlayPause = async () => {
        if (!player) {
            toast.error('Spotify player not connected');
            return;
        }

        try {
            await player.togglePlay();
            onPlayPause();
        } catch (error) {
            console.error('Failed to toggle playback:', error);
            toast.error('Failed to control playback');
        }
    };

    const skipNext = async () => {
        if (!player) return;
        try {
            await player.nextTrack();
            onNext();
        } catch (error) {
            console.error('Failed to skip track:', error);
        }
    };

    const skipPrevious = async () => {
        if (!player) return;
        try {
            await player.previousTrack();
            onPrevious();
        } catch (error) {
            console.error('Failed to skip track:', error);
        }
    };

    const toggleMute = () => {
        if (!player) return;
        try {
            if (isMuted) {
                player.setVolume(volume / 100);
                setIsMuted(false);
            } else {
                player.setVolume(0);
                setIsMuted(true);
            }
        } catch (error) {
            console.error('Failed to toggle mute:', error);
        }
    };

    const handleVolumeChange = (newVolume) => {
        if (!player) return;
        try {
            setVolume(newVolume);
            if (!isMuted) {
                player.setVolume(newVolume / 100);
            }
        } catch (error) {
            console.error('Failed to change volume:', error);
        }
    };

    // Auto-play song when currentSong changes
    useEffect(() => {
        if (currentSong && isPlaying && isSpotifyConnected) {
            playSongOnSpotify(currentSong);
        }
    }, [currentSong, isPlaying, isSpotifyConnected]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="spotify-player"
            style={{
                background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                color: 'white',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        🎵
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                            {isSpotifyConnected ? 'Spotify Connected' : 'Connecting to Spotify...'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                            {currentSong ? `${currentSong.title} - ${currentSong.artist}` : 'No song playing'}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMute}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </motion.button>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                        style={{
                            width: '80px',
                            accentColor: 'white',
                        }}
                    />
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                }}>
                    <motion.div
                        style={{
                            height: '100%',
                            background: 'white',
                            borderRadius: '2px',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={skipPrevious}
                    disabled={!isSpotifyConnected}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: isSpotifyConnected ? 'pointer' : 'not-allowed',
                        opacity: isSpotifyConnected ? 1 : 0.5,
                    }}
                >
                    <SkipBack size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlayPause}
                    disabled={!isSpotifyConnected}
                    style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1DB954',
                        cursor: isSpotifyConnected ? 'pointer' : 'not-allowed',
                        opacity: isSpotifyConnected ? 1 : 0.5,
                    }}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={skipNext}
                    disabled={!isSpotifyConnected}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: isSpotifyConnected ? 'pointer' : 'not-allowed',
                        opacity: isSpotifyConnected ? 1 : 0.5,
                    }}
                >
                    <SkipForward size={20} />
                </motion.button>
            </div>

            {!isSpotifyConnected && (
                <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                }}>
                    Please log in to Spotify Premium to enable playback
                </div>
            )}
        </motion.div>
    );
};

export default SpotifyPlayer; 