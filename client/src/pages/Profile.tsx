import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Download, Crown } from "lucide-react";
import { Navigate } from "wouter";
import type { Avatar as AvatarType } from "@shared/schema";

export default function Profile() {
  const { appUser, user } = useAuth();

  const { data: avatars = [], isLoading } = useQuery<AvatarType[]>({
    queryKey: ['/api/users', appUser?.id, 'avatars'],
    enabled: !!appUser?.id,
  });

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <Card className="glass-card p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={appUser?.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {appUser?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-semibold mb-2" data-testid="text-username">
                  {appUser?.name}
                </h1>
                <p className="text-muted-foreground" data-testid="text-email">{appUser?.email}</p>

                <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
                  <div className="glass-card px-4 py-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-lavender" />
                    <span className="text-sm">
                      <span className="font-semibold" data-testid="text-credits">
                        {appUser?.premium ? "Unlimited" : appUser?.credits}
                      </span>{" "}
                      Credits
                    </span>
                  </div>

                  {appUser?.premium ? (
                    <div className="glass-card px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-lavender/20 to-sky/20">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold" data-testid="text-plan">Premium Member</span>
                    </div>
                  ) : (
                    <Button variant="hero" size="sm" data-testid="button-upgrade">
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">My Avatars</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="glass-card p-4 animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-3"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </Card>
              ))}
            </div>
          ) : avatars.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-lavender to-sky rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold">No Avatars Yet</h3>
                <p className="text-muted-foreground">
                  Head to the Avatar Studio to create your first Aura!
                </p>
                <Button variant="hero" data-testid="button-create">
                  Create Your First Avatar
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {avatars.map((avatar, index) => (
                <Card
                  key={avatar.id}
                  className="glass-card p-4 hover-lift group"
                  data-testid={`card-avatar-${index}`}
                >
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-lg">
                    <img
                      src={avatar.imageUrl}
                      alt="My avatar"
                      className="w-full h-full object-cover"
                      data-testid={`img-avatar-${index}`}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="glass" data-testid={`button-download-${index}`}>
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium capitalize">
                      {avatar.artStyle} Style
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(avatar.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
