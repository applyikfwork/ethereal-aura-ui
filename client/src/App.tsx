import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/config/firebase";
import type { AdminSettings } from "@shared/schema";
import Home from "./pages/Home";
import Creator from "./pages/Creator";
import Gallery from "./pages/Gallery";
import Trending from "./pages/Trending";
import Leaderboard from "./pages/Leaderboard";
import Premium from "./pages/Premium";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const App = () => {
  useEffect(() => {
    const loadFavicon = async () => {
      if (!isFirebaseConfigured || !db) {
        document.title = 'Aura - AI Avatar Studio';
        return;
      }
      
      try {
        const settingsRef = doc(db, 'settings', 'admin');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data() as AdminSettings;
          
          if (settings.faviconUrl) {
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = settings.faviconUrl;
            if (!document.querySelector("link[rel*='icon']")) {
              document.getElementsByTagName('head')[0].appendChild(link);
            }
          }
          
          if (settings.siteName) {
            document.title = settings.siteName;
          }
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      }
    };
    
    loadFavicon();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Navbar />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/creator" component={Creator} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/trending" component={Trending} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/premium" component={Premium} />
            <Route path="/profile" component={Profile} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/admin" component={Admin} />
            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
