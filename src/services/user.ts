
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  DocumentData,
  FirestoreDataConverter,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { UserProfile, UserProfileSchema, CreateUserProfileData } from '@/types';

// Converter for type safety with Firestore
const userProfileConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore(profile: CreateUserProfileData): DocumentData {
    return {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(snapshot: DocumentSnapshot, options): UserProfile {
    const data = snapshot.data(options)!;
    return UserProfileSchema.parse({
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate(),
    });
  },
};

const usersCollection = (uid: string) => doc(db, 'users', uid).withConverter(userProfileConverter);

// =================================================================
// REPOSITORY LAYER
// =================================================================
const repository = {
  /**
   * Creates a user profile document in Firestore.
   * @param profileData - The data for the new user profile.
   */
  create: async (profileData: CreateUserProfileData): Promise<void> => {
    try {
      await setDoc(usersCollection(profileData.uid), profileData);
    } catch (error) {
      console.error('Error creating user profile in repository:', error);
      throw new Error('Could not create user profile.');
    }
  },

  /**
   * Fetches a user profile from Firestore.
   * @param uid - The user's ID.
   * @returns The UserProfile object or null if not found.
   */
  findById: async (uid: string): Promise<UserProfile | null> => {
    try {
      const docSnap = await getDoc(usersCollection(uid));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error)      {
      console.error('Error fetching user profile from repository:', error);
      throw new Error('Could not fetch user profile.');
    }
  },
};

// =================================================================
// SERVICE LAYER
// =================================================================

/**
 * Creates a new user profile.
 * @param profileData - Data for the new profile.
 */
export const createUserProfile = async (profileData: CreateUserProfileData): Promise<void> => {
  return repository.create(profileData);
};

/**
 * Gets a user profile. If it doesn't exist, it returns a default profile
 * structure based on the Firebase User object.
 * @param uid - The user's ID.
 * @returns A UserProfile object.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  return repository.findById(uid);
};
