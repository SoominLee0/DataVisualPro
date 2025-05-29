import { useState, useEffect } from 'react';
import { User, InsertUser } from '@shared/schema';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';

export function useAuthDatabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get or create user in our database
          let userData = await fetch(`/api/users/email/${firebaseUser.email}`).then(res => 
            res.ok ? res.json() : null
          ).catch(() => null);
          
          if (!userData) {
            // Create new user in our database
            const newUserData: InsertUser = {
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              avatar: firebaseUser.photoURL || undefined,
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
              body: JSON.stringify(newUserData),
            });
            
            userData = await response.json();
          }
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    });

    // Check for redirect result (Google login)
    getRedirectResult(auth).catch((error) => {
      setError(error.message);
    });

    return unsubscribe;
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

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  return {
    user,
    loading,
    error,
    loginWithEmail,
    loginWithGoogle,
    register,
    signOut: signOutUser,
  };
}