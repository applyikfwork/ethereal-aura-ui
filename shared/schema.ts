import { z } from "zod";

// User roles
export const userRoleSchema = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// Enhanced User Schema for Firebase
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable().optional(),
  role: userRoleSchema.default("user"),
  credits: z.number().default(10),
  isPremium: z.boolean().default(false),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

// Admin Settings Schema (stored in Firestore)
export const adminSettingsSchema = z.object({
  geminiApiKey: z.string().optional(),
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

// Generated avatar
export const avatarSchema = z.object({
  id: z.string(),
  userId: z.string(),
  prompt: z.string(),
  request: avatarRequestSchema,
  imageUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  size: z.string(),
  isPremium: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  likes: z.number().default(0),
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
});

export type AvatarGenerationResponse = z.infer<typeof avatarGenerationResponseSchema>;
