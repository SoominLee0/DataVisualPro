import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, auth, createDocument, getDocument, updateDocument } from '@/lib/firebase';
import { User, InsertUser } from '@shared/schema';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          
          // Get or create user document in Firestore
          let userData = await getDocument('users', firebaseUser.uid);
          
          if (!userData) {
            // Create new user document
            const newUser: InsertUser = {
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
              lastLoginAt: new Date(),
            };
            
            await createDocument('users', newUser, firebaseUser.uid);
            userData = { id: firebaseUser.uid, ...newUser };
          } else {
            // Update last login
            await updateDocument('users', firebaseUser.uid, {
              lastLoginAt: new Date()
            });
          }
          
          setUser(userData as User);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const result = await signUpWithEmail(email, password);
      
      if (result.user) {
        const newUser: InsertUser = {
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
          lastLoginAt: new Date(),
        };
        
        await createDocument('users', newUser, result.user.uid);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    register,
    signOut,
  };
}
