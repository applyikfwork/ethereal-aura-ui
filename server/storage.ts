import type { Avatar, User } from "@shared/schema";
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export interface IStorage {
  // Avatar methods
  createAvatar(avatar: Omit<Avatar, "id" | "createdAt">): Promise<Avatar>;
  getAvatar(id: string): Promise<Avatar | undefined>;
  getAvatarsByUser(userId: string): Promise<Avatar[]>;
  getAllAvatars(limit?: number): Promise<Avatar[]>;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  createUser(user: Omit<User, "uid" | "createdAt">): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User | undefined>;
  upgradeUser(userId: string): Promise<User | undefined>;
}

// Initialize Firebase Admin SDK for server-side Firestore access
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // Initialize with environment variables
    // Note: This uses the same Firebase project as the client, but with admin privileges
    initializeApp({
      credential: cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      })
    });
  }
  return getFirestore();
}

// Firestore-based storage implementation
export class FirestoreStorage implements IStorage {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    this.db = initializeFirebaseAdmin();
  }

  async createAvatar(avatar: Omit<Avatar, "id" | "createdAt">): Promise<Avatar> {
    const avatarRef = this.db.collection('avatars').doc();
    const newAvatar: Avatar = {
      ...avatar,
      id: avatarRef.id,
      createdAt: new Date().toISOString(),
    };
    await avatarRef.set(newAvatar);
    return newAvatar;
  }

  async getAvatar(id: string): Promise<Avatar | undefined> {
    const doc = await this.db.collection('avatars').doc(id).get();
    return doc.exists ? (doc.data() as Avatar) : undefined;
  }

  async getAvatarsByUser(userId: string): Promise<Avatar[]> {
    const snapshot = await this.db
      .collection('avatars')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Avatar);
  }

  async getAllAvatars(limit = 20): Promise<Avatar[]> {
    const snapshot = await this.db
      .collection('avatars')
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Avatar);
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await this.db.collection('users').doc(id).get();
    return doc.exists ? (doc.data() as User) : undefined;
  }

  async createUser(user: Omit<User, "uid" | "createdAt">): Promise<User> {
    const userRef = this.db.collection('users').doc();
    const newUser: User = {
      ...user,
      uid: userRef.id,
      createdAt: new Date().toISOString(),
    } as User;
    await userRef.set(newUser);
    return newUser;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User | undefined> {
    const userRef = this.db.collection('users').doc(userId);
    await userRef.update({ credits });
    const doc = await userRef.get();
    return doc.exists ? (doc.data() as User) : undefined;
  }

  async upgradeUser(userId: string): Promise<User | undefined> {
    const userRef = this.db.collection('users').doc(userId);
    await userRef.update({ isPremium: true });
    const doc = await userRef.get();
    return doc.exists ? (doc.data() as User) : undefined;
  }
}

export class MemStorage implements IStorage {
  private avatars: Map<string, Avatar> = new Map();
  private users: Map<string, User> = new Map();
  private currentId = 1;

  constructor() {
    // Create a default user for demo
    const demoUser: User = {
      uid: "demo",
      displayName: "Demo User",
      email: "demo@aura.ai",
      role: "user",
      credits: 10,
      isPremium: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set("demo", demoUser);
  }

  async createAvatar(avatar: Omit<Avatar, "id" | "createdAt">): Promise<Avatar> {
    const id = `avatar_${this.currentId++}`;
    const newAvatar: Avatar = {
      ...avatar,
      id,
      createdAt: new Date().toISOString(),
    };
    this.avatars.set(id, newAvatar);
    return newAvatar;
  }

  async getAvatar(id: string): Promise<Avatar | undefined> {
    return this.avatars.get(id);
  }

  async getAvatarsByUser(userId: string): Promise<Avatar[]> {
    return Array.from(this.avatars.values()).filter(
      (avatar) => avatar.userId === userId
    );
  }

  async getAllAvatars(limit = 20): Promise<Avatar[]> {
    return Array.from(this.avatars.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: Omit<User, "uid" | "createdAt">): Promise<User> {
    const uid = `user_${this.currentId++}`;
    const newUser: User = {
      ...user,
      uid,
      createdAt: new Date().toISOString(),
    };
    this.users.set(uid, newUser);
    return newUser;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    user.credits = credits;
    return user;
  }

  async upgradeUser(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    user.isPremium = true;
    return user;
  }
}
