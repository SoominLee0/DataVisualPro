import { useState, useEffect } from 'react';
import { getDocument, queryDocuments, createDocument, updateDocument, uploadFile } from '@/lib/firebase';
import { Challenge, Submission, InsertSubmission } from '@shared/schema';

const CHALLENGES_DATA = [
  {
    day: 1,
    title: "10초 플랭크 챌린지",
    description: "코어 근육을 강화하는 기본 플랭크 자세를 10초간 유지해보세요.",
    videoUrl: "https://www.youtube.com/embed/MHcmC5QeIN8",
    duration: "1분",
    difficulty: 1,
    points: 100,
    isActive: true
  },
  {
    day: 2,
    title: "20회 스쿼트 챌린지",
    description: "하체 근력을 기르는 스쿼트 20회를 완료해보세요.",
    videoUrl: "https://www.youtube.com/embed/GbqgaOhIizc",
    duration: "3분",
    difficulty: 2,
    points: 150,
    isActive: true
  },
  {
    day: 3,
    title: "30초 점프잭",
    description: "전신 유산소 운동인 점프잭을 30초간 실시해보세요.",
    videoUrl: "https://www.youtube.com/embed/3iN33mGIdts",
    duration: "2분",
    difficulty: 1,
    points: 120,
    isActive: true
  }
];

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const challengesData = await queryDocuments('challenges', [], 'day');
      
      if (challengesData.length === 0) {
        // Initialize challenges if none exist
        for (const challengeData of CHALLENGES_DATA) {
          await createDocument('challenges', challengeData);
        }
        setChallenges(CHALLENGES_DATA as Challenge[]);
      } else {
        setChallenges(challengesData as Challenge[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const getChallengeByDay = async (day: number): Promise<Challenge | null> => {
    try {
      const challengesData = await queryDocuments('challenges', [['day', '==', day]]);
      return challengesData.length > 0 ? challengesData[0] as Challenge : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get challenge');
      return null;
    }
  };

  const getUserSubmissions = async (userId: string): Promise<Submission[]> => {
    try {
      const submissions = await queryDocuments('submissions', [['userId', '==', userId]], 'createdAt');
      return submissions as Submission[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get submissions');
      return [];
    }
  };

  const submitChallenge = async (
    userId: string,
    challengeId: string,
    challengeDay: number,
    type: 'video' | 'photo' | 'text' | 'emoji',
    content: string | File,
    isSuccess: boolean,
    groupId?: string
  ): Promise<string | null> => {
    try {
      let finalContent = content;
      
      if (content instanceof File) {
        // Upload file to Firebase Storage
        const path = `submissions/${userId}/${challengeId}/${Date.now()}_${content.name}`;
        finalContent = await uploadFile(content, path);
      }

      const submission: InsertSubmission = {
        userId,
        challengeId,
        challengeDay,
        type,
        content: finalContent as string,
        isSuccess,
        points: isSuccess ? 100 : 50, // Award points based on success
        groupId,
      };

      const submissionId = await createDocument('submissions', submission);
      
      // Update user stats
      await updateUserStats(userId, isSuccess, submission.points);
      
      return submissionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit challenge');
      return null;
    }
  };

  const updateUserStats = async (userId: string, isSuccess: boolean, points: number) => {
    try {
      const userData = await getDocument('users', userId);
      if (!userData) return;

      const updates: any = {
        totalChallenges: (userData.totalChallenges || 0) + 1,
        totalPoints: (userData.totalPoints || 0) + points,
      };

      if (isSuccess) {
        updates.currentStreak = (userData.currentStreak || 0) + 1;
        updates.longestStreak = Math.max(userData.longestStreak || 0, updates.currentStreak);
      } else {
        updates.currentStreak = 0;
      }

      // Calculate success rate
      updates.successRate = Math.round(((userData.totalChallenges || 0) > 0 ? 
        (updates.totalPoints / ((userData.totalChallenges || 0) + 1)) / 100 * 100 : 0));

      await updateDocument('users', userId, updates);
    } catch (err) {
      console.error('Failed to update user stats:', err);
    }
  };

  const getGroupSubmissions = async (groupId: string): Promise<Submission[]> => {
    try {
      const submissions = await queryDocuments('submissions', [['groupId', '==', groupId]], 'createdAt');
      return submissions as Submission[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get group submissions');
      return [];
    }
  };

  return {
    challenges,
    loading,
    error,
    getChallengeByDay,
    getUserSubmissions,
    submitChallenge,
    getGroupSubmissions,
    refreshChallenges: loadChallenges,
  };
}
