import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Check, Sparkles, Zap, Infinity } from "lucide-react";

const features = [
  { icon: Infinity, text: "Unlimited avatar generations" },
  { icon: Zap, text: "2048px ultra high-resolution output" },
  { icon: Sparkles, text: "Exclusive stylized glow effects" },
  { icon: Crown, text: "Priority generation (2x faster)" },
  { icon: Check, text: "No watermarks on downloads" },
  { icon: Check, text: "Early access to new features" },
];

export default function Premium() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 animate-shimmer">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">Aura+ Premium</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-light tracking-tight">
            <span className="block mb-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Unlock Your Full Potential
            </span>
          </h1>

          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Get unlimited access to all features and create stunning avatars without limits
          </p>
        </div>

        <Card className="glass-card p-8 md:p-12 text-center space-y-8">
          <div className="inline-block">
            <div className="text-6xl font-bold bg-gradient-to-r from-lavender via-primary to-sky-bright bg-clip-text text-transparent">
              $20
            </div>
            <p className="text-muted-foreground mt-2">per month</p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 text-left"
                  data-testid={`feature-${index}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lavender to-sky flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-foreground">{feature.text}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-6">
            <Button
              variant="hero"
              size="lg"
              className="w-full md:w-auto px-12"
              data-testid="button-subscribe"
            >
              <Crown className="w-5 h-5" />
              Subscribe to Aura+
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Cancel anytime. No long-term commitment.
            </p>
          </div>
        </Card>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold mb-6">Free vs Premium</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card p-6">
              <h4 className="text-lg font-semibold mb-4">Free Plan</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>3 avatars per day</li>
                <li>512px resolution</li>
                <li>Watermark on downloads</li>
                <li>Standard generation speed</li>
              </ul>
            </Card>

            <Card className="glass-card p-6 bg-gradient-to-br from-lavender/10 to-sky/10 border-2 border-lavender/50">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Premium Plan
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lavender" />
                  Unlimited avatars
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lavender" />
                  Up to 2048px resolution
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lavender" />
                  No watermarks
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lavender" />
                  2x faster generation
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
