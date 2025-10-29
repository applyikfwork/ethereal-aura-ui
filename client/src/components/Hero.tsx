import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/80 via-lavender-light/20 to-sky/30" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lavender/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-light/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-sky/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 animate-shimmer">
            <Sparkles className="w-5 h-5 text-lavender" />
            <span className="text-sm font-medium text-foreground">
              Welcome to the Future of AI
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tight">
            <span className="block mb-2 bg-gradient-to-r from-lavender via-primary to-sky-bright bg-clip-text text-transparent font-extralight">
              Experience
            </span>
            <span className="block font-semibold bg-gradient-to-r from-primary via-lavender to-pink-glow bg-clip-text text-transparent">
              Aura
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            Your Digital Soul, Brought to Life.
            <span className="block mt-2">
              Create stunning AI avatars with magical aura effects.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="/studio">
              <Button variant="hero" size="lg" className="group" data-testid="button-create-aura">
                Create My Aura
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="/gallery">
              <Button variant="glass" size="lg" data-testid="button-explore">
                Explore Gallery
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            {[
              { value: "10k+", label: "Active Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="glass-card p-6 hover-lift"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="text-3xl font-semibold bg-gradient-to-r from-lavender to-primary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1 font-light">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-0" />
    </section>
  );
};

export default Hero;
