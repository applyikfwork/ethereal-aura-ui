import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Route, Switch } from "wouter";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Studio from "./pages/Studio";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Navbar />
        <div className="pt-16">
          <Switch>
            <Route path="/" component={Index} />
            <Route path="/studio" component={Studio} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/profile" component={Profile} />
            <Route path="/premium" component={Premium} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
