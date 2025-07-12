import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

const SpotifyPlayer = ({ currentSong, isPlaying, onPlayPause, onNext, onPrevious }) => {
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(new Audio());

    // Initialize audio element
    useEffect(() => {
        const audio = audioRef.current;

        // Set up audio event listeners
        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            if (audio.duration > 0) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        });

        audio.addEventListener('ended', () => {
            onNext(); // Auto-play next song when current ends
        });

        // Set initial volume
        audio.volume = volume / 100;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [onNext]);

    // Handle song changes
    useEffect(() => {
        if (currentSong && currentSong.previewUrl) {
            const audio = audioRef.current;
            audio.src = currentSong.previewUrl;
            audio.load();

            if (isPlaying) {
                audio.play().catch(error => {
                    console.error('Failed to play audio:', error);
                    toast.error('Failed to play audio preview');
                });
            }
        }
    }, [currentSong]);

    // Handle play/pause
    useEffect(() => {
        const audio = audioRef.current;
        if (isPlaying && currentSong?.previewUrl) {
            audio.play().catch(error => {
                console.error('Failed to play audio:', error);
                toast.error('Failed to play audio preview');
            });
        } else {
            audio.pause();
        }
    }, [isPlaying, currentSong]);

    // Handle volume changes
    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = isMuted ? 0 : volume / 100;
    }, [volume, isMuted]);

    // Simple playback controls that work with the current setup
    const handlePlayPause = () => {
        if (currentSong) {
            onPlayPause();
            if (isPlaying) {
                toast.success('Paused');
            } else {
                toast.success(`Now playing: ${currentSong.title}`);
            }
        } else {
            toast.error('No song selected');
        }
    };

    const handleNext = () => {
        if (currentSong) {
            onNext();
            toast.success('Next track');
        }
    };

    const handlePrevious = () => {
        if (currentSong) {
            onPrevious();
            toast.success('Previous track');
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        toast.success(isMuted ? 'Unmuted' : 'Muted');
    };

    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        if (!isMuted) {
            toast.success(`Volume: ${newVolume}%`);
        }
    };

    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickPercent = clickX / width;

        if (audio.duration) {
            audio.currentTime = clickPercent * audio.duration;
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                            Music Player
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
                    cursor: 'pointer',
                    position: 'relative',
                }}
                    onClick={handleProgressClick}
                >
                    <motion.div
                        style={{
                            height: '100%',
                            background: 'white',
                            borderRadius: '2px',
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    marginTop: '4px',
                    opacity: 0.8,
                }}>
                    <span>{formatTime(audioRef.current.currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Playback Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
            }}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrevious}
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
                        cursor: 'pointer',
                    }}
                >
                    <SkipBack size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlayPause}
                    style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNext}
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
                        cursor: 'pointer',
                    }}
                >
                    <SkipForward size={20} />
                </motion.button>
            </div>

            {/* Song Info */}
            {currentSong && (
                <div style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>
                        {currentSong.title}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
                        {currentSong.artist} • {currentSong.duration}
                    </p>
                    {currentSong.spotifyUrl && (
                        <a
                            href={currentSong.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                marginTop: '8px',
                                padding: '6px 12px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                            }}
                        >
                            Open in Spotify
                        </a>
                    )}
                    {!currentSong.previewUrl && (
                        <p style={{
                            margin: '8px 0 0 0',
                            fontSize: '0.8rem',
                            opacity: 0.7,
                            fontStyle: 'italic',
                        }}>
                            No preview available - click "Open in Spotify" to play full song
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default SpotifyPlayer; 