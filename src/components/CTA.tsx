import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lavender-light/20 to-sky/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lavender/20 rounded-full blur-3xl animate-glow" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 md:p-16 hover-lift animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-8 animate-shimmer">
              <Sparkles className="w-5 h-5 text-lavender" />
              <span className="text-sm font-medium text-foreground">
                Start Your Journey
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-5xl md:text-6xl font-light tracking-tight mb-6">
              <span className="block mb-2 font-extralight text-foreground">
                Ready to
              </span>
              <span className="block font-semibold bg-gradient-to-r from-primary via-lavender to-sky-bright bg-clip-text text-transparent">
                Transform Your Vision?
              </span>
            </h2>

            {/* Description */}
            <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-10">
              Join thousands of creators who trust Aura to bring their ideas to life with 
              premium design and powerful AI technology.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="glass" size="lg">
                Schedule a Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                          i === 1 ? 'from-lavender to-primary' :
                          i === 2 ? 'from-sky to-lavender' :
                          i === 3 ? 'from-pink-light to-lavender' :
                          'from-lavender-light to-sky'
                        } border-2 border-white`}
                      />
                    ))}
                  </div>
                  <span className="font-light">10,000+ happy users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-4 h-4 bg-gradient-to-br from-lavender to-primary rounded-sm" />
                    ))}
                  </div>
                  <span className="font-light">5-star rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
