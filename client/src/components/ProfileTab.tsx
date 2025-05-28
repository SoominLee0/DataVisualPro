import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const BADGE_DATA = [
  { emoji: '🔥', name: '불타는 열정', condition: '연속 3일 달성' },
  { emoji: '💪', name: '근력왕', condition: '근력 챌린지 5회 완료' },
  { emoji: '⭐', name: '스타플레이어', condition: '그룹 1위 달성' },
  { emoji: '🎯', name: '목표달성', condition: '주간 목표 달성' },
  { emoji: '📅', name: '7일 연속', condition: '7일 연속 챌린지 완료' },
  { emoji: '🏆', name: '챔피언', condition: '월간 1위 달성' },
  { emoji: '👑', name: '킹', condition: '모든 업적 달성' },
];

export function ProfileTab() {
  const { user, signOut } = useAuth();

  const getUserBadges = () => {
    if (!user?.badges) return [];
    
    // In a real app, you'd match badge IDs to badge data
    // For MVP, show badges based on user achievements
    const earnedBadges = [];
    
    if (user.currentStreak >= 3) earnedBadges.push(BADGE_DATA[0]); // 불타는 열정
    if (user.totalChallenges >= 5) earnedBadges.push(BADGE_DATA[1]); // 근력왕
    if (user.currentStreak >= 7) earnedBadges.push(BADGE_DATA[4]); // 7일 연속
    if (user.totalPoints >= 1000) earnedBadges.push(BADGE_DATA[2]); // 스타플레이어
    
    return earnedBadges;
  };

  const getSuccessRate = () => {
    if (!user || user.totalChallenges === 0) return 0;
    return Math.round((user.totalPoints / (user.totalChallenges * 100)) * 100);
  };

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-secondary px-4 py-8 text-white">
        <div className="text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold">
              {user?.name?.charAt(0) || '?'}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{user?.name || 'User'}</h1>
          <p className="opacity-90">{user?.email}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-primary mb-2">
              {user?.totalChallenges || 0}
            </div>
            <div className="text-sm text-neutral-500">완료한 챌린지</div>
          </Card>
          <Card className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-success mb-2">
              {getSuccessRate()}%
            </div>
            <div className="text-sm text-neutral-500">성공률</div>
          </Card>
          <Card className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-warning mb-2">
              {user?.longestStreak || 0}
            </div>
            <div className="text-sm text-neutral-500">최장 연속</div>
          </Card>
          <Card className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-secondary mb-2">
              {getUserBadges().length}
            </div>
            <div className="text-sm text-neutral-500">획득 배지</div>
          </Card>
        </div>

        {/* Achievement Badges */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-neutral-600 mb-4">획득한 배지</h3>
          <Card className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-4 gap-4">
              {BADGE_DATA.map((badge, index) => {
                const isEarned = getUserBadges().some(earned => earned.name === badge.name);
                return (
                  <div key={index} className={`text-center ${!isEarned ? 'opacity-30' : ''}`}>
                    <div className="text-3xl mb-2">{badge.emoji}</div>
                    <div className="text-xs text-neutral-500">{badge.name}</div>
                  </div>
                );
              })}
              <div className="text-center opacity-30">
                <div className="text-3xl mb-2">🎖️</div>
                <div className="text-xs text-neutral-400">잠금됨</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-neutral-600 mb-4">설정</h3>
          
          <Button
            variant="ghost"
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-bell text-primary"></i>
              <span className="font-medium text-neutral-600">알림 설정</span>
            </div>
            <i className="fas fa-chevron-right text-neutral-400"></i>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-shield-alt text-primary"></i>
              <span className="font-medium text-neutral-600">개인정보 설정</span>
            </div>
            <i className="fas fa-chevron-right text-neutral-400"></i>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-question-circle text-primary"></i>
              <span className="font-medium text-neutral-600">도움말</span>
            </div>
            <i className="fas fa-chevron-right text-neutral-400"></i>
          </Button>
          
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full bg-white rounded-xl p-4 flex items-center justify-center shadow-sm text-red-500 font-medium hover:bg-red-50"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}
