
import { useState, useRef, useCallback } from "react";

interface AudioRecorderOptions {
  audioBitsPerSecond?: number;
  mimeType?: string;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  mediaRecorder: MediaRecorder | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

const DEFAULT_OPTIONS: AudioRecorderOptions = {
  audioBitsPerSecond: 128000,
  mimeType: "audio/webm",
};

export const useAudioRecorder = (options: AudioRecorderOptions = DEFAULT_OPTIONS) => {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    mediaRecorder: null,
    audioBlob: null,
    audioUrl: null,
  });

  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine supported MIME types
      const mimeType = options.mimeType || "audio/webm";
      const supportedMimeType = MediaRecorder.isTypeSupported(mimeType) 
        ? mimeType 
        : MediaRecorder.isTypeSupported("audio/webm") 
          ? "audio/webm" 
          : "audio/mp3";

      // Create new media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        audioBitsPerSecond: options.audioBitsPerSecond || 128000,
        mimeType: supportedMimeType,
      });

      // Set up data handling
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start(100);

      // Start timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const recordingTime = Math.floor((Date.now() - startTime) / 1000);
        setState((prev) => ({ ...prev, recordingTime }));
      }, 1000);

      setState({
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        mediaRecorder,
        audioBlob: null,
        audioUrl: null,
      });

    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }, [options.audioBitsPerSecond, options.mimeType]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (state.mediaRecorder && state.isRecording && !state.isPaused) {
      state.mediaRecorder.pause();
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.mediaRecorder, state.isRecording, state.isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (state.mediaRecorder && state.isRecording && state.isPaused) {
      state.mediaRecorder.resume();

      // Resume timer
      const currentTime = state.recordingTime;
      const startTime = Date.now() - currentTime * 1000;
      
      timerRef.current = window.setInterval(() => {
        const recordingTime = Math.floor((Date.now() - startTime) / 1000);
        setState((prev) => ({ ...prev, recordingTime }));
      }, 1000);

      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [state.mediaRecorder, state.isRecording, state.isPaused, state.recordingTime]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (state.mediaRecorder && state.isRecording) {
      state.mediaRecorder.stop();

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      
      // Create blob from chunks
      const audioBlob = new Blob(chunksRef.current, { type: state.mediaRecorder.mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);

      setState((prev) => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        audioBlob,
        audioUrl,
      }));

      return { audioBlob, audioUrl };
    }
    
    return { audioBlob: null, audioUrl: null };
  }, [state.mediaRecorder, state.isRecording]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (state.mediaRecorder) {
      // If recording, stop the media recorder without processing the data
      if (state.isRecording) {
        try {
          state.mediaRecorder.stop();
        } catch (error) {
          console.error("Error stopping media recorder:", error);
        }
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop and release all media streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Clear URL if exists
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }

      // Reset state
      chunksRef.current = [];
      setState({
        isRecording: false,
        isPaused: false,
        recordingTime: 0,
        mediaRecorder: null,
        audioBlob: null,
        audioUrl: null,
      });
    }
  }, [state.mediaRecorder, state.isRecording, state.audioUrl]);

  // Format time for display (MM:SS)
  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    ...state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    formattedTime: formatTime(state.recordingTime),
  };
};
