import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';
import { UserProfile } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  rawUser: FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  isGuideModalOpen: boolean;
  setIsGuideModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rawUser, setRawUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const { error: toastError, success: toastSuccess } = useToast();

  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setRawUser(fbUser);
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || '使用者',
          email: fbUser.email,
          photoURL: fbUser.photoURL,
        });
      } else {
        setRawUser(null);
        setUser(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Auth state error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [configured]);

  const signInWithGoogle = async () => {
    if (!configured || !auth) {
      setIsConfigModalOpen(true);
      toastError('請先設定 Firebase 金鑰');
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      toastSuccess(`歡迎回來，${result.user.displayName || result.user.email}！`);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        toastError('Firebase 尚未啟用 Google 登入提供者，請至 Firebase Console 開啟');
        setIsGuideModalOpen(true);
      } else if (err.code === 'auth/unauthorized-domain') {
        toastError('當前網域未獲 Firebase 授權，請至 Firebase Console 新增已授權網域 (例如 localhost)');
      } else {
        toastError(err.message || 'Google 登入失敗');
      }
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await fbSignOut(auth);
      toastSuccess('已成功登出');
    } catch (err: any) {
      toastError(err.message || '登出失敗');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        rawUser,
        loading,
        isConfigured: configured,
        signInWithGoogle,
        signOut,
        isConfigModalOpen,
        setIsConfigModalOpen,
        isGuideModalOpen,
        setIsGuideModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
