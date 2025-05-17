
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { currentUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  
  // Settings state
  const [audioQuality, setAudioQuality] = useState<string>("medium");
  const [autoUpload, setAutoUpload] = useState<boolean>(true);
  const [audioFormat, setAudioFormat] = useState<string>("mp3");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize settings from localStorage
  useEffect(() => {
    const savedQuality = localStorage.getItem("audioQuality");
    const savedAutoUpload = localStorage.getItem("autoUpload");
    const savedFormat = localStorage.getItem("audioFormat");
    
    if (savedQuality) setAudioQuality(savedQuality);
    if (savedAutoUpload) setAutoUpload(savedAutoUpload === "true");
    if (savedFormat) setAudioFormat(savedFormat);
  }, []);

  // Save settings
  const saveSettings = () => {
    try {
      setIsSaving(true);
      
      localStorage.setItem("audioQuality", audioQuality);
      localStorage.setItem("autoUpload", autoUpload.toString());
      localStorage.setItem("audioFormat", audioFormat);
      
      toast({
        title: t("success"),
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: t("error"),
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8">{t("settings")}</h1>
          
          <div className="grid gap-6">
            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t("language")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("en")}
                    className="flex gap-2"
                  >
                    🇬🇧 {t("english")}
                  </Button>
                  
                  <Button
                    variant={language === "th" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("th")}
                    className="flex gap-2"
                  >
                    🇹🇭 {t("thai")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Audio Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t("audioQuality")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="audio-quality">Quality</Label>
                  <Select
                    value={audioQuality}
                    onValueChange={setAudioQuality}
                  >
                    <SelectTrigger id="audio-quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (64 kbps)</SelectItem>
                      <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                      <SelectItem value="high">High (256 kbps)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Higher quality settings result in larger file sizes
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="audio-format">Format</Label>
                  <Select
                    value={audioFormat}
                    onValueChange={setAudioFormat}
                  >
                    <SelectTrigger id="audio-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="wav">WAV</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    WAV provides higher quality but larger files
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-upload">Auto-upload recordings</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically upload recordings when completed
                    </p>
                  </div>
                  <Switch
                    id="auto-upload"
                    checked={autoUpload}
                    onCheckedChange={setAutoUpload}
                  />
                </div>
                
                <Button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? t("loading") : t("save")}
                </Button>
              </CardContent>
            </Card>
            
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Voice Recording App - Version 1.0.0
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  © 2025 VoiceRecord. All rights reserved.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
