import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useChallenges } from '@/hooks/useChallenges';
import { Challenge } from '@shared/schema';

interface HomeTabProps {
  onStartChallenge: (challenge: Challenge) => void;
}

export function HomeTab({ onStartChallenge }: HomeTabProps) {
  const { user } = useAuth();
  const { getChallengeByDay, getUserSubmissions } = useChallenges();
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTodayChallenge();
      checkTodaySubmission();
    }
  }, [user]);

  const loadTodayChallenge = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const challenge = await getChallengeByDay(user.currentDay);
      setTodayChallenge(challenge);
    } catch (error) {
      console.error('Failed to load today\'s challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodaySubmission = async () => {
    if (!user) return;
    
    try {
      const submissions = await getUserSubmissions(user.id);
      const today = new Date().toDateString();
      const todaySubmission = submissions.find(sub => 
        new Date(sub.createdAt).toDateString() === today
      );
      setHasSubmittedToday(!!todaySubmission);
    } catch (error) {
      console.error('Failed to check today\'s submission:', error);
    }
  };

  const getWeekProgress = () => {
    if (!user) return Array(7).fill(false);
    
    // Mock week progress based on current streak
    const progress = Array(7).fill(false);
    for (let i = 0; i < Math.min(user.currentStreak, 7); i++) {
      progress[i] = true;
    }
    return progress;
  };

  if (loading) {
    return (
      <div className="pb-20 px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-600">안녕하세요! 👋</h1>
            <p className="text-neutral-500">{user?.name}님</p>
          </div>
          <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-full">
            <i className="fas fa-fire text-white text-xl"></i>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-primary">{user?.currentStreak || 0}</div>
            <div className="text-xs text-neutral-500">연속 일수</div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-success">{user?.totalPoints || 0}</div>
            <div className="text-xs text-neutral-500">포인트</div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-warning">{user?.currentDay || 1}</div>
            <div className="text-xs text-neutral-500">일차</div>
          </div>
        </div>
      </div>

      {/* Today's Challenge */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-600">오늘의 챌린지</h2>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            Day {user?.currentDay || 1}
          </span>
        </div>
        
        {todayChallenge ? (
          <Card className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="relative">
              {/* Challenge video thumbnail */}
              <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <iframe 
                  className="w-full h-full" 
                  src={todayChallenge.videoUrl}
                  title="Challenge Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-neutral-600 mb-2">
                  {todayChallenge.title}
                </h3>
                <p className="text-neutral-500 text-sm mb-4">
                  {todayChallenge.description}
                </p>
                
                {/* Challenge Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-neutral-500">
                    <i className="fas fa-clock"></i>
                    <span>{todayChallenge.duration} 소요</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-400">난이도:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < todayChallenge.difficulty ? 'bg-success' : 'bg-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ) : (
          <Card className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center text-neutral-500">
              <i className="fas fa-clock text-4xl mb-4"></i>
              <p>오늘의 챌린지를 준비 중입니다...</p>
            </div>
          </Card>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {hasSubmittedToday ? (
            <Button 
              disabled
              className="w-full bg-success text-white rounded-xl p-4 font-semibold text-lg shadow-lg"
            >
              <i className="fas fa-check mr-2"></i>
              오늘 챌린지 완료!
            </Button>
          ) : (
            <Button 
              onClick={() => todayChallenge && onStartChallenge(todayChallenge)}
              disabled={!todayChallenge}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-4 font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <i className="fas fa-play mr-2"></i>
              챌린지 시작하기
            </Button>
          )}
        </div>
      </div>

      {/* Week Progress */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold text-neutral-600 mb-4">이번 주 진행상황</h3>
        <Card className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-neutral-600">주간 진행도</span>
            <span className="text-sm text-neutral-500">
              {getWeekProgress().filter(Boolean).length}/7 완료
            </span>
          </div>
          <div className="flex space-x-2 mb-2">
            {getWeekProgress().map((completed, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  completed ? 'bg-success' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
