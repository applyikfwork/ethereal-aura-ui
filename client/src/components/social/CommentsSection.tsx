import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Comment } from '@shared/schema';

interface CommentsSectionProps {
  avatarId: string;
  userId?: string;
  userName?: string;
  userPhoto?: string;
}

export function CommentsSection({ avatarId, userId, userName, userPhoto }: CommentsSectionProps) {
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/avatars/${avatarId}/comments`],
  });

  const createCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest(`/api/avatars/${avatarId}/comments`, {
        method: 'POST',
        body: { userId, text },
      });
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: [`/api/avatars/${avatarId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ['/api/avatars'] });
      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to post comment',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    if (!userId) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to comment',
        variant: 'destructive',
      });
      return;
    }
    createCommentMutation.mutate(commentText);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 font-semibold">
        <MessageCircle className="w-5 h-5" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Add Comment */}
      {userId && (
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={userPhoto} />
            <AvatarFallback>{userName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px] resize-none"
              data-testid="textarea-comment"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || createCommentMutation.isPending}
              size="sm"
              className="gap-2"
              data-testid="button-post-comment"
            >
              <Send className="w-4 h-4" />
              Post Comment
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-3" data-testid={`comment-${comment.id}`}>
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.userPhoto} />
                  <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
