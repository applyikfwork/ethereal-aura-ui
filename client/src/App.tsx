import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import Home from "./pages/Home";
import Creator from "./pages/Creator";
import Gallery from "./pages/Gallery";
import Premium from "./pages/Premium";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const App = () => (
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

export default App;
