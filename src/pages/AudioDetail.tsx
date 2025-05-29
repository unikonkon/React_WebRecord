
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  getAudioById, 
  updateAudio, 
  deleteAudio, 
  generateShareableUrl, 
  AudioMetadata,
  saveTranscription
} from "@/services/audioService";
import Header from "@/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AudioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [audio, setAudio] = useState<AudioMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Share dialog state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [expirationDays, setExpirationDays] = useState<string>("0");
  const [shareableUrl, setShareableUrl] = useState<string>("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Transcription dialog state
  const [isTranscribeDialogOpen, setIsTranscribeDialogOpen] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Fetch audio data
  useEffect(() => {
    const fetchAudio = async () => {
      if (!id || !currentUser) return;
      
      try {
        setIsLoading(true);
        const audioData = await getAudioById(id);
        
        if (!audioData) {
          toast({
            title: t("error"),
            description: "Audio not found",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
        
        setAudio(audioData);
        setIsOwner(audioData.userId === currentUser.uid);
        
        // Set initial edit values
        setEditName(audioData.name);
        setEditDescription(audioData.description || "");
        setIsPublic(audioData.isPublic);
        setTranscription(audioData.transcription || "");
        
        // Set shareable URL if exists
        if (audioData.shareableUrl) {
          const baseUrl = window.location.origin;
          setShareableUrl(`${baseUrl}/share/${audioData.shareableUrl}`);
        }
      } catch (error) {
        console.error("Error fetching audio:", error);
        toast({
          title: t("error"),
          description: "Failed to load audio details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudio();
  }, [id, currentUser, navigate, toast, t]);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle audio rename
  const handleSaveEdit = async () => {
    if (!id || !editName.trim()) return;
    
    try {
      setIsSaving(true);
      
      await updateAudio({
        id,
        name: editName,
        description: editDescription,
      });
      
      // Update local state
      setAudio((prev) => prev ? {
        ...prev,
        name: editName,
        description: editDescription,
      } : null);
      
      toast({
        title: t("success"),
        description: "Audio details updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating audio:", error);
      toast({
        title: t("error"),
        description: "Failed to update audio details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle audio delete
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      
      await deleteAudio(id);
      
      toast({
        title: t("success"),
        description: "Audio deleted successfully",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting audio:", error);
      toast({
        title: t("error"),
        description: "Failed to delete audio",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle audio download
  const handleDownload = () => {
    if (!audio?.fileUrl) return;
    
    const a = document.createElement("a");
    a.href = audio.fileUrl;
    a.download = `${audio.name}.${audio.format.split("/")[1] || "mp3"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle generating shareable URL
  const handleGenerateShareableUrl = async () => {
    if (!id) return;
    
    try {
      setIsGeneratingUrl(true);
      
      const days = parseInt(expirationDays);
      const shareId = await generateShareableUrl(id, days > 0 ? days : undefined);
      
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/share/${shareId}`;
      
      setShareableUrl(fullUrl);
      setIsPublic(true);
      
      toast({
        title: t("success"),
        description: "Shareable URL generated successfully",
      });
      
      // Update local state
      setAudio((prev) => prev ? {
        ...prev,
        isPublic: true,
        shareableUrl: shareId,
        expirationDate: days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : undefined,
      } : null);
    } catch (error) {
      console.error("Error generating shareable URL:", error);
      toast({
        title: t("error"),
        description: "Failed to generate shareable URL",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyShareableUrl = () => {
    if (!shareableUrl) return;
    
    navigator.clipboard.writeText(shareableUrl);
    
    toast({
      title: t("success"),
      description: "URL copied to clipboard",
    });
  };

  // Handle transcription
  const handleTranscribe = async () => {
    if (!id) return;
    
    try {
      setIsTranscribing(true);
      
      // Simple demo transcription - in a real app, this would call a transcription API
      const demoTranscriptionText = "This is a demo transcription. In a real application, this would use a service like Whisper API to transcribe your audio to text.";
      
      // Save the transcription
      await saveTranscription(id, demoTranscriptionText);
      
      // Update local state
      setTranscription(demoTranscriptionText);
      setAudio((prev) => prev ? {
        ...prev,
        transcription: demoTranscriptionText,
      } : null);
      
      toast({
        title: t("success"),
        description: "Audio transcribed successfully",
      });
      
      setIsTranscribeDialogOpen(false);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast({
        title: t("error"),
        description: "Failed to transcribe audio",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Audio not found</h2>
            <Button asChild className="mt-4">
              <a href="/dashboard">Go back to Dashboard</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{audio.name}</h1>
              <p className="text-muted-foreground mt-1">
                {formatDuration(audio.duration)} • {formatDate(audio.createdAt)}
              </p>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      {t("rename")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Recording Details</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("recordingName")}
                        </label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("recordingDescription")}
                        </label>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                        disabled={isSaving}
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        disabled={isSaving || !editName.trim()}
                      >
                        {isSaving ? t("loading") : t("save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      {t("delete")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Recording</DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <p>Are you sure you want to delete this recording? This action cannot be undone.</p>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                        disabled={isDeleting}
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? t("loading") : t("delete")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
          
          {audio.description && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p>{audio.description}</p>
            </div>
          )}
          
          {/* Audio Player */}
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <audio src={audio.fileUrl} controls className="w-full mb-4" />
            
            <div className="flex flex-wrap gap-4 justify-between">
              <Button variant="outline" onClick={handleDownload}>
                <svg 
                  className="mr-2 size-4" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t("download")}
              </Button>
              
              {isOwner && (
                <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <svg 
                        className="mr-2 size-4" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      {t("share")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share Recording</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      {shareableUrl ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Shareable URL</label>
                          <div className="flex gap-2">
                            <Input value={shareableUrl} readOnly />
                            <Button
                              variant="outline"
                              onClick={handleCopyShareableUrl}
                              className="shrink-0"
                            >
                              <svg 
                                className="size-4" 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Expiration</label>
                            <Select
                              value={expirationDays}
                              onValueChange={setExpirationDays}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select expiration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Never expires</SelectItem>
                                <SelectItem value="1">1 day</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button
                            onClick={handleGenerateShareableUrl}
                            disabled={isGeneratingUrl}
                            className="w-full"
                          >
                            {isGeneratingUrl ? t("loading") : "Generate Shareable URL"}
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {isOwner && (
                <Dialog open={isTranscribeDialogOpen} onOpenChange={setIsTranscribeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <svg 
                        className="mr-2 size-4" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {t("transcribe")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("transcribeAudio")}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4">
                      {transcription ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Transcription</label>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <p>{transcription}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mb-4">
                           ใส่รายละเอียดของคีย์ API
                          </p>
                          <Button
                            onClick={handleTranscribe}
                            disabled={isTranscribing}
                            className="w-full"
                          >
                            {isTranscribing ? t("loading") : t("generateTranscription")}
                          </Button>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          
          {/* Audio Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">{t("audioDetails")}</h2>
              
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Format</dt>
                  <dd>{audio.format.split("/")[1]?.toUpperCase() || "MP3"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd>{formatDuration(audio.duration)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">File Size</dt>
                  <dd>{formatFileSize(audio.size)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(audio.createdAt)}</dd>
                </div>
                {audio.shareableUrl && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sharing</dt>
                    <dd className="text-green-600">Public</dd>
                  </div>
                )}
                {audio.expirationDate && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Expires</dt>
                    <dd>{formatDate(audio.expirationDate)}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">{t("deviceInfo")}</h2>
              
              <p className="text-muted-foreground text-sm break-all">
                {audio.deviceInfo || "No device info available"}
              </p>
            </div>
          </div>
          
          {/* Transcription Section (if exists) */}
          {transcription && (
            <div className="bg-card rounded-lg p-6 shadow-sm mt-6">
              <h2 className="text-lg font-medium mb-4">Transcription</h2>
              <p className="text-muted-foreground">{transcription}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AudioDetail;
