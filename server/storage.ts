import type { User, Avatar, InsertUser, InsertAvatar } from "../shared/schema";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUserCredits(userId: string, credits: number): Promise<void>;
  updateUserPremium(userId: string, premium: boolean): Promise<void>;

  // Avatar operations
  createAvatar(avatar: InsertAvatar): Promise<Avatar>;
  getAvatarById(id: string): Promise<Avatar | null>;
  getUserAvatars(userId: string): Promise<Avatar[]>;
  getPublicAvatars(limit?: number): Promise<Avatar[]>;
  updateAvatarPublic(id: string, isPublic: boolean): Promise<void>;
  deleteAvatar(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private avatars: Map<string, Avatar> = new Map();

  constructor() {}

  async createUser(user: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const newUser: User = {
      id,
      ...user,
      credits: user.credits ?? 3,
      premium: user.premium ?? false,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUserCredits(userId: string, credits: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.credits = credits;
      this.users.set(userId, user);
    }
  }

  async updateUserPremium(userId: string, premium: boolean): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.premium = premium;
      this.users.set(userId, user);
    }
  }

  async createAvatar(avatar: InsertAvatar): Promise<Avatar> {
    const id = crypto.randomUUID();
    const newAvatar: Avatar = {
      id,
      ...avatar,
      public: avatar.public ?? false,
      stylizedUrl: avatar.stylizedUrl ?? null,
      gender: avatar.gender ?? null,
      hairStyle: avatar.hairStyle ?? null,
      hairColor: avatar.hairColor ?? null,
      artStyle: avatar.artStyle ?? null,
      auraEffect: avatar.auraEffect ?? null,
      resolution: avatar.resolution ?? null,
      createdAt: new Date(),
    };
    this.avatars.set(id, newAvatar);
    return newAvatar;
  }

  async getAvatarById(id: string): Promise<Avatar | null> {
    return this.avatars.get(id) || null;
  }

  async getUserAvatars(userId: string): Promise<Avatar[]> {
    const userAvatars: Avatar[] = [];
    for (const avatar of this.avatars.values()) {
      if (avatar.userId === userId) {
        userAvatars.push(avatar);
      }
    }
    return userAvatars.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPublicAvatars(limit: number = 50): Promise<Avatar[]> {
    const publicAvatars: Avatar[] = [];
    for (const avatar of this.avatars.values()) {
      if (avatar.public) {
        publicAvatars.push(avatar);
      }
    }
    return publicAvatars
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateAvatarPublic(id: string, isPublic: boolean): Promise<void> {
    const avatar = this.avatars.get(id);
    if (avatar) {
      avatar.public = isPublic;
      this.avatars.set(id, avatar);
    }
  }

  async deleteAvatar(id: string): Promise<void> {
    this.avatars.delete(id);
  }
}
