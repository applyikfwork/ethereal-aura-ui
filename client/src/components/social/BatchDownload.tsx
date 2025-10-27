import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BatchDownloadProps {
  avatarId: string;
  isPremium?: boolean;
}

export function BatchDownload({ avatarId, isPremium }: BatchDownloadProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBatchDownload = async () => {
    if (!isPremium) {
      toast({
        title: 'Premium Feature',
        description: 'Batch download is available for premium users only',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    try {
      // Get all download URLs from backend
      const data: any = await apiRequest(`/api/avatars/${avatarId}/download-all`, {
        method: 'GET',
      });

      const { urls, filename } = data;

      // Download each size
      const sizes = [
        { name: 'Profile (400x400)', url: urls.profile, suffix: 'profile' },
        { name: 'Story (1080x1920)', url: urls.story, suffix: 'story' },
        { name: 'Post (1080x1080)', url: urls.post, suffix: 'post' },
        { name: 'HD (2048x2048)', url: urls.hd, suffix: 'hd' },
      ];

      for (const size of sizes) {
        if (!size.url) continue;
        
        try {
          const response = await fetch(size.url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}-${size.suffix}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to download ${size.name}:`, error);
        }
      }

      toast({
        title: 'Batch download complete!',
        description: 'All avatar sizes have been downloaded',
      });
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download avatars',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleBatchDownload}
      variant="outline"
      className="w-full gap-2"
      disabled={isDownloading}
      data-testid="button-batch-download"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download All Sizes
          {isPremium && <span className="text-xs text-purple-600">(Premium)</span>}
        </>
      )}
    </Button>
  );
}
