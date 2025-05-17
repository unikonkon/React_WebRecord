
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAudioByShareableId, AudioMetadata } from "@/services/audioService";
import Header from "@/components/Header";

const SharedAudio = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // State
  const [audio, setAudio] = useState<AudioMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Fetch audio data
  useEffect(() => {
    const fetchAudio = async () => {
      if (!shareId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const audioData = await getAudioByShareableId(shareId);
        
        if (!audioData) {
          setNotFound(true);
        } else {
          setAudio(audioData);
        }
      } catch (error) {
        console.error("Error fetching shared audio:", error);
        toast({
          title: t("error"),
          description: "Failed to load audio",
          variant: "destructive",
        });
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudio();
  }, [shareId, toast, t]);

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
    });
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

  if (notFound || !audio) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="bg-muted/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-2">Audio Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This shared audio may have been removed or the link has expired.
              </p>
              <Button asChild>
                <Link to="/">Go to Home</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-primary/10 p-6">
              <h1 className="text-2xl font-bold mb-2">{audio.name}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDuration(audio.duration)} • Shared on {formatDate(audio.updatedAt)}
              </div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              {audio.description && (
                <div className="text-muted-foreground">
                  {audio.description}
                </div>
              )}
              
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <audio src={audio.fileUrl} controls className="w-full" />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  asChild
                  className="flex gap-2"
                >
                  <Link to="/">
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
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Go to Home
                  </Link>
                </Button>
                
                <Button 
                  variant="default"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = audio.fileUrl;
                    a.download = `${audio.name}.${audio.format.split("/")[1] || "mp3"}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="flex gap-2"
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t("download")}
                </Button>
              </div>
              
              {/* Transcription if available */}
              {audio.transcription && (
                <div className="bg-muted/30 rounded-lg p-4 mt-4">
                  <h3 className="font-medium mb-2">Transcription</h3>
                  <p className="text-muted-foreground">{audio.transcription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SharedAudio;
