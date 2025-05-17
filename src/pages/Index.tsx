// Update this page (the content is just a fallback if you fail to update the page)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { initDB } from "@/lib/indexedDBService";

const Index = () => {
  const [dbStatus, setDbStatus] = useState<string>("Initializing...");

  useEffect(() => {
    // Initialize IndexedDB
    const setupDB = async () => {
      try {
        await initDB();
        setDbStatus("IndexedDB initialized successfully! Your recordings will be stored locally.");
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
        setDbStatus("Error initializing local storage. Your recordings may not be saved.");
      }
    };

    setupDB();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 p-4 text-center">
      <h1 className="text-4xl font-bold">Sonic Echo</h1>
      <p className="text-muted-foreground max-w-md">
        Record, save, and share audio recordings with ease.
        All your recordings are stored locally on your device.
      </p>
      
      <div className="text-sm p-3 bg-primary/10 rounded-md border border-primary/20 max-w-md">
        {dbStatus}
      </div>
      
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/register">Register</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
