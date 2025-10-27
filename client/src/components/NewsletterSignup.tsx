import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface NewsletterSignupProps {
  userId?: string;
}

export function NewsletterSignup({ userId }: NewsletterSignupProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Update user's newsletter subscription
      if (userId) {
        await apiRequest(`/api/user/${userId}`, {
          method: 'PATCH',
          body: { subscribedToNewsletter: true },
        });
      }

      setIsSubscribed(true);
      toast({
        title: '🎉 Subscribed!',
        description: 'You\'ll receive weekly avatar style drops and tips',
      });
    } catch (error: any) {
      toast({
        title: 'Subscription failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="p-6 text-center glass-card">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">You're all set!</h3>
        <p className="text-gray-600 text-sm">
          Check your inbox for weekly style drops and exclusive tips
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-sky-100">
          <Mail className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Weekly Style Drops</h3>
          <p className="text-sm text-gray-600">Get the latest avatar trends & tips</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white"
          data-testid="input-newsletter-email"
        />
        <Button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full bg-gradient-to-r from-purple-500 to-sky-500"
          data-testid="button-newsletter-submit"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Join 10,000+ creators. Unsubscribe anytime.
        </p>
      </form>
    </Card>
  );
}
