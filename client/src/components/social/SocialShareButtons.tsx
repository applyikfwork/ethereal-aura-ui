import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Heart, MessageCircle, Copy } from 'lucide-react';
import { SiInstagram, SiTwitter, SiFacebook, SiTiktok } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SocialShareButtonsProps {
  avatarId: string;
  imageUrl: string;
  hashtags?: string[];
  likes: number;
  shares: number;
  comments: number;
  isLiked: boolean;
  userId?: string;
  onLike?: () => void;
  onShare?: () => void;
  onComment?: () => void;
}

export function SocialShareButtons({
  avatarId,
  imageUrl,
  hashtags = [],
  likes,
  shares,
  comments,
  isLiked,
  userId,
  onLike,
  onShare,
  onComment,
}: SocialShareButtonsProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const hashtagString = hashtags.join(' ');

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my AI Avatar!',
          text: `Created with Aura Avatar Studio ${hashtagString}`,
          url: window.location.origin + '/gallery',
        });
        onShare?.();
        
        // Track share on backend
        if (userId) {
          await apiRequest(`/api/avatars/${avatarId}/share`, {
            method: 'POST',
            body: { userId },
          });
        }
      } catch (error) {
        console.log('Share cancelled or failed', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/gallery`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied!',
      description: 'Share link copied to clipboard',
    });
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar-${avatarId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Download started',
        description: 'Your avatar is being downloaded',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download avatar',
        variant: 'destructive',
      });
    }
  };

  const openSocialPlatform = async (platform: string) => {
    setIsSharing(true);
    const text = `Check out my AI avatar! ${hashtagString}`;
    const url = window.location.origin + '/gallery';
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        // Download image and show instructions
        await handleDownloadImage();
        toast({
          title: 'Share to Instagram',
          description: 'Image downloaded! Open Instagram and upload from your gallery.',
        });
        setIsSharing(false);
        return;
      case 'tiktok':
        toast({
          title: 'Share to TikTok',
          description: 'Download the image and upload to TikTok with your creative content!',
        });
        await handleDownloadImage();
        setIsSharing(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      onShare?.();
      
      // Track share
      if (userId) {
        await apiRequest(`/api/avatars/${avatarId}/share`, {
          method: 'POST',
          body: { userId },
        });
      }
    }
    
    setIsSharing(false);
  };

  return (
    <div className="space-y-4">
      {/* Engagement Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <button 
          onClick={onLike}
          className="flex items-center gap-1 hover:text-pink-500 transition-colors"
          data-testid="button-like"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
          <span>{likes}</span>
        </button>
        <button 
          onClick={onComment}
          className="flex items-center gap-1 hover:text-purple-500 transition-colors"
          data-testid="button-comment"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments}</span>
        </button>
        <div className="flex items-center gap-1">
          <Share2 className="w-4 h-4" />
          <span>{shares}</span>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Button
          onClick={() => openSocialPlatform('instagram')}
          variant="outline"
          className="gap-2"
          disabled={isSharing}
          data-testid="button-share-instagram"
        >
          <SiInstagram className="w-4 h-4" />
          Instagram
        </Button>
        <Button
          onClick={() => openSocialPlatform('twitter')}
          variant="outline"
          className="gap-2"
          disabled={isSharing}
          data-testid="button-share-twitter"
        >
          <SiTwitter className="w-4 h-4" />
          Twitter
        </Button>
        <Button
          onClick={() => openSocialPlatform('facebook')}
          variant="outline"
          className="gap-2"
          disabled={isSharing}
          data-testid="button-share-facebook"
        >
          <SiFacebook className="w-4 h-4" />
          Facebook
        </Button>
        <Button
          onClick={() => openSocialPlatform('tiktok')}
          variant="outline"
          className="gap-2"
          disabled={isSharing}
          data-testid="button-share-tiktok"
        >
          <SiTiktok className="w-4 h-4" />
          TikTok
        </Button>
        <Button
          onClick={handleWebShare}
          variant="outline"
          className="gap-2"
          data-testid="button-share-web"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="gap-2"
          data-testid="button-copy-link"
        >
          <Copy className="w-4 h-4" />
          Copy Link
        </Button>
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.slice(0, 8).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700"
              data-testid={`hashtag-${index}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Download Button */}
      <Button
        onClick={handleDownloadImage}
        variant="default"
        className="w-full gap-2 bg-gradient-to-r from-purple-500 to-sky-500"
        data-testid="button-download"
      >
        <Download className="w-4 h-4" />
        Download Avatar
      </Button>
    </div>
  );
}
