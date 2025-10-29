import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Wand2, Download, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AvatarGenerationParams, Avatar } from "@shared/schema";

export default function Studio() {
  const { appUser, user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<Avatar[]>([]);

  const [params, setParams] = useState<AvatarGenerationParams>({
    gender: "female",
    age: "adult",
    skinTone: "medium",
    hairStyle: "long",
    hairColor: "brown",
    outfit: "casual",
    background: "gradient",
    artStyle: "realistic",
    pose: "front",
    auraEffect: "subtle",
    resolution: "1024",
  });

  const generateMutation = useMutation({
    mutationFn: async (genParams: AvatarGenerationParams & { userId: string }) => {
      const response = await apiRequest('/api/avatars/generate', {
        method: 'POST',
        body: JSON.stringify(genParams),
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedAvatars(data.avatars);
      queryClient.invalidateQueries({ queryKey: ['/api/users', appUser?.id, 'avatars'] });
      toast({
        title: "✨ Avatars Generated!",
        description: `Successfully created ${data.avatars.length} avatars. Credits remaining: ${data.creditsRemaining}`,
      });
      setGenerating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate avatars",
        variant: "destructive",
      });
      setGenerating(false);
    },
  });

  const handleGenerate = () => {
    if (!appUser) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to generate avatars",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    generateMutation.mutate({ ...params, userId: appUser.id });
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `aura-avatar-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 animate-shimmer">
            <Sparkles className="w-5 h-5 text-lavender" />
            <span className="text-sm font-medium text-foreground">Avatar Studio</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-light tracking-tight">
            <span className="block mb-2 bg-gradient-to-r from-lavender via-primary to-sky-bright bg-clip-text text-transparent">
              Create Your Aura
            </span>
          </h1>

          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Customize every detail and generate your perfect AI avatar
          </p>

          {appUser && (
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="glass-card px-4 py-2">
                <span className="text-muted-foreground">Credits:</span>{" "}
                <span className="font-semibold text-foreground">
                  {appUser.premium ? "Unlimited ♾️" : appUser.credits}
                </span>
              </div>
              {!appUser.premium && (
                <Button variant="glass" size="sm" data-testid="button-upgrade">
                  Upgrade to Premium
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="glass-card p-6 lg:col-span-1 h-fit">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-lavender" />
              Customization
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={params.gender}
                  onValueChange={(value) => setParams({ ...params, gender: value as any })}
                >
                  <SelectTrigger id="gender" data-testid="select-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Select
                  value={params.age}
                  onValueChange={(value) => setParams({ ...params, age: value as any })}
                >
                  <SelectTrigger id="age" data-testid="select-age">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="young">Young</SelectItem>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="mature">Mature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="skinTone">Skin Tone</Label>
                <Select
                  value={params.skinTone}
                  onValueChange={(value) => setParams({ ...params, skinTone: value as any })}
                >
                  <SelectTrigger id="skinTone" data-testid="select-skinTone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="tan">Tan</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hairStyle">Hair Style</Label>
                <Select
                  value={params.hairStyle}
                  onValueChange={(value) => setParams({ ...params, hairStyle: value as any })}
                >
                  <SelectTrigger id="hairStyle" data-testid="select-hairStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="bald">Bald</SelectItem>
                    <SelectItem value="curly">Curly</SelectItem>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="wavy">Wavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hairColor">Hair Color</Label>
                <Select
                  value={params.hairColor}
                  onValueChange={(value) => setParams({ ...params, hairColor: value as any })}
                >
                  <SelectTrigger id="hairColor" data-testid="select-hairColor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="blonde">Blonde</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="grey">Grey</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="artStyle">Art Style</Label>
                <Select
                  value={params.artStyle}
                  onValueChange={(value) => setParams({ ...params, artStyle: value as any })}
                >
                  <SelectTrigger id="artStyle" data-testid="select-artStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="auraEffect">Aura Effect</Label>
                <Select
                  value={params.auraEffect}
                  onValueChange={(value) => setParams({ ...params, auraEffect: value as any })}
                >
                  <SelectTrigger id="auraEffect" data-testid="select-auraEffect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="subtle">Subtle</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="holographic">Holographic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Select
                  value={params.resolution}
                  onValueChange={(value) => setParams({ ...params, resolution: value as any })}
                >
                  <SelectTrigger id="resolution" data-testid="select-resolution">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                    <SelectItem value="2048">2048px (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full mt-6"
                variant="hero"
                size="lg"
                data-testid="button-generate"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Summoning Your Aura...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Avatar
                  </>
                )}
              </Button>
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6">Preview</h3>

              {generatedAvatars.length === 0 && !generating && (
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-lavender to-sky rounded-full flex items-center justify-center animate-glow">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-muted-foreground">
                      Your generated avatars will appear here
                    </p>
                  </div>
                </div>
              )}

              {generating && (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 mx-auto animate-spin text-lavender" />
                    <p className="text-lg font-medium">Summoning your Aura...</p>
                    <p className="text-sm text-muted-foreground">
                      This may take a moment
                    </p>
                  </div>
                </div>
              )}

              {generatedAvatars.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {generatedAvatars.map((avatar, index) => (
                    <div
                      key={avatar.id}
                      className="relative group hover-lift"
                      data-testid={`card-avatar-${index}`}
                    >
                      <img
                        src={avatar.imageUrl}
                        alt={`Generated avatar ${index + 1}`}
                        className="w-full h-auto rounded-lg"
                        data-testid={`img-avatar-${index}`}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="glass"
                          onClick={() => handleDownload(avatar.imageUrl, index)}
                          data-testid={`button-download-${index}`}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
