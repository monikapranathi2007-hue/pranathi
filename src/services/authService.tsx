import { useState, useEffect, createContext, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { getUserProfile, createUserProfile, UserProfile } from './dbService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || user?.email === 'monikapranathi2007@gmail.com';

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        let p = await getUserProfile(u.uid);
        if (p && !p.role && u.email === 'monikapranathi2007@gmail.com') {
           // Auto-promote first admin for demo
           p.role = 'admin';
        }
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const existingProfile = await getUserProfile(result.user.uid);
      if (!existingProfile) {
        const role = result.user.email === 'monikapranathi2007@gmail.com' ? 'admin' : 'user';
        await createUserProfile(result.user.uid, {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || '',
          onboarded: false,
          role
        });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => signOut(auth);

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signInWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
