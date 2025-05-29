import { useState, useEffect } from 'react';
import { Challenge, Submission, InsertSubmission } from '@shared/schema';

export function useChallengesDatabase() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/challenges');
      const challengesData = await response.json();
      setChallenges(challengesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const getChallengeByDay = async (day: number): Promise<Challenge | null> => {
    try {
      const response = await fetch(`/api/challenges/day/${day}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get challenge');
      return null;
    }
  };

  const getUserSubmissions = async (userId: number): Promise<Submission[]> => {
    try {
      const response = await fetch(`/api/users/${userId}/submissions`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get submissions');
      return [];
    }
  };

  const submitChallenge = async (
    userId: number,
    challengeId: number,
    challengeDay: number,
    type: 'video' | 'photo' | 'text' | 'emoji',
    content: string | File,
    isSuccess: boolean,
    groupId?: number
  ): Promise<number | null> => {
    try {
      let finalContent = content;
      
      if (content instanceof File) {
        // For MVP, we'll store file as base64 string
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(content);
        });
        finalContent = base64;
      }

      const submission: InsertSubmission = {
        userId,
        challengeId,
        challengeDay,
        type,
        content: finalContent as string,
        isSuccess,
        points: isSuccess ? 100 : 50,
        groupId,
      };

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      const result = await response.json();
      return result.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit challenge');
      return null;
    }
  };

  const getGroupSubmissions = async (groupId: number): Promise<Submission[]> => {
    try {
      const response = await fetch(`/api/groups/${groupId}/submissions`);
      return await response.json();
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