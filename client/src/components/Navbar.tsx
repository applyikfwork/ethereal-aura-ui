import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, User, LogOut, Crown, Image as ImageIcon, Home } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, appUser, signOut, signInWithGoogle } = useAuth();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Studio", href: "/studio", icon: Sparkles },
    { name: "Gallery", href: "/gallery", icon: ImageIcon },
    { name: "Premium", href: "/premium", icon: Crown },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lavender to-sky flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-lavender via-primary to-sky-bright bg-clip-text text-transparent">
                Aura
              </span>
            </a>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                      data-testid={`link-${item.name.toLowerCase()}`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </a>
                </Link>
              );
            })}
          </div>

          <div>
            {user && appUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2" data-testid="button-profile">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={appUser.avatarUrl || undefined} />
                      <AvatarFallback>
                        {appUser.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{appUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link href="/profile">
                    <a>
                      <DropdownMenuItem data-testid="link-profile">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                    </a>
                  </Link>
                  {!appUser.premium && (
                    <Link href="/premium">
                      <a>
                        <DropdownMenuItem data-testid="link-upgrade">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </DropdownMenuItem>
                      </a>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} data-testid="button-signout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={signInWithGoogle} variant="hero" size="sm" data-testid="button-signin">
                <User className="w-4 h-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
