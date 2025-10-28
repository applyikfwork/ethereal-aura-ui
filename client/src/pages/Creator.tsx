import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Sparkles, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import type { AvatarRequest, Avatar, User } from "@shared/schema";

function CreatorPage() {
  const { toast } = useToast();
  const { userData } = useAuth();
  const [creationMode, setCreationMode] = useState<'custom' | 'photo'>('custom');
  const [uploadedImage, setUploadedImage] = useState<{file: File, url: string} | null>(null);
  const [formData, setFormData] = useState<Partial<AvatarRequest>>({
    userId: "demo",
    gender: "female",
    age: "young-adult",
    ethnicity: "mixed",
    hairStyle: "long wavy",
    hairColor: "brown",
    outfit: "casual modern",
    accessories: [],
    background: "gradient",
    artStyle: "realistic",
    auraEffect: "light-glow",
    pose: "three-quarter",
    size: "512",
  });

  const [generatedAvatar, setGeneratedAvatar] = useState<Avatar | null>(null);

  // Use Firebase user data from AuthContext
  const user = userData;

  // Generate avatar mutation
  const generateMutation = useMutation({
    mutationFn: async (request: AvatarRequest) => {
      console.log("Generating avatar with request:", request);
      toast({
        title: "🎨 Starting Generation",
        description: "Creating your avatar... This may take a moment.",
      });
      
      return await apiRequest("/api/avatars/generate", {
        method: "POST",
        body: { ...request, userId: userData?.uid || "demo" },
      });
    },
    onSuccess: (data) => {
      console.log("Avatar generation successful:", data);
      setGeneratedAvatar(data.avatar);
      toast({
        title: "✨ Avatar Created Successfully!",
        description: `Credits remaining: ${data.creditsRemaining}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/avatars"] });
      if (userData?.uid) {
        queryClient.invalidateQueries({ queryKey: ["/api/avatars/user", userData.uid] });
      }
    },
    onError: (error: any) => {
      console.error("Avatar generation error:", error);
      let errorMessage = "Failed to generate avatar. Please try again.";
      
      // Try to parse error message from response
      try {
        const errorText = error.message || error.toString();
        if (errorText.includes("403")) {
          errorMessage = "Not enough credits. Please upgrade to premium!";
        } else if (errorText.includes("404")) {
          errorMessage = "User not found. Please try again.";
        } else if (errorText.includes("500")) {
          errorMessage = "Server error. Our AI is taking a break. Please try again in a moment.";
        } else if (errorText.includes("error")) {
          // Extract error message after the status code
          const match = errorText.match(/\d{3}:\s*(.+)/);
          if (match) {
            errorMessage = match[1];
          }
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
      }
      
      toast({
        title: "⚠️ Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (creationMode === 'photo' && !uploadedImage) {
      toast({
        title: "⚠️ No image uploaded",
        description: "Please upload a photo to transform into an avatar",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratedAvatar(null); // Clear previous avatar
    generateMutation.mutate(formData as AvatarRequest);
  };

  const handleDownload = () => {
    if (generatedAvatar) {
      window.open(generatedAvatar.urls.normal, "_blank");
      toast({
        title: "Downloading...",
        description: "Your avatar is being downloaded!",
      });
    }
  };

  const handleImageSelected = (file: File, croppedUrl: string) => {
    setUploadedImage({ file, url: croppedUrl });
    setFormData({ ...formData, uploadedImageUrl: croppedUrl });
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent" data-testid="text-creator-title">
          Create Your Aura Avatar
        </h1>
        <p className="text-gray-600 text-center mb-12" data-testid="text-credits-remaining">
          {user ? `${user.isPremium ? 'Unlimited' : user.credits} credits remaining` : 'Loading...'}
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Customization Options */}
          <div className="space-y-6">
            <Tabs value={creationMode} onValueChange={(value) => setCreationMode(value as 'custom' | 'photo')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="custom" data-testid="tab-custom-avatar">Custom Avatar</TabsTrigger>
                <TabsTrigger value="photo" data-testid="tab-photo-avatar">Photo-Based</TabsTrigger>
              </TabsList>

              <TabsContent value="custom" className="space-y-6">
                <Card className="glass-card p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Customize Your Avatar</h2>

                  <div className="space-y-4">
                <FormField label="Gender" testId="select-gender">
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value as any })}>
                    <SelectTrigger data-testid="input-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-Binary</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Age" testId="select-age">
                  <Select value={formData.age} onValueChange={(value) => setFormData({ ...formData, age: value as any })}>
                    <SelectTrigger data-testid="input-age">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="teen">Teen</SelectItem>
                      <SelectItem value="young-adult">Young Adult</SelectItem>
                      <SelectItem value="adult">Adult</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Ethnicity" testId="input-ethnicity">
                  <Input 
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                    placeholder="e.g., mixed, caucasian, asian, african"
                    data-testid="input-ethnicity"
                  />
                </FormField>

                <FormField label="Hair Style" testId="input-hair-style">
                  <Input 
                    value={formData.hairStyle}
                    onChange={(e) => setFormData({ ...formData, hairStyle: e.target.value })}
                    placeholder="e.g., long wavy, short curly"
                    data-testid="input-hair-style"
                  />
                </FormField>

                <FormField label="Hair Color" testId="input-hair-color">
                  <Input 
                    value={formData.hairColor}
                    onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                    placeholder="e.g., brown, blonde, black"
                    data-testid="input-hair-color"
                  />
                </FormField>

                <FormField label="Outfit" testId="input-outfit">
                  <Input 
                    value={formData.outfit}
                    onChange={(e) => setFormData({ ...formData, outfit: e.target.value })}
                    placeholder="e.g., casual modern, business suit, fantasy armor"
                    data-testid="input-outfit"
                  />
                </FormField>

                <FormField label="Pose" testId="select-pose">
                  <Select value={formData.pose} onValueChange={(value) => setFormData({ ...formData, pose: value as any })}>
                    <SelectTrigger data-testid="input-pose">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="front">Front View</SelectItem>
                      <SelectItem value="three-quarter">Three-Quarter View</SelectItem>
                      <SelectItem value="side">Side Profile</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Art Style" testId="select-art-style">
                  <Select value={formData.artStyle} onValueChange={(value) => setFormData({ ...formData, artStyle: value as any })}>
                    <SelectTrigger data-testid="input-art-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="anime">Anime</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Aura Effect" testId="select-aura-effect">
                  <Select value={formData.auraEffect} onValueChange={(value) => setFormData({ ...formData, auraEffect: value as any })}>
                    <SelectTrigger data-testid="input-aura-effect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light-glow">Light Glow</SelectItem>
                      <SelectItem value="holographic">Holographic</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Background" testId="select-background">
                  <Select value={formData.background} onValueChange={(value) => setFormData({ ...formData, background: value as any })}>
                    <SelectTrigger data-testid="input-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="transparent">Transparent</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Size" testId="select-size">
                  <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value as any })}>
                    <SelectTrigger data-testid="input-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512">512px (Free)</SelectItem>
                      <SelectItem value="1024">1024px (Premium)</SelectItem>
                      <SelectItem value="2048">2048px (Premium)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Custom Prompt (Optional)" testId="input-custom-prompt">
                  <Input 
                    value={formData.customPrompt || ''}
                    onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                    placeholder="Describe your avatar in detail..."
                    data-testid="input-custom-prompt"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Override all settings with a custom description
                  </p>
                </FormField>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="photo" className="space-y-6">
            <ImageUpload 
              onImageSelected={handleImageSelected}
              currentImage={uploadedImage?.url}
            />
            
            {uploadedImage && (
              <Card className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Transformation Style</h3>
                <div className="space-y-4">
                  <FormField label="Art Style" testId="select-photo-art-style">
                    <Select value={formData.artStyle} onValueChange={(value) => setFormData({ ...formData, artStyle: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="fantasy">Fantasy</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Background" testId="select-photo-background">
                    <Select value={formData.background} onValueChange={(value) => setFormData({ ...formData, background: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="transparent">Transparent</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Aura Effect" testId="select-photo-aura">
                    <Select value={formData.auraEffect} onValueChange={(value) => setFormData({ ...formData, auraEffect: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light-glow">Light Glow</SelectItem>
                        <SelectItem value="holographic">Holographic</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

          {/* Right Panel - Preview & Actions */}
          <div className="space-y-6">
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Preview</h2>

              <div className="aspect-square bg-gradient-to-br from-purple-100 to-sky-100 rounded-2xl overflow-hidden mb-6 relative">
                {generateMutation.isPending ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-4" />
                    <p className="text-purple-700 font-medium animate-pulse">Breathing life into your Aura...</p>
                  </div>
                ) : generatedAvatar ? (
                  <img 
                    src={generatedAvatar.urls.normal} 
                    alt="Generated Avatar"
                    className="w-full h-full object-cover"
                    data-testid="img-generated-avatar"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-24 h-24 text-purple-400 animate-glow" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full py-6 rounded-full bg-gradient-to-r from-purple-500 to-sky-500 hover:from-purple-600 hover:to-sky-600 glow-lavender"
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  Generate Avatar
                </Button>

                {generatedAvatar && (
                  <>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full py-6 rounded-full bg-white hover:bg-purple-50 border-2 border-purple-200"
                      data-testid="button-download"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      className="w-full py-6 rounded-full bg-white hover:bg-sky-50 border-2 border-sky-200"
                      data-testid="button-regenerate"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Regenerate
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, testId }: { label: string; children: React.ReactNode; testId?: string }) {
  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-2 block" data-testid={testId}>{label}</Label>
      {children}
    </div>
  );
}

export default function Creator() {
  return <CreatorPage />;
}
