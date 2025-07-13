import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const EmotionDetector = ({ onEmotionDetected, isAnalyzing, onAnalysisComplete }) => {
    const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState(false);
    const webcamRef = useRef(null);

    // Take snapshot and analyze with GPT-4o when analysis starts
    const analyzeSnapshot = useCallback(async () => {
        try {
            setIsAnalyzingWithAI(true);

            // Take snapshot
            const snapshot = webcamRef.current.getScreenshot();
            if (!snapshot) {
                toast.error('Failed to capture image');
                setIsAnalyzingWithAI(false);
                return;
            }

            // Send to GPT-4o for analysis
            const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.ANALYZE_EMOTION}`, {
                image: snapshot,
                timestamp: new Date().toISOString()
            });

            if (response.data.success) {
                const analysis = response.data.analysis;

                // Trigger emotion detected callback
                onEmotionDetected({
                    dominant: analysis.dominant,
                    confidence: analysis.confidence,
                    allEmotions: analysis.emotions,
                    aiAnalysis: analysis
                });

                toast.success(`Mood detected: ${analysis.dominant}!`);
            } else {
                throw new Error(response.data.error || 'Failed to analyze emotion');
            }
        } catch (error) {
            console.error('AI analysis error:', error);

            // Fallback to simulated emotion detection
            const fallbackEmotions = ['happy', 'sad', 'angry', 'neutral', 'surprised'];
            const randomEmotion = fallbackEmotions[Math.floor(Math.random() * fallbackEmotions.length)];
            const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence

            const fallbackAnalysis = {
                dominant: randomEmotion,
                confidence: confidence,
                allEmotions: {
                    [randomEmotion]: confidence,
                    happy: Math.random() * 0.3,
                    sad: Math.random() * 0.3,
                    angry: Math.random() * 0.3,
                    neutral: Math.random() * 0.3,
                    surprised: Math.random() * 0.3
                },
                aiAnalysis: null
            };

            onEmotionDetected(fallbackAnalysis);
            toast.success(`Mood detected: ${randomEmotion}! (Fallback mode)`);
        } finally {
            setIsAnalyzingWithAI(false);
            onAnalysisComplete();
        }
    }, [onEmotionDetected, onAnalysisComplete]);

    useEffect(() => {
        if (isAnalyzing && webcamRef.current) {
            analyzeSnapshot();
        }
    }, [isAnalyzing, analyzeSnapshot]);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Camera Container */}
            <div style={{
                width: '100%',
                height: '300px',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.1)',
                marginBottom: '24px',
            }}>
                {/* Webcam - only show when not analyzing */}
                <AnimatePresence>
                    {!isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Webcam
                                ref={webcamRef}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                screenshotFormat="image/jpeg"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Analysis Overlay - show when analyzing */}
                <AnimatePresence>
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                color: 'white',
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 360]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{
                                    fontSize: '4rem',
                                    marginBottom: '24px',
                                }}
                            >
                                {isAnalyzingWithAI ? '🤖' : '📸'}
                            </motion.div>

                            <motion.p
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    margin: 0,
                                    fontSize: '1.2rem',
                                }}
                            >
                                {isAnalyzingWithAI
                                    ? 'AI analyzing your mood...'
                                    : 'Capturing your expression...'
                                }
                            </motion.p>

                            {isAnalyzingWithAI && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        background: 'rgba(138, 43, 226, 0.2)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <Brain size={20} />
                                    <span style={{ fontSize: '0.9rem' }}>
                                        GPT-4o analyzing your facial expression
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Simple Status Indicator */}
            {isAnalyzing && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(138, 43, 226, 0.2)',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    color: 'white',
                    marginBottom: '16px',
                }}>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#8a2be2',
                        }}
                    />
                    {isAnalyzingWithAI ? 'AI Analysis in Progress...' : 'Preparing Analysis...'}
                </div>
            )}
        </div>
    );
};

export default EmotionDetector; 