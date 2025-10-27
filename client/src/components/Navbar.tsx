import { Link, useLocation } from "wouter";
import { Sparkles, Image, Award, User, Home } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass-card px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Nav Links */}
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
            <NavLink 
              href="/profile" 
              icon={<User className="w-4 h-4" />} 
              label="Profile" 
              active={isActive("/profile")}
            />
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
