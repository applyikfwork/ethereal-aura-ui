import { Sparkles, Zap, Shield, Cpu } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Magic",
    description: "Experience cutting-edge artificial intelligence that adapts to your needs with elegant precision.",
    gradient: "from-lavender-light to-lavender",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with smooth transitions and instant responses for a premium feel.",
    gradient: "from-sky to-sky-bright",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade security with end-to-end encryption protecting your valuable data.",
    gradient: "from-pink-light to-pink-glow",
  },
  {
    icon: Cpu,
    title: "Smart Automation",
    description: "Intelligent workflows that save time and enhance productivity with minimal effort.",
    gradient: "from-lavender to-sky",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lavender/10 rounded-full blur-3xl animate-glow" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-light/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-light tracking-tight">
            <span className="bg-gradient-to-r from-lavender via-primary to-sky-bright bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Everything you need to create something extraordinary
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="glass-card p-8 hover-lift group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 glow-lavender`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
