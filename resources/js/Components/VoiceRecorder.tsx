import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Download } from 'lucide-react';

interface Props {
    onRecordingComplete: (blob: Blob, duration: number) => void;
    maxDuration?: number;
}

export default function VoiceRecorder({ onRecordingComplete, maxDuration = 600 }: Props) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationIdRef = useRef<number | null>(null);

    // Initialize audio context and start recording
    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;
            source.connect(analyserRef.current);

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            // Start duration timer
            durationTimerRef.current = setInterval(() => {
                setDuration((prev) => {
                    if (prev >= maxDuration) {
                        stopRecording();
                        return maxDuration;
                    }
                    return prev + 1;
                });
            }, 1000);

            // Draw waveform
            drawWaveform();
        } catch (err) {
            setError('Failed to access microphone. Please check your permissions.');
            console.error('Error accessing microphone:', err);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
            }

            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        }
    };

    // Draw waveform visualization
    const drawWaveform = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgb(26, 26, 26)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 82, 232)';
        ctx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        if (isRecording) {
            animationIdRef.current = requestAnimationFrame(drawWaveform);
        }
    };

    // Play recording
    const playRecording = () => {
        if (!recordedBlob) return;

        if (!audioPlaybackRef.current) {
            const url = URL.createObjectURL(recordedBlob);
            const audio = new Audio(url);
            audioPlaybackRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
            };
        }

        if (isPlaying) {
            audioPlaybackRef.current.pause();
            setIsPlaying(false);
        } else {
            audioPlaybackRef.current.play();
            setIsPlaying(true);
        }
    };

    // Clear recording
    const clearRecording = () => {
        if (audioPlaybackRef.current) {
            audioPlaybackRef.current.pause();
            audioPlaybackRef.current = null;
        }
        setRecordedBlob(null);
        setDuration(0);
        setIsPlaying(false);
    };

    // Format duration as MM:SS
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Submit recording
    const submitRecording = () => {
        if (recordedBlob) {
            onRecordingComplete(recordedBlob, duration);
        }
    };

    return (
        <div className="voice-recorder">
            {error && <div className="error-message">{error}</div>}

            {!recordedBlob ? (
                <>
                    {/* Waveform Canvas */}
                    {isRecording && (
                        <canvas
                            ref={canvasRef}
                            className="waveform-canvas"
                            width={300}
                            height={100}
                        />
                    )}

                    {/* Recording Controls */}
                    <div className="recorder-controls">
                        {!isRecording ? (
                            <button
                                className="record-btn"
                                onClick={startRecording}
                            >
                                <Mic size={20} />
                                Start Recording
                            </button>
                        ) : (
                            <>
                                <div className="recording-indicator">
                                    <span className="pulse-dot" />
                                    Recording...
                                </div>
                                <div className="duration-display">
                                    {formatDuration(duration)} / {formatDuration(maxDuration)}
                                </div>
                                <button
                                    className="stop-btn"
                                    onClick={stopRecording}
                                >
                                    <Square size={20} />
                                    Stop Recording
                                </button>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Playback Controls */}
                    <div className="playback-controls">
                        <button
                            className="play-btn"
                            onClick={playRecording}
                        >
                            <Play size={20} />
                            {isPlaying ? 'Playing...' : 'Play Recording'}
                        </button>
                        <span className="duration-badge">{formatDuration(duration)}</span>
                        <button
                            className="delete-btn"
                            onClick={clearRecording}
                            title="Delete recording"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        className="submit-recording-btn"
                        onClick={submitRecording}
                    >
                        <Download size={18} />
                        Use This Recording
                    </button>
                </>
            )}
        </div>
    );
}
