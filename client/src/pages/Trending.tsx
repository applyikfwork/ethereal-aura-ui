import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Flame, Heart, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Avatar } from '@shared/schema';

export default function Trending() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'trending' | 'featured'>('trending');

  const { data: avatars = [], isLoading } = useQuery<Avatar[]>({
    queryKey: [filter === 'trending' ? '/api/avatars/trending' : '/api/avatars/featured'],
  });

  const likeMutation = useMutation({
    mutationFn: async ({ avatarId, action }: { avatarId: string; action: 'like' | 'unlike' }) => {
      return await apiRequest(`/api/avatars/${avatarId}/${action}`, {
        method: 'POST',
        body: { userId: userData?.uid },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/avatars/trending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/avatars/featured'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update like',
        variant: 'destructive',
      });
    },
  });

  const handleLike = (avatar: Avatar) => {
    if (!userData?.uid) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to like avatars',
        variant: 'destructive',
      });
      return;
    }

    const isLiked = avatar.likedBy?.includes(userData.uid);
    likeMutation.mutate({
      avatarId: avatar.id,
      action: isLiked ? 'unlike' : 'like',
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-sky-500 mb-6 glow-lavender">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent" data-testid="text-trending-title">
            Trending Avatars
          </h1>
          <p className="text-gray-600 text-lg">
            Discover the most popular and featured avatars from our community
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="trending" className="gap-2" data-testid="tab-trending">
              <Flame className="w-4 h-4" />
              Trending Now
            </TabsTrigger>
            <TabsTrigger value="featured" className="gap-2" data-testid="tab-featured">
              <TrendingUp className="w-4 h-4" />
              Featured
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        ) : avatars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No {filter} avatars yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {avatars.map((avatar, index) => {
              const isLiked = avatar.likedBy?.includes(userData?.uid || '');
              
              return (
                <Card 
                  key={avatar.id} 
                  className="glass-card p-4 hover-lift group relative overflow-hidden" 
                  data-testid={`card-avatar-${avatar.id}`}
                >
                  {/* Trending Badge */}
                  {filter === 'trending' && index < 3 && (
                    <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      #{index + 1}
                    </div>
                  )}

                  {/* Avatar Image */}
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-sky-100 rounded-xl overflow-hidden mb-3">
                    <img 
                      src={avatar.urls?.thumbnail || avatar.urls?.normal} 
                      alt="Avatar"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      data-testid={`img-avatar-${avatar.id}`}
                    />
                  </div>

                  {/* Avatar Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {avatar.userPhoto && (
                        <img src={avatar.userPhoto} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      <p className="text-sm font-semibold text-gray-700">
                        {avatar.userName || 'Anonymous'}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 capitalize">{avatar.request.artStyle} Style</p>

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleLike(avatar)}
                        className="flex items-center gap-1 text-sm hover:text-pink-500 transition-colors"
                        disabled={likeMutation.isPending}
                        data-testid={`button-like-${avatar.id}`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`} />
                        <span className={isLiked ? 'text-pink-500' : 'text-gray-600'}>{avatar.likes || 0}</span>
                      </button>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Share2 className="w-4 h-4" />
                        <span>{avatar.shares || 0}</span>
                      </div>
                    </div>

                    {/* Hashtags */}
                    {avatar.hashtags && avatar.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {avatar.hashtags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
