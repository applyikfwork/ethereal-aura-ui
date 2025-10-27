import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

export default function Premium() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-sky-500 mb-6 glow-lavender">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent" data-testid="text-premium-title">
            Upgrade to Aura Pro
          </h1>
          <p className="text-gray-600 text-lg">
            Unlock unlimited creativity with premium features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <Card className="glass-card p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 text-gray-800">Free</h3>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                $0
                <span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <p className="text-gray-600">Perfect for trying out Aura</p>
            </div>

            <ul className="space-y-3 mb-8">
              <Feature>3 avatar generations per day</Feature>
              <Feature>512px resolution</Feature>
              <Feature>Basic styles</Feature>
              <Feature>Watermarked downloads</Feature>
            </ul>

            <Link href="/creator">
              <Button 
                variant="outline" 
                className="w-full py-6 rounded-full bg-white hover:bg-purple-50 border-2 border-purple-200"
                data-testid="button-free-plan"
              >
                Get Started Free
              </Button>
            </Link>
          </Card>

          {/* Premium Plan */}
          <Card className="glass-card p-8 relative overflow-hidden border-4 border-purple-300">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-sky-500 text-white text-xs font-bold">
                POPULAR
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent">
                Premium
              </h3>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                $20
                <span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              <p className="text-gray-600">For professional creators</p>
            </div>

            <ul className="space-y-3 mb-8">
              <Feature premium>Unlimited avatar generations</Feature>
              <Feature premium>Up to 2048px HD resolution</Feature>
              <Feature premium>All artistic styles</Feature>
              <Feature premium>Stylized glow & particle effects</Feature>
              <Feature premium>No watermark</Feature>
              <Feature premium>Commercial license</Feature>
              <Feature premium>Priority support</Feature>
            </ul>

            <Button 
              className="w-full py-6 rounded-full bg-gradient-to-r from-purple-500 to-sky-500 hover:from-purple-600 hover:to-sky-600 glow-lavender"
              data-testid="button-upgrade-premium"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Upgrade Now
            </Button>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <BenefitCard
            icon={<Zap className="w-8 h-8 text-purple-500" />}
            title="Lightning Fast"
            description="Generate avatars instantly with priority processing"
          />
          <BenefitCard
            icon={<Sparkles className="w-8 h-8 text-sky-500" />}
            title="Premium Effects"
            description="Access exclusive aura effects and styles"
          />
          <BenefitCard
            icon={<Crown className="w-8 h-8 text-pink-500" />}
            title="Commercial Use"
            description="Use your avatars for business and branding"
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ children, premium = false }: { children: React.ReactNode; premium?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${premium ? 'text-purple-500' : 'text-gray-400'}`} />
      <span className={premium ? 'text-gray-700' : 'text-gray-600'}>{children}</span>
    </li>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="glass-card p-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-sky-100 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Card>
  );
}
