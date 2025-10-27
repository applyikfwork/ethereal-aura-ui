import { Link } from "wouter";
import { Sparkles, Zap, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }}></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-4s" }}></div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="px-6 py-2 rounded-full bg-white/60 glass-card text-sm font-medium text-purple-700">
              ✨ Create Your Own Aura Avatar Instantly
            </span>
          </div>

          <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-sky-500 bg-clip-text text-transparent animate-shimmer">
              Breathe Life
            </span>
            <br />
            <span className="text-gray-800">
              Into Your Avatar
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto" data-testid="text-hero-description">
            Transform yourself into stunning AI avatars with our magical Aura creator. 
            Choose your style, add your glow, and watch the magic happen.
          </p>

          <div className="flex gap-4 justify-center items-center flex-wrap">
            <Link href="/creator">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-purple-500 to-sky-500 hover:from-purple-600 hover:to-sky-600 glow-lavender hover-lift"
                data-testid="button-create-avatar"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create My Aura
              </Button>
            </Link>
            <Link href="/gallery">
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg rounded-full bg-white/70 hover:bg-white border-2 border-purple-200 hover:border-purple-400 hover-lift"
                data-testid="button-explore-gallery"
              >
                Explore Gallery
              </Button>
            </Link>
          </div>

          {/* Demo Avatar Preview */}
          <div className="mt-16">
            <div className="inline-block glass-card p-2 rounded-3xl hover-lift">
              <div className="relative w-64 h-64 bg-gradient-to-br from-purple-100 to-sky-100 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-sky-400/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-purple-400 animate-glow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800" data-testid="text-features-title">
            Why Choose Aura?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-purple-500" />}
              title="Lightning Fast"
              description="Generate stunning avatars in seconds with our AI-powered engine"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-sky-500" />}
              title="Fully Customizable"
              description="Control every detail from hair style to aura effects"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8 text-pink-500" />}
              title="HD Quality"
              description="Premium users get ultra-high resolution downloads"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-8 text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-sky-100 mb-4 glow-pink group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
