import { useState, useEffect } from 'react';
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

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

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

      // For demo purposes, we'll create a user if they don't exist
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

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to login');
      }

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

  return {
    user,
    loading,
    error,
    loginWithEmail,
    register,
    signOut,
  };
}