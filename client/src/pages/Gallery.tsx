import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Avatar } from "@shared/schema";

export default function Gallery() {
  const { data: avatars, isLoading } = useQuery<Avatar[]>({
    queryKey: ["/api/avatars"],
  });

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent" data-testid="text-gallery-title">
          Avatar Gallery
        </h1>
        <p className="text-gray-600 text-center mb-12">
          Explore amazing avatars created by our community
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        ) : avatars && avatars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {avatars.map((avatar) => (
              <Card key={avatar.id} className="glass-card p-4 hover-lift group" data-testid={`card-avatar-${avatar.id}`}>
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-sky-100 rounded-xl overflow-hidden mb-3">
                  <img 
                    src={avatar.urls.thumbnail} 
                    alt="Avatar"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    data-testid={`img-avatar-${avatar.id}`}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 capitalize">{avatar.request.artStyle} Style</p>
                  <p className="text-xs text-gray-400">{new Date(avatar.createdAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No avatars yet. Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
