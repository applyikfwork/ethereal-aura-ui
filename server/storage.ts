import type { Avatar, User } from "@shared/schema";

export interface IStorage {
  // Avatar methods
  createAvatar(avatar: Omit<Avatar, "id" | "createdAt">): Promise<Avatar>;
  getAvatar(id: string): Promise<Avatar | undefined>;
  getAvatarsByUser(userId: string): Promise<Avatar[]>;
  getAllAvatars(limit?: number): Promise<Avatar[]>;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id" | "createdAt">): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User | undefined>;
  upgradeUser(userId: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private avatars: Map<string, Avatar> = new Map();
  private users: Map<string, User> = new Map();
  private currentId = 1;

  constructor() {
    // Create a default user for demo
    const demoUser: User = {
      id: "demo",
      name: "Demo User",
      email: "demo@aura.ai",
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

  async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const id = `user_${this.currentId++}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
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
