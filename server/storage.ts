import type { Avatar, User, Comment, Referral, LeaderboardEntry, PlatformStats } from "@shared/schema";
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export interface IStorage {
  // Avatar methods
  createAvatar(avatar: Omit<Avatar, "id" | "createdAt">): Promise<Avatar>;
  getAvatar(id: string): Promise<Avatar | undefined>;
  getAvatarsByUser(userId: string): Promise<Avatar[]>;
  getAllAvatars(limit?: number): Promise<Avatar[]>;
  getTrendingAvatars(limit?: number): Promise<Avatar[]>;
  getFeaturedAvatars(limit?: number): Promise<Avatar[]>;
  updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar | undefined>;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  createUser(user: Omit<User, "uid" | "createdAt">): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User | undefined>;
  upgradeUser(userId: string): Promise<User | undefined>;
  updateUser(userId: string, updates: Partial<User>): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  
  // Social interaction methods
  likeAvatar(avatarId: string, userId: string): Promise<boolean>;
  unlikeAvatar(avatarId: string, userId: string): Promise<boolean>;
  shareAvatar(avatarId: string, userId: string): Promise<boolean>;
  
  // Comment methods
  createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment>;
  getCommentsByAvatar(avatarId: string): Promise<Comment[]>;
  
  // Referral methods
  createReferral(referral: Omit<Referral, "id" | "createdAt">): Promise<Referral>;
  getReferralsByUser(userId: string): Promise<Referral[]>;
  
  // Stats and leaderboard methods
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getPlatformStats(): Promise<PlatformStats>;
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

  async getTrendingAvatars(limit = 20): Promise<Avatar[]> {
    const snapshot = await this.db
      .collection('avatars')
      .where('isPublic', '==', true)
      .orderBy('likes', 'desc')
      .orderBy('shares', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Avatar);
  }

  async getFeaturedAvatars(limit = 10): Promise<Avatar[]> {
    const snapshot = await this.db
      .collection('avatars')
      .where('isFeatured', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Avatar);
  }

  async updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar | undefined> {
    const avatarRef = this.db.collection('avatars').doc(id);
    await avatarRef.update(updates);
    const doc = await avatarRef.get();
    return doc.exists ? (doc.data() as Avatar) : undefined;
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

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const userRef = this.db.collection('users').doc(userId);
    await userRef.update(updates);
    const doc = await userRef.get();
    return doc.exists ? (doc.data() as User) : undefined;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const snapshot = await this.db
      .collection('users')
      .where('referralCode', '==', code)
      .limit(1)
      .get();
    
    return snapshot.empty ? undefined : (snapshot.docs[0].data() as User);
  }

  async likeAvatar(avatarId: string, userId: string): Promise<boolean> {
    const avatarRef = this.db.collection('avatars').doc(avatarId);
    const avatar = await avatarRef.get();
    if (!avatar.exists) return false;
    
    const data = avatar.data() as Avatar;
    const likedBy = data.likedBy || [];
    
    if (likedBy.includes(userId)) return false; // Already liked
    
    await avatarRef.update({
      likes: (data.likes || 0) + 1,
      likedBy: [...likedBy, userId]
    });
    
    // Update user's total likes
    const userRef = this.db.collection('users').doc(data.userId);
    const user = await userRef.get();
    if (user.exists) {
      await userRef.update({
        totalLikes: ((user.data() as User).totalLikes || 0) + 1
      });
    }
    
    return true;
  }

  async unlikeAvatar(avatarId: string, userId: string): Promise<boolean> {
    const avatarRef = this.db.collection('avatars').doc(avatarId);
    const avatar = await avatarRef.get();
    if (!avatar.exists) return false;
    
    const data = avatar.data() as Avatar;
    const likedBy = data.likedBy || [];
    
    if (!likedBy.includes(userId)) return false; // Not liked
    
    await avatarRef.update({
      likes: Math.max(0, (data.likes || 0) - 1),
      likedBy: likedBy.filter(id => id !== userId)
    });
    
    // Update user's total likes
    const userRef = this.db.collection('users').doc(data.userId);
    const user = await userRef.get();
    if (user.exists) {
      await userRef.update({
        totalLikes: Math.max(0, ((user.data() as User).totalLikes || 0) - 1)
      });
    }
    
    return true;
  }

  async shareAvatar(avatarId: string, _userId: string): Promise<boolean> {
    const avatarRef = this.db.collection('avatars').doc(avatarId);
    const avatar = await avatarRef.get();
    if (!avatar.exists) return false;
    
    const data = avatar.data() as Avatar;
    await avatarRef.update({
      shares: (data.shares || 0) + 1
    });
    
    // Update avatar owner's total shares
    const userRef = this.db.collection('users').doc(data.userId);
    const user = await userRef.get();
    if (user.exists) {
      await userRef.update({
        totalShares: ((user.data() as User).totalShares || 0) + 1
      });
    }
    
    return true;
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const commentRef = this.db.collection('comments').doc();
    const newComment: Comment = {
      ...comment,
      id: commentRef.id,
      createdAt: new Date().toISOString(),
    };
    await commentRef.set(newComment);
    
    // Update comment count on avatar
    const avatarRef = this.db.collection('avatars').doc(comment.avatarId);
    const avatar = await avatarRef.get();
    if (avatar.exists) {
      await avatarRef.update({
        comments: ((avatar.data() as Avatar).comments || 0) + 1
      });
    }
    
    return newComment;
  }

  async getCommentsByAvatar(avatarId: string): Promise<Comment[]> {
    const snapshot = await this.db
      .collection('comments')
      .where('avatarId', '==', avatarId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Comment);
  }

  async createReferral(referral: Omit<Referral, "id" | "createdAt">): Promise<Referral> {
    const referralRef = this.db.collection('referrals').doc();
    const newReferral: Referral = {
      ...referral,
      id: referralRef.id,
      createdAt: new Date().toISOString(),
    };
    await referralRef.set(newReferral);
    
    // Update referrer's referral count and credits
    const userRef = this.db.collection('users').doc(referral.referrerId);
    const user = await userRef.get();
    if (user.exists) {
      const userData = user.data() as User;
      await userRef.update({
        referralCount: (userData.referralCount || 0) + 1,
        credits: userData.credits + referral.creditsAwarded
      });
    }
    
    return newReferral;
  }

  async getReferralsByUser(userId: string): Promise<Referral[]> {
    const snapshot = await this.db
      .collection('referrals')
      .where('referrerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Referral);
  }

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const snapshot = await this.db
      .collection('users')
      .orderBy('totalLikes', 'desc')
      .limit(limit)
      .get();
    
    const entries = snapshot.docs.map((doc, index) => {
      const user = doc.data() as User;
      return {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || undefined,
        totalLikes: user.totalLikes || 0,
        totalShares: user.totalShares || 0,
        totalAvatars: user.totalAvatars || 0,
        rank: index + 1,
      };
    });
    
    return entries;
  }

  async getPlatformStats(): Promise<PlatformStats> {
    const usersSnapshot = await this.db.collection('users').get();
    const avatarsSnapshot = await this.db.collection('avatars').get();
    const premiumSnapshot = await this.db
      .collection('users')
      .where('isPremium', '==', true)
      .get();
    
    return {
      totalUsers: usersSnapshot.size,
      totalAvatars: avatarsSnapshot.size,
      premiumUsers: premiumSnapshot.size,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export class MemStorage implements IStorage {
  private avatars: Map<string, Avatar> = new Map();
  private users: Map<string, User> = new Map();
  private comments: Map<string, Comment> = new Map();
  private referrals: Map<string, Referral> = new Map();
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
      totalLikes: 0,
      totalAvatars: 0,
      totalShares: 0,
      referralCode: "DEMO123",
      referralCount: 0,
      subscribedToNewsletter: false,
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
      .filter(a => a.isPublic)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getTrendingAvatars(limit = 20): Promise<Avatar[]> {
    return Array.from(this.avatars.values())
      .filter(a => a.isPublic)
      .sort((a, b) => {
        const scoreA = (a.likes || 0) * 2 + (a.shares || 0) * 3;
        const scoreB = (b.likes || 0) * 2 + (b.shares || 0) * 3;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  async getFeaturedAvatars(limit = 10): Promise<Avatar[]> {
    return Array.from(this.avatars.values())
      .filter(a => a.isFeatured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async updateAvatar(id: string, updates: Partial<Avatar>): Promise<Avatar | undefined> {
    const avatar = this.avatars.get(id);
    if (!avatar) return undefined;
    Object.assign(avatar, updates);
    return avatar;
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
      totalLikes: 0,
      totalAvatars: 0,
      totalShares: 0,
      referralCode: `REF${uid.toUpperCase()}`,
      referralCount: 0,
      subscribedToNewsletter: false,
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

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    Object.assign(user, updates);
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.referralCode === code);
  }

  async likeAvatar(avatarId: string, userId: string): Promise<boolean> {
    const avatar = this.avatars.get(avatarId);
    if (!avatar) return false;
    
    const likedBy = avatar.likedBy || [];
    if (likedBy.includes(userId)) return false;
    
    avatar.likes = (avatar.likes || 0) + 1;
    avatar.likedBy = [...likedBy, userId];
    
    // Update user's total likes
    const user = this.users.get(avatar.userId);
    if (user) {
      user.totalLikes = (user.totalLikes || 0) + 1;
    }
    
    return true;
  }

  async unlikeAvatar(avatarId: string, userId: string): Promise<boolean> {
    const avatar = this.avatars.get(avatarId);
    if (!avatar) return false;
    
    const likedBy = avatar.likedBy || [];
    if (!likedBy.includes(userId)) return false;
    
    avatar.likes = Math.max(0, (avatar.likes || 0) - 1);
    avatar.likedBy = likedBy.filter(id => id !== userId);
    
    // Update user's total likes
    const user = this.users.get(avatar.userId);
    if (user) {
      user.totalLikes = Math.max(0, (user.totalLikes || 0) - 1);
    }
    
    return true;
  }

  async shareAvatar(avatarId: string, _userId: string): Promise<boolean> {
    const avatar = this.avatars.get(avatarId);
    if (!avatar) return false;
    
    avatar.shares = (avatar.shares || 0) + 1;
    
    // Update user's total shares
    const user = this.users.get(avatar.userId);
    if (user) {
      user.totalShares = (user.totalShares || 0) + 1;
    }
    
    return true;
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
    const id = `comment_${this.currentId++}`;
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date().toISOString(),
    };
    this.comments.set(id, newComment);
    
    // Update comment count on avatar
    const avatar = this.avatars.get(comment.avatarId);
    if (avatar) {
      avatar.comments = (avatar.comments || 0) + 1;
    }
    
    return newComment;
  }

  async getCommentsByAvatar(avatarId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(c => c.avatarId === avatarId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReferral(referral: Omit<Referral, "id" | "createdAt">): Promise<Referral> {
    const id = `referral_${this.currentId++}`;
    const newReferral: Referral = {
      ...referral,
      id,
      createdAt: new Date().toISOString(),
    };
    this.referrals.set(id, newReferral);
    
    // Update referrer's referral count and credits
    const user = this.users.get(referral.referrerId);
    if (user) {
      user.referralCount = (user.referralCount || 0) + 1;
      user.credits = user.credits + referral.creditsAwarded;
    }
    
    return newReferral;
  }

  async getReferralsByUser(userId: string): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(r => r.referrerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.totalLikes || 0) - (a.totalLikes || 0))
      .slice(0, limit)
      .map((user, index) => ({
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || undefined,
        totalLikes: user.totalLikes || 0,
        totalShares: user.totalShares || 0,
        totalAvatars: user.totalAvatars || 0,
        rank: index + 1,
      }));
  }

  async getPlatformStats(): Promise<PlatformStats> {
    return {
      totalUsers: this.users.size,
      totalAvatars: this.avatars.size,
      premiumUsers: Array.from(this.users.values()).filter(u => u.isPremium).length,
      lastUpdated: new Date().toISOString(),
    };
  }
}
