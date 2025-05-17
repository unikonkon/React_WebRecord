import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { uploadExistingAudio } from "@/services/audioService";
import Header from "@/components/Header";

const Upload = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelect(droppedFile);
    }
  };

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    // Check if the file is an audio file
    if (!selectedFile.type.startsWith("audio/")) {
      toast({
        title: t("error"),
        description: "Please select an audio file (MP3 or WAV)",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    
    // Auto-set name from filename if not already set
    if (!name) {
      // Remove file extension and use as name
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setName(fileName);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file || !name.trim() || !currentUser) {
      toast({
        title: t("error"),
        description: "Please select a file and enter a name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      await uploadExistingAudio({
        userId: currentUser.uid,
        name: name.trim(),
        description,
        file,
      });
      
      toast({
        title: t("success"),
        description: "Audio uploaded successfully",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error uploading audio:", error);
      toast({
        title: t("error"),
        description: error.message || "Failed to upload audio",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle browse click
  const handleBrowseClick = () => {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8">{t("uploadAudio")}</h1>
          
          <div className="space-y-6">
            {/* File Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/10" : "border-muted"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg 
                        className="size-8 text-muted-foreground mr-3" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3" />
                        <polyline points="14 2 14 8 20 8" />
                        <circle cx="10" cy="16" r="6" />
                        <path d="m9 13 2 2 2-2" />
                        <path d="M12 18v-5" />
                      </svg>
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFile(null)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <svg 
                        className="size-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <svg 
                    className="mx-auto size-12 text-muted-foreground mb-3" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  
                  <p className="text-lg mb-2">Drag and drop your audio file here</p>
                  <p className="text-sm text-muted-foreground mb-4">Supports MP3 and WAV files</p>
                  
                  <div className="flex justify-center">
                    <Input
                      id="file-upload"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleBrowseClick}
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  {t("recordingName")} *
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for your audio"
                  required
                  disabled={isUploading}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  {t("recordingDescription")}
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  disabled={isUploading}
                />
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !file || !name.trim()}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <svg 
                        className="mr-2 size-4 animate-spin" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("loading")}
                    </>
                  ) : (
                    <>
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
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {t("uploadAudio")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
