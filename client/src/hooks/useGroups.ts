import { useState, useEffect } from 'react';
import { queryDocuments, createDocument, getDocument, updateDocument } from '@/lib/firebase';
import { Group, InsertGroup, WeeklyRanking, User } from '@shared/schema';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = async (groupData: InsertGroup, ownerId: string): Promise<string | null> => {
    try {
      setLoading(true);
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newGroup = {
        ...groupData,
        ownerId,
        memberIds: [ownerId],
        inviteCode,
      };

      const groupId = await createDocument('groups', newGroup);
      
      // Add group to user's groupIds
      const userData = await getDocument('users', ownerId);
      if (userData) {
        const updatedGroupIds = [...(userData.groupIds || []), groupId];
        await updateDocument('users', ownerId, { groupIds: updatedGroupIds });
      }

      return groupId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (inviteCode: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const groupsData = await queryDocuments('groups', [['inviteCode', '==', inviteCode]]);
      
      if (groupsData.length === 0) {
        setError('Invalid invite code');
        return false;
      }

      const group = groupsData[0];
      
      if (group.memberIds.includes(userId)) {
        setError('You are already a member of this group');
        return false;
      }

      // Add user to group
      const updatedMemberIds = [...group.memberIds, userId];
      await updateDocument('groups', group.id, { memberIds: updatedMemberIds });

      // Add group to user's groupIds
      const userData = await getDocument('users', userId);
      if (userData) {
        const updatedGroupIds = [...(userData.groupIds || []), group.id];
        await updateDocument('users', userId, { groupIds: updatedGroupIds });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserGroups = async (userId: string): Promise<Group[]> => {
    try {
      const userData = await getDocument('users', userId);
      if (!userData || !userData.groupIds || userData.groupIds.length === 0) {
        return [];
      }

      const userGroups: Group[] = [];
      for (const groupId of userData.groupIds) {
        const group = await getDocument('groups', groupId);
        if (group) {
          userGroups.push(group as Group);
        }
      }

      return userGroups;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user groups');
      return [];
    }
  };

  const getGroupRanking = async (groupId: string): Promise<WeeklyRanking[]> => {
    try {
      const group = await getDocument('groups', groupId);
      if (!group) return [];

      const rankings: WeeklyRanking[] = [];
      
      // Get all group members and their stats
      for (const memberId of group.memberIds) {
        const userData = await getDocument('users', memberId);
        if (userData) {
          // Calculate weekly points (simplified - in real app would filter by date range)
          const weeklyPoints = Math.floor((userData.totalPoints || 0) * 0.3); // Mock weekly calculation
          
          rankings.push({
            id: `${groupId}_${memberId}`,
            userId: memberId,
            groupId,
            weekStart: new Date(),
            weeklyPoints,
            rank: 0, // Will be calculated after sorting
            completedChallenges: userData.totalChallenges || 0,
          });
        }
      }

      // Sort by weekly points and assign ranks
      rankings.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
      rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
      });

      return rankings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get group ranking');
      return [];
    }
  };

  const getGroupMembers = async (groupId: string): Promise<User[]> => {
    try {
      const group = await getDocument('groups', groupId);
      if (!group) return [];

      const members: User[] = [];
      for (const memberId of group.memberIds) {
        const userData = await getDocument('users', memberId);
        if (userData) {
          members.push(userData as User);
        }
      }

      return members;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get group members');
      return [];
    }
  };

  return {
    groups,
    loading,
    error,
    createGroup,
    joinGroup,
    getUserGroups,
    getGroupRanking,
    getGroupMembers,
  };
}
