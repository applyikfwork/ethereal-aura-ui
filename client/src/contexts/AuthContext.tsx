import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/config/firebase';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  credits: number;
  isPremium: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isGuestMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'xyzapplywork@gmail.com';

const GUEST_USER_DATA: UserData = {
  uid: 'guest-user',
  email: 'guest@aura.demo',
  displayName: 'Guest User',
  photoURL: null,
  role: 'user',
  credits: 10,
  isPremium: false,
  createdAt: new Date().toISOString(),
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (user: User) => {
    if (!db) return null;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUserData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.email === ADMIN_EMAIL ? 'admin' : 'user',
        credits: 10,
        isPremium: false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, newUserData);
      return newUserData;
    }

    return userSnap.data() as UserData;
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUserData(GUEST_USER_DATA);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userData = await createUserDocument(currentUser);
        setUserData(userData);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      throw new Error('Authentication is not available in guest mode. Please configure Firebase.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await createUserDocument(userCredential.user);
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication is not available in guest mode. Please configure Firebase.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Authentication is not available in guest mode. Please configure Firebase.');
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await createUserDocument(result.user);
  };

  const logout = async () => {
    if (!auth) {
      return;
    }
    await signOut(auth);
  };

  const isAdmin = userData?.role === 'admin';
  const isGuestMode = !isFirebaseConfigured;

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData,
      loading, 
      signUp, 
      signIn, 
      signInWithGoogle,
      logout,
      isAdmin,
      isGuestMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
