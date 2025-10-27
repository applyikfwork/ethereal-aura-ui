import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Showcase = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lavender-light/10 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-lavender animate-pulse" />
              <span className="text-sm font-medium text-foreground">Premium Experience</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-light tracking-tight">
              <span className="block mb-2 font-extralight text-foreground">
                Designed for
              </span>
              <span className="block font-semibold bg-gradient-to-r from-primary via-lavender to-sky-bright bg-clip-text text-transparent">
                Excellence
              </span>
            </h2>

            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
              Every element is crafted with precision. From glassmorphic cards to smooth animations, 
              experience a design that feels alive and premium.
            </p>

            <div className="space-y-4">
              {[
                "Glassmorphism & Neumorphism effects",
                "Fluid motion with micro-animations",
                "Generous spacing with floating cards",
                "Premium feel with calm aesthetics",
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-lavender to-primary" />
                  <span className="text-foreground font-light">{item}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" className="group mt-6">
              Learn More
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right side - Visual showcase */}
          <div className="relative">
            <div className="relative glass-card p-8 hover-lift">
              {/* Main card */}
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 glow-lavender">
                  <div className="h-4 bg-gradient-to-r from-lavender to-sky rounded-full w-3/4 animate-shimmer" />
                  <div className="h-4 bg-gradient-to-r from-pink-light to-lavender rounded-full w-1/2 mt-3 animate-shimmer" style={{ animationDelay: '0.5s' }} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-2xl p-4 glow-pink hover-lift">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-light to-lavender mb-3" />
                    <div className="h-3 bg-gradient-to-r from-lavender to-primary rounded-full w-full" />
                  </div>
                  <div className="glass rounded-2xl p-4 glow-pink hover-lift" style={{ animationDelay: '0.2s' }}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky to-sky-bright mb-3" />
                    <div className="h-3 bg-gradient-to-r from-sky to-lavender rounded-full w-full" />
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 glow-lavender">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-light to-pink-glow" />
                    <div className="flex-1">
                      <div className="h-3 bg-gradient-to-r from-lavender to-sky rounded-full w-2/3 mb-2" />
                      <div className="h-2 bg-gradient-to-r from-pink-light to-lavender rounded-full w-1/3" />
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-br from-lavender-light/20 to-sky/20 rounded-xl" />
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-lavender-light to-lavender rounded-2xl glow-lavender animate-float opacity-80" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-pink-light to-pink-glow rounded-2xl glow-pink animate-float opacity-80" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
