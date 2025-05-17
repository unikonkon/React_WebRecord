
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { saveAudio } from "@/services/audioService";
import Header from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const Record = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Recording state
  const {
    isRecording,
    isPaused,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    audioBlob,
    audioUrl,
    formattedTime,
  } = useAudioRecorder();

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [recordingName, setRecordingName] = useState("");
  const [recordingDescription, setRecordingDescription] = useState("");

  // Handle recording actions
  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error: any) {
      console.error("Error starting recording:", error);
      toast({
        title: t("error"),
        description: error.message || "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    const { audioBlob } = stopRecording();
    if (audioBlob) {
      // Auto-generate a name based on the current date
      const now = new Date();
      const defaultName = `Recording ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      setRecordingName(defaultName);
      setShowSaveDialog(true);
    }
  };

  // Handle saving the recording
  const handleSaveRecording = async () => {
    if (!audioBlob || !currentUser) return;

    try {
      setIsSaving(true);

      const name = recordingName.trim() || `Recording ${new Date().toLocaleString()}`;

      await saveAudio({
        userId: currentUser.uid,
        name,
        description: recordingDescription,
        file: audioBlob,
        duration: audioBlob instanceof File ? 0 : audioBlob.size / 16000, // Approximate duration
        format: audioBlob.type,
        deviceInfo: navigator.userAgent,
      });

      toast({
        title: t("success"),
        description: "Recording saved successfully",
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving recording:", error);
      toast({
        title: t("error"),
        description: error.message || "Failed to save recording",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setShowSaveDialog(false);
    }
  };

  // Handle discarding the recording
  const handleDiscardRecording = () => {
    cancelRecording();
    setShowSaveDialog(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8">{t("newRecording")}</h1>

          <div className="bg-muted/30 border rounded-lg p-8 flex flex-col items-center justify-center space-y-8">
            {/* Recording Time Display */}
            <div className="text-6xl font-mono font-bold">{formattedTime}</div>

            {/* Waveform Visualization */}
            <div className="flex gap-1 items-center justify-center h-20 w-full">
              {isRecording && (
                Array(20).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 bg-primary rounded-full animate-waveform-${(i % 5) + 1}`}
                    style={{
                      height: `${10 + Math.random() * 90}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))
              )}

              {!isRecording && audioUrl && (
                <audio
                  src={audioUrl}
                  controls
                  className="w-full h-12"
                />
              )}

              {!isRecording && !audioUrl && (
                <div className="text-muted-foreground">
                  {t("startRecording")} to see waveform
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center items-center space-x-4">
              {!isRecording && !audioUrl && (
                <Button
                  onClick={handleStartRecording}
                  className="size-16 rounded-full flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </Button>
              )}

              {isRecording && (
                <>
                  {isPaused ? (
                    <Button
                      onClick={resumeRecording}
                      variant="outline"
                      className="size-12 rounded-full flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      className="size-12 rounded-full flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                      >
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    </Button>
                  )}

                  <Button
                    onClick={handleStopRecording}
                    variant="destructive"
                    className="size-16 rounded-full flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-6"
                    >
                      <rect x="6" y="6" width="12" height="12" />
                    </svg>
                  </Button>

                  <Button
                    onClick={cancelRecording}
                    variant="outline"
                    className="size-12 rounded-full flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                    >
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </Button>
                </>
              )}

              {!isRecording && audioUrl && (
                <>
                  <Button
                    onClick={() => setShowSaveDialog(true)}
                    className="size-16 rounded-full flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-6"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                  </Button>

                  <Button
                    onClick={handleDiscardRecording}
                    variant="outline"
                    className="size-12 rounded-full flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </Button>
                </>
              )}
            </div>

            {/* Recording Status Indicator */}
            {isRecording && (
              <div className="flex items-center space-x-2 text-sm">
                <span className={`inline-block size-3 rounded-full bg-red-500 ${isPaused ? '' : 'animate-pulse-recording'}`} />
                <span className={isPaused ? '' : 'text-green-500'}>
                  {isPaused ? t("pauseRecording") : t("recordingName")}
                </span>
              </div>
            )}

          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-muted/30 border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Recording Tips</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Speak clearly and at a consistent pace</li>
              <li>Find a quiet location without background noise</li>
              <li>Keep your device's microphone about 6-12 inches from your mouth</li>
              <li>Avoid touching or moving your device while recording</li>
              <li>Do a short test recording first to check audio quality</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Save Recording Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("saveRecording")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("recordingName")}
              </label>
              <Input
                id="name"
                value={recordingName}
                onChange={(e) => setRecordingName(e.target.value)}
                placeholder="My Recording"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                {t("recordingDescription")}
              </label>
              <Textarea
                id="description"
                value={recordingDescription}
                onChange={(e) => setRecordingDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            {audioUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDiscardRecording}
              disabled={isSaving}
            >
              {t("discardRecording")}
            </Button>
            <Button
              onClick={handleSaveRecording}
              disabled={isSaving}
            >
              {isSaving ? t("loading") : t("saveRecording")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Record;
