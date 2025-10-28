import { Link, useLocation } from "wouter";
import { Sparkles, Image, Award, User, Home, LogIn, LogOut, Settings, TrendingUp, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, userData, logout, isAdmin } = useAuth();

  const isActive = (path: string) => location === path;

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto glass-card px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-sky-400 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-glow"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-sky-500 p-2 rounded-full">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">
                Aura
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <NavLink 
              href="/creator" 
              icon={<Sparkles className="w-4 h-4" />} 
              label="Create" 
              active={isActive("/creator")}
            />
            <NavLink 
              href="/gallery" 
              icon={<Image className="w-4 h-4" />} 
              label="Gallery" 
              active={isActive("/gallery")}
            />
            <div className="hidden md:flex items-center gap-1 sm:gap-2">
              <NavLink 
                href="/trending" 
                icon={<TrendingUp className="w-4 h-4" />} 
                label="Trending" 
                active={isActive("/trending")}
              />
              <NavLink 
                href="/leaderboard" 
                icon={<Trophy className="w-4 h-4" />} 
                label="Leaderboard" 
                active={isActive("/leaderboard")}
              />
              <NavLink 
                href="/premium" 
                icon={<Award className="w-4 h-4" />} 
                label="Premium" 
                active={isActive("/premium")}
              />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-2 ring-purple-500/50 hover:ring-purple-500 transition-all" data-testid="button-user-menu">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-sky-500 text-white font-bold">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass-card">
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-12 w-12 ring-2 ring-purple-500/50">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-sky-500 text-white font-bold text-lg">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                      {userData && (
                        <p className="text-xs font-medium text-purple-600">
                          {userData.isPremium ? '✨ Premium' : `⚡ ${userData.credits} credits`}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/profile')} data-testid="menu-profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => setLocation('/admin')} data-testid="menu-admin" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout" className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-2 ring-gray-300 hover:ring-purple-500 transition-all" data-testid="button-guest-menu">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-sky-500 text-white font-bold">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <div className="p-3 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-sky-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold">Welcome to Aura!</p>
                    <p className="text-xs text-muted-foreground mt-1">Sign in to create amazing avatars</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/login')} data-testid="menu-login" className="cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/signup')} data-testid="menu-signup" className="cursor-pointer bg-gradient-to-r from-purple-500/10 to-sky-500/10 text-purple-600 font-medium">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Sign Up
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label, active }: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
}) {
  return (
    <Link href={href} data-testid={`link-${label.toLowerCase()}`}>
      <button
        className={`
          flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full transition-all duration-300
          ${active 
            ? 'bg-gradient-to-r from-purple-500 to-sky-500 text-white glow-lavender' 
            : 'bg-white/50 text-gray-700 hover:bg-white hover:glow-pink'
          }
        `}
      >
        {icon}
        <span className="font-medium text-xs sm:text-sm">{label}</span>
      </button>
    </Link>
  );
}
