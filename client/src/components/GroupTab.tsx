import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { Group, WeeklyRanking, User } from '@shared/schema';

export function GroupTab() {
  const { user } = useAuth();
  const { createGroup, joinGroup, getUserGroups, getGroupRanking, getGroupMembers } = useGroups();
  
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupRanking, setGroupRanking] = useState<WeeklyRanking[]>([]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
  });
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (user) {
      loadUserGroups();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupData();
    }
  }, [selectedGroup]);

  const loadUserGroups = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const groups = await getUserGroups(user.id);
      setUserGroups(groups);
      if (groups.length > 0 && !selectedGroup) {
        setSelectedGroup(groups[0]);
      }
    } catch (error) {
      console.error('Failed to load user groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupData = async () => {
    if (!selectedGroup) return;

    try {
      const [ranking, members] = await Promise.all([
        getGroupRanking(selectedGroup.id),
        getGroupMembers(selectedGroup.id)
      ]);
      
      setGroupRanking(ranking);
      setGroupMembers(members);
    } catch (error) {
      console.error('Failed to load group data:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!user) return;

    try {
      const groupId = await createGroup(createForm, user.id);
      if (groupId) {
        setShowCreateDialog(false);
        setCreateForm({ name: '', description: '' });
        await loadUserGroups();
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) return;

    try {
      const success = await joinGroup(joinCode, user.id);
      if (success) {
        setShowJoinDialog(false);
        setJoinCode('');
        await loadUserGroups();
      }
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const getUserMember = (userId: string) => {
    return groupMembers.find(member => member.id === userId);
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

  if (userGroups.length === 0) {
    return (
      <div className="pb-20">
        <div className="bg-white px-4 py-6 shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-600 mb-4">그룹 챌린지</h1>
          <p className="text-neutral-500">친구들과 함께 챌린지에 참여해보세요!</p>
        </div>

        <div className="px-4 py-8 text-center">
          <i className="fas fa-users text-6xl text-neutral-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">그룹이 없습니다</h3>
          <p className="text-neutral-500 mb-6">새 그룹을 만들거나 기존 그룹에 참여해보세요.</p>
          
          <div className="space-y-3 max-w-sm mx-auto">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="w-full bg-primary text-white rounded-xl p-4 font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              새 그룹 만들기
            </Button>
            <Button 
              onClick={() => setShowJoinDialog(true)}
              variant="outline"
              className="w-full rounded-xl p-4 font-semibold"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              그룹 참여하기
            </Button>
          </div>
        </div>

        {/* Create Group Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 그룹 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="그룹 이름"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
              <Input
                placeholder="그룹 설명 (선택사항)"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
              <Button onClick={handleCreateGroup} className="w-full">
                그룹 만들기
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Group Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>그룹 참여하기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="초대 코드를 입력하세요"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button onClick={handleJoinGroup} className="w-full">
                그룹 참여하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Group Header */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-neutral-600">그룹 랭킹</h1>
          <Button 
            onClick={() => setShowJoinDialog(true)}
            size="sm"
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <i className="fas fa-user-plus mr-1"></i>
            초대
          </Button>
        </div>
        
        {selectedGroup && (
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{selectedGroup.name}</h2>
                <p className="text-sm opacity-90">멤버 {selectedGroup.memberIds.length}명</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{selectedGroup.totalPoints}</div>
                <div className="text-sm opacity-90">총 포인트</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rankings */}
      <div className="px-4 py-6">
        <h3 className="text-lg font-bold text-neutral-600 mb-4">이번 주 랭킹</h3>
        
        {groupRanking.length > 0 && (
          <>
            {/* Top 3 Special Display */}
            {groupRanking[0] && (
              <Card className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-warning to-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {getUserMember(groupRanking[0].userId)?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-neutral-600">
                      {getUserMember(groupRanking[0].userId)?.name || 'Unknown'}
                      {groupRanking[0].userId === user?.id && ' (나)'}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      연속 <span className="font-semibold text-primary">
                        {getUserMember(groupRanking[0].userId)?.currentStreak || 0}일
                      </span> 달성
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="flex space-x-1 mr-3">
                        <span>🔥</span>
                        <span>💪</span>
                        <span>⭐</span>
                      </div>
                      <span className="text-sm text-neutral-400">
                        {getUserMember(groupRanking[0].userId)?.totalPoints || 0} 포인트
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-warning">
                      {groupRanking[0].weeklyPoints}
                    </div>
                    <div className="text-xs text-neutral-400">이번 주</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Regular Rankings */}
            <div className="space-y-3">
              {groupRanking.slice(1).map((ranking) => {
                const member = getUserMember(ranking.userId);
                const isCurrentUser = ranking.userId === user?.id;
                
                return (
                  <Card 
                    key={ranking.id}
                    className={`bg-white rounded-xl p-4 shadow-sm ${
                      isCurrentUser ? 'border-2 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrentUser ? 'bg-primary' : 'bg-neutral-200'
                      }`}>
                        <span className={`font-bold text-sm ${
                          isCurrentUser ? 'text-white' : 'text-neutral-600'
                        }`}>
                          {ranking.rank}
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {member?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          isCurrentUser ? 'text-primary' : 'text-neutral-600'
                        }`}>
                          {member?.name || 'Unknown'}
                          {isCurrentUser && ' (나)'}
                        </h4>
                        <p className="text-sm text-neutral-400">
                          {ranking.weeklyPoints} 포인트
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <span>💪</span>
                        {ranking.weeklyPoints > 200 && <span>🔥</span>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Join Group Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 참여하기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="초대 코드를 입력하세요"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <Button onClick={handleJoinGroup} className="w-full">
              그룹 참여하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
