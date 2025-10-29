import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Share2 } from "lucide-react";
import type { Avatar } from "@shared/schema";

export default function Gallery() {
  const { data: avatars = [], isLoading } = useQuery<Avatar[]>({
    queryKey: ['/api/avatars/public/gallery'],
  });

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 animate-shimmer">
            <Sparkles className="w-5 h-5 text-lavender" />
            <span className="text-sm font-medium text-foreground">Community Gallery</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-light tracking-tight">
            <span className="block mb-2 bg-gradient-to-r from-lavender via-primary to-sky-bright bg-clip-text text-transparent">
              Explore Auras
            </span>
          </h1>

          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Discover amazing avatars created by our community
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="glass-card p-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        ) : avatars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No public avatars yet. Be the first to share yours!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {avatars.map((avatar) => (
              <Card
                key={avatar.id}
                className="glass-card p-4 hover-lift group"
                data-testid={`card-gallery-${avatar.id}`}
              >
                <div className="relative aspect-square mb-3 overflow-hidden rounded-lg">
                  <img
                    src={avatar.imageUrl}
                    alt="Community avatar"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    data-testid={`img-gallery-${avatar.id}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
                    <Button size="sm" variant="glass" data-testid={`button-like-${avatar.id}`}>
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="glass" data-testid={`button-share-${avatar.id}`}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium capitalize">{avatar.artStyle} Style</p>
                  <p className="text-xs text-muted-foreground">
                    {avatar.auraEffect} aura
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
