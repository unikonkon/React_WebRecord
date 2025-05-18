
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserAudios, AudioMetadata } from "@/services/audioService";
import Header from "@/components/Header";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [recordings, setRecordings] = useState<AudioMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalDuration: 0,
  });

  useEffect(() => {
    const fetchRecordings = async () => {
      if (currentUser && currentUser.uid) {
        try {
          setIsLoading(true);
          const userAudios = await getUserAudios(currentUser.uid);
          setRecordings(userAudios);
          
          // Calculate stats
          const totalCount = userAudios.length;
          const totalDuration = userAudios.reduce((sum, audio) => sum + audio.duration, 0);
          
          setStats({
            totalCount,
            totalDuration,
          });
        } catch (error) {
          console.error("Error fetching recordings:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRecordings();
  }, [currentUser]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("myRecordings")} ({stats.totalCount})
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button asChild>
              <Link to="/record">
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
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                {t("newRecording")}
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/upload">
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
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("totalRecordings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("totalDuration")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatDuration(stats.totalDuration)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recordings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("myRecordings")}</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-muted-foreground">{t("noRecordings")}</div>
              <Button asChild className="mt-4">
                <Link to="/record">{t("newRecording")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordings.map((recording) => (
                <Card key={recording.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold truncate">{recording.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <span>{formatDuration(recording.duration)}</span>
                      <span>{formatDate(recording.createdAt)}</span>
                    </div>
                    
                    {recording.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{recording.description}</p>
                    )}
                    
                    <div className="mt-4">
                      <audio src={recording.fileUrl} controls className="w-full h-10" />
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/audio/${recording.id}`}>
                        {t("audioDetails")}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
