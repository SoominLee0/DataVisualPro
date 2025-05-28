import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User, InsertUser } from '@shared/schema';

export function useAuthDatabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);

      const userData: InsertUser = {
        email,
        name,
        currentDay: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        totalChallenges: 0,
        successRate: 0,
        badges: [],
        groupIds: [],
      };

      const response = await apiRequest('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const newUser = await response.json();
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      // For demo purposes, we'll create a mock login by checking if user exists
      // In a real app, you'd verify password on the server
      const userData: InsertUser = {
        email,
        name: email.split('@')[0],
        currentDay: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        totalChallenges: 0,
        successRate: 0,
        badges: [],
        groupIds: [],
      };

      const response = await apiRequest('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const newUser = await response.json();
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      await apiRequest(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  return {
    user,
    loading,
    error,
    loginWithEmail,
    register,
    signOut,
    updateUser,
  };
}