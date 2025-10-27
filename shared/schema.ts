import { z } from "zod";

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
});

export type AvatarRequest = z.infer<typeof avatarRequestSchema>;

// Generated avatar
export const avatarSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  prompt: z.string(),
  request: avatarRequestSchema,
  urls: z.object({
    normal: z.string(),
    thumbnail: z.string(),
    stylized: z.string().optional(),
  }),
  size: z.string(),
  isPremium: z.boolean().default(false),
  createdAt: z.string(),
});

export type Avatar = z.infer<typeof avatarSchema>;

// User profile
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  credits: z.number().default(3),
  isPremium: z.boolean().default(false),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;
