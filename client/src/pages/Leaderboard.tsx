import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Heart, Share2, Image as ImageIcon } from 'lucide-react';
import type { LeaderboardEntry } from '@shared/schema';

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-orange-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getCardClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'glass-card p-6 border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50';
      case 2:
        return 'glass-card p-6 border-4 border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50';
      case 3:
        return 'glass-card p-6 border-4 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50';
      default:
        return 'glass-card p-6';
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-sky-500 mb-6 glow-lavender">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-sky-600 bg-clip-text text-transparent" data-testid="text-leaderboard-title">
            Creator Leaderboard
          </h1>
          <p className="text-gray-600 text-lg">
            Top creators ranked by community engagement
          </p>
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No rankings yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <Card 
                key={entry.userId} 
                className={getCardClass(entry.rank)}
                data-testid={`leaderboard-entry-${entry.rank}`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    {getMedalIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={entry.userPhoto} />
                      <AvatarFallback className="text-xl">
                        {entry.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{entry.userName}</h3>
                      <p className="text-sm text-gray-600">Rank #{entry.rank}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="flex items-center gap-1 justify-center mb-1">
                        <Heart className="w-5 h-5 text-pink-500" />
                        <span className="font-bold text-lg">{entry.totalLikes}</span>
                      </div>
                      <p className="text-xs text-gray-600">Likes</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 justify-center mb-1">
                        <Share2 className="w-5 h-5 text-purple-500" />
                        <span className="font-bold text-lg">{entry.totalShares}</span>
                      </div>
                      <p className="text-xs text-gray-600">Shares</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 justify-center mb-1">
                        <ImageIcon className="w-5 h-5 text-sky-500" />
                        <span className="font-bold text-lg">{entry.totalAvatars}</span>
                      </div>
                      <p className="text-xs text-gray-600">Avatars</p>
                    </div>
                  </div>
                </div>

                {/* Special badges for top 3 */}
                {entry.rank <= 3 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {entry.rank === 1 && (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                          🏆 Top Creator
                        </span>
                      )}
                      {entry.rank === 2 && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                          🥈 Rising Star
                        </span>
                      )}
                      {entry.rank === 3 && (
                        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                          🥉 Community Favorite
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
