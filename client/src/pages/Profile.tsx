import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, Sparkles, Camera, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db, auth } from "@/config/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Avatar, User } from "@shared/schema";

function ProfilePage() {
  const { toast } = useToast();
  const { userData, user: authUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use Firebase user data from AuthContext
  const user = userData;

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser || !userData) return;

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-pictures/${userData.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Update Firebase Auth profile
      await updateProfile(authUser, { photoURL });

      // Update Firestore user document
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, { photoURL });

      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been successfully updated.",
      });

      // Refresh the page to show new profile picture
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Fetch user's avatars
  const { data: avatars, isLoading: avatarsLoading } = useQuery<Avatar[]>({
    queryKey: ["/api/avatars/user", userData?.uid],
    enabled: !!userData?.uid,
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/user/${userData?.uid}/upgrade`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "🎉 Upgraded to Premium!",
        description: "You now have unlimited avatar generations!",
      });
    },
  });

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
              <div className="relative group">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-purple-200"
                    data-testid="img-profile-picture"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-sky-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-purple-200">
                    {(user?.displayName || user?.email)?.charAt(0) || 'U'}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-all group-hover:scale-110 disabled:opacity-50"
                  data-testid="button-upload-profile-pic"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  data-testid="input-profile-picture"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800" data-testid="text-username">{user?.displayName || user?.email}</h2>
                <p className="text-gray-600" data-testid="text-user-email">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Click camera icon to update photo</p>
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

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
