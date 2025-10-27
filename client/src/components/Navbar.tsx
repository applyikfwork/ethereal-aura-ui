import { Link, useLocation } from "wouter";
import { Sparkles, Image, Award, User, Home, LogIn, LogOut, Settings } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass-card px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-sky-400 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-glow"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-sky-500 p-2 rounded-full">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">
                Aura
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <NavLink 
              href="/" 
              icon={<Home className="w-4 h-4" />} 
              label="Home" 
              active={isActive("/")}
            />
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
            <NavLink 
              href="/premium" 
              icon={<Award className="w-4 h-4" />} 
              label="Premium" 
              active={isActive("/premium")}
            />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                    <Avatar>
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      {userData && (
                        <p className="text-xs text-primary">
                          {userData.isPremium ? 'Premium' : `${userData.credits} credits`}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/profile')} data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => setLocation('/admin')} data-testid="menu-admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/login')}
                  className="flex items-center gap-2"
                  data-testid="button-login"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
                <Button
                  onClick={() => setLocation('/signup')}
                  className="gradient-primary flex items-center gap-2"
                  data-testid="button-signup"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign Up
                </Button>
              </div>
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
          flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
          ${active 
            ? 'bg-gradient-to-r from-purple-500 to-sky-500 text-white glow-lavender' 
            : 'bg-white/50 text-gray-700 hover:bg-white hover:glow-pink'
          }
        `}
      >
        {icon}
        <span className="font-medium">{label}</span>
      </button>
    </Link>
  );
}
