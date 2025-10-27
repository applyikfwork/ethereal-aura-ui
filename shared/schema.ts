import { z } from "zod";

// User roles
export const userRoleSchema = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// Enhanced User Schema for Firebase
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  name: z.string().nullable().optional(),
  photoURL: z.string().url().nullable().optional(),
  role: userRoleSchema.default("user"),
  credits: z.number().default(10),
  isPremium: z.boolean().default(false),
  createdAt: z.string(),
  // Social stats
  totalLikes: z.number().default(0),
  totalAvatars: z.number().default(0),
  totalShares: z.number().default(0),
  // Referral system
  referralCode: z.string().optional(),
  referredBy: z.string().optional(),
  referralCount: z.number().default(0),
  // Email newsletter
  subscribedToNewsletter: z.boolean().default(false),
});

export type User = z.infer<typeof userSchema>;

// Admin Settings Schema (stored in Firestore)
// Note: API keys are stored in Replit Secrets for security, not in this schema
export const adminSettingsSchema = z.object({
  faviconUrl: z.string().url().optional(),
  siteName: z.string().default("Aura Avatar Studio"),
  allowSignups: z.boolean().default(true),
  defaultCredits: z.number().default(10),
  premiumFeatures: z.object({
    hdGeneration: z.boolean().default(true),
    styleVariations: z.boolean().default(true),
    unlimitedCredits: z.boolean().default(true),
  }).default({}),
  updatedAt: z.string(),
});

export type AdminSettings = z.infer<typeof adminSettingsSchema>;

// Avatar generation request
export const avatarRequestSchema = z.object({
  userId: z.string().optional(),
  uploadedImageUrl: z.string().optional(),
  gender: z.enum(["male", "female", "non-binary"]),
  age: z.enum(["child", "teen", "young-adult", "adult", "senior"]),
  ethnicity: z.string(),
  hairStyle: z.string(),
  hairColor: z.string(),
  outfit: z.string(),
  accessories: z.array(z.string()).default([]),
  background: z.enum(["transparent", "gradient", "custom"]),
  artStyle: z.enum(["realistic", "anime", "cartoon", "fantasy"]),
  auraEffect: z.enum(["light-glow", "holographic", "none"]),
  pose: z.enum(["front", "three-quarter", "side"]),
  size: z.enum(["512", "1024", "2048"]),
  customPrompt: z.string().optional(),
});

export type AvatarRequest = z.infer<typeof avatarRequestSchema>;

// Comment schema
export const commentSchema = z.object({
  id: z.string(),
  avatarId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userPhoto: z.string().optional(),
  text: z.string(),
  createdAt: z.string(),
});

export type Comment = z.infer<typeof commentSchema>;

// Generated avatar
export const avatarSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().optional(),
  userPhoto: z.string().optional(),
  prompt: z.string(),
  request: avatarRequestSchema,
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  urls: z.object({
    normal: z.string(),
    thumbnail: z.string(),
    stylized: z.string().optional(),
    profile: z.string().optional(),
    story: z.string().optional(),
    post: z.string().optional(),
    hd: z.string().optional(),
    animated: z.string().optional(), // GIF/MP4 for profile videos
  }).optional(),
  variations: z.array(z.object({
    style: z.string(),
    url: z.string(),
  })).optional(),
  size: z.string(),
  isPremium: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  likes: z.number().default(0),
  likedBy: z.array(z.string()).default([]), // User IDs who liked this
  shares: z.number().default(0),
  comments: z.number().default(0),
  hashtags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isRemixable: z.boolean().default(true),
  remixedFrom: z.string().optional(), // Original avatar ID if this is a remix
  createdAt: z.string(),
});

export type Avatar = z.infer<typeof avatarSchema>;

// API Response Types
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

// Avatar Generation Response
export const avatarGenerationResponseSchema = z.object({
  avatar: avatarSchema,
  creditsRemaining: z.union([z.number(), z.literal("unlimited")]),
  hashtags: z.array(z.string()).optional(),
});

export type AvatarGenerationResponse = z.infer<typeof avatarGenerationResponseSchema>;

// Referral schema
export const referralSchema = z.object({
  id: z.string(),
  referrerId: z.string(),
  referredUserId: z.string(),
  creditsAwarded: z.number().default(5),
  createdAt: z.string(),
});

export type Referral = z.infer<typeof referralSchema>;

// Platform stats schema
export const platformStatsSchema = z.object({
  totalUsers: z.number().default(0),
  totalAvatars: z.number().default(0),
  premiumUsers: z.number().default(0),
  lastUpdated: z.string(),
});

export type PlatformStats = z.infer<typeof platformStatsSchema>;

// Leaderboard entry schema
export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userPhoto: z.string().optional(),
  totalLikes: z.number(),
  totalShares: z.number(),
  totalAvatars: z.number(),
  rank: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  email: z.string().email(),
  userId: z.string().optional(),
  subscribedAt: z.string(),
});

export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;
