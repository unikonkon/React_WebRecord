import React, { useState, useRef, useEffect } from 'react';
import { saveAudio } from "@/services/audioService";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from '@/components/Header';
import { useLanguage } from "@/contexts/LanguageContext";

const TabAudioCapture: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [recordingName, setRecordingName] = useState('');
    const [recordingDescription, setRecordingDescription] = useState('');

    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number>();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const startAudioCapture = async () => {
        try {
            setError(null);
            setRecordedAudioURL(null);

            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: true
            });

            if (!stream.getAudioTracks().length) {
                throw new Error('No audio track available. Please ensure you checked "Share tab audio"');
            }

            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();

            analyser.fftSize = 2048;
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            // Setup MediaRecorder
            const mediaRecorder = new MediaRecorder(stream);
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedAudioURL(url);
                setShowSaveDialog(true);
            };

            mediaRecorder.start();

            // Store refs
            audioContextRef.current = audioContext;
            streamRef.current = stream;
            analyserRef.current = analyser;
            mediaRecorderRef.current = mediaRecorder;

            drawWaveform();
            setIsCapturing(true);

            stream.getAudioTracks()[0].onended = () => {
                stopAudioCapture();
            };

        } catch (err) {
            console.error('Error capturing audio:', err);
            setError(err instanceof Error ? err.message : 'Failed to start audio capture');
            stopAudioCapture();
        }
    };

    const stopAudioCapture = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        setIsCapturing(false);
    };

    const handleSaveRecording = async () => {
        if (!recordedChunksRef.current.length || !currentUser) return;

        try {
            setIsSaving(true);
            const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
            const name = recordingName.trim() || `Recording ${new Date().toLocaleString()}`;

            await saveAudio({
                userId: currentUser.uid,
                name,
                description: recordingDescription,
                file: audioBlob,
                duration: audioContextRef.current?.currentTime || 0,
                format: 'audio/webm',
                deviceInfo: navigator.userAgent,
            });

            toast({
                title: "Success",
                description: "Recording saved successfully",
                variant: "default",
            });

            navigate("/dashboard");
        } catch (error: any) {
            console.error("Error saving recording:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save recording",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
            setShowSaveDialog(false);
        }
    };

    const drawWaveform = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(240, 240, 240)';
            canvasCtx.fillRect(0, 0, width, height);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
            canvasCtx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
    };

    useEffect(() => {
        return () => {
            stopAudioCapture();
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-muted/30 p-6 rounded-lg shadow-sm border">
                        <button
                            onClick={isCapturing ? stopAudioCapture : startAudioCapture}
                            className={`px-4 py-2 rounded-md font-medium ${isCapturing
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            {isCapturing ? t('stopRecording') : t('startRecording')}
                        </button>

                        {isCapturing && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-green-700 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    {t('recordingInProgress')}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Explanation */}
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-6 text-sm text-yellow-800">
                            <details>
                                <summary className="font-semibold cursor-pointer">{t('audioCaptureLimitations')}</summary>
                                <div className="mt-2 space-y-2">
                                    <p>⚠️ <strong>{t('knownLimitations')}</strong></p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>{t('browserSupport')}</li>
                                        <li>{t('tabAudioSharing')}</li>
                                        <li>{t('displayMediaLimitation')}</li>
                                        <li>{t('multiSourceLimitation')}</li>
                                    </ul>
                                    <p>✅ <strong>{t('supportedFeatures')}</strong></p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>{t('supportedBrowsers')}</li>
                                        <li>{t('supportedAudioFormat')}</li>
                                        <li>{t('waveformSupport')}</li>
                                        <li>{t('screenRecordingSupport')}</li>
                                    </ul>
                                    <p className="text-xs text-gray-600 italic">{t('testingRecommendation')}</p>
                                </div>
                            </details>
                        </div>

                        <canvas
                            ref={canvasRef}
                            className="mt-6 w-full border rounded-md bg-gray-50"
                            width={600}
                            height={85}
                        />

                        {recordedAudioURL && (
                            <div className="mt-6 p-4 border rounded-md">
                                <h4 className="font-medium mb-2">{t('previewRecording')}</h4>
                                <audio controls className="w-full" src={recordedAudioURL}></audio>
                            </div>
                        )}
                    </div>

                    {showSaveDialog && (
                        <div className="mt-4 p-6 rounded-lg shadow-sm border bg-muted/30">
                            <h2 className="text-xl font-semibold mb-4">{t('saveRecording')}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('recordingName')}</label>
                                    <input
                                        type="text"
                                        value={recordingName}
                                        onChange={(e) => setRecordingName(e.target.value)}
                                        className="w-full p-2 border rounded-md text-black"
                                        placeholder={t('recordingName')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('recordingDescription')}</label>
                                    <textarea
                                        value={recordingDescription}
                                        onChange={(e) => setRecordingDescription(e.target.value)}
                                        className="w-full p-2 border rounded-md text-blackTabAudioCapture.tsx"
                                        rows={3}
                                        placeholder={t('recordingDescription')}
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowSaveDialog(false)}
                                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                        disabled={isSaving}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        onClick={handleSaveRecording}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {isSaving ? t('loading') : t('save')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TabAudioCapture;