import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Avatar, User } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user/demo"],
  });

  // Fetch user's avatars
  const { data: avatars, isLoading: avatarsLoading } = useQuery<Avatar[]>({
    queryKey: ["/api/avatars/user", "demo"],
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/user/demo/upgrade", {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "🎉 Upgraded to Premium!",
        description: "You now have unlimited avatar generations!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/demo"] });
    },
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent" data-testid="text-profile-title">
          My Profile
        </h1>

        {/* User Info Card */}
        <Card className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-sky-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800" data-testid="text-username">{user?.name}</h2>
                <p className="text-gray-600" data-testid="text-user-email">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user?.isPremium ? (
                <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-sky-500 text-white glow-lavender">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold" data-testid="text-premium-badge">Premium</span>
                </div>
              ) : (
                <>
                  <div className="text-center px-6 py-3 rounded-full bg-white/70">
                    <p className="text-2xl font-bold text-purple-600" data-testid="text-credits">{user?.credits}</p>
                    <p className="text-xs text-gray-600">Credits Left</p>
                  </div>
                  <Button
                    onClick={() => upgradeMutation.mutate()}
                    disabled={upgradeMutation.isPending}
                    className="px-6 py-6 rounded-full bg-gradient-to-r from-purple-500 to-sky-500 hover:from-purple-600 hover:to-sky-600 glow-lavender"
                    data-testid="button-upgrade"
                  >
                    {upgradeMutation.isPending ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    Upgrade to Pro
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Avatars Grid */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">My Avatars</h2>
        </div>

        {avatarsLoading ? (
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
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700 capitalize">{avatar.request.artStyle}</p>
                  <p className="text-xs text-gray-500">{new Date(avatar.createdAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-glow" />
            <p className="text-gray-600 text-lg mb-4">You haven't created any avatars yet</p>
            <Button 
              onClick={() => window.location.href = "/creator"}
              className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-500 to-sky-500 hover:from-purple-600 hover:to-sky-600 glow-lavender"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your First Avatar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
