import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from './firebase';
import type { UserProfile } from '@/types/user';

const db = getDb();

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function upsertUserProfile(profile: UserProfile) {
  await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
}
