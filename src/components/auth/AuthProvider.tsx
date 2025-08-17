
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Loader2 } from 'lucide-react';
import { CreateUserProfileData, UserProfile } from '@/types';
import { getUserProfile, createUserProfile } from '@/services/user';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  logIn: (email: string, password: string) => Promise<FirebaseUser>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Fetch the extended user profile from our database
        const userProfile = await getUserProfile(fbUser.uid);
        setUser(userProfile);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create the user profile document in Firestore
    const profileData: CreateUserProfileData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '',
      displayName: displayName,
      photoURL: userCredential.user.photoURL || undefined,
    };
    await createUserProfile(profileData);
    
    // Explicitly fetch and set the user profile right after creation
    const newUserProfile = await getUserProfile(userCredential.user.uid);
    setUser(newUserProfile);
    
    return userCredential;
  };
  
  const logIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signUp,
    logIn,
    logOut,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
