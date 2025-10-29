import { pgTable, text, integer, boolean, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  credits: integer("credits").notNull().default(3),
  premium: boolean("premium").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const avatars = pgTable("avatars", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  stylizedUrl: text("stylized_url"),
  public: boolean("public").notNull().default(false),
  gender: text("gender"),
  hairStyle: text("hair_style"),
  hairColor: text("hair_color"),
  artStyle: text("art_style"),
  auraEffect: text("aura_effect"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  name: z.string().min(1),
  email: z.string().email(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertAvatarSchema = createInsertSchema(avatars, {
  prompt: z.string().min(1),
  imageUrl: z.string().url(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAvatar = z.infer<typeof insertAvatarSchema>;
export type Avatar = typeof avatars.$inferSelect;

export const avatarGenerationSchema = z.object({
  gender: z.enum(["male", "female", "non-binary"]),
  age: z.enum(["young", "adult", "mature"]),
  skinTone: z.enum(["fair", "medium", "tan", "dark"]),
  hairStyle: z.enum(["short", "long", "bald", "curly", "straight", "wavy"]),
  hairColor: z.enum(["black", "brown", "blonde", "red", "grey", "blue", "pink", "purple"]),
  outfit: z.enum(["casual", "formal", "fantasy", "sci-fi", "athletic"]),
  background: z.enum(["transparent", "gradient", "solid", "custom"]),
  artStyle: z.enum(["realistic", "anime", "fantasy", "cartoon", "cyberpunk"]),
  pose: z.enum(["front", "side", "profile", "three-quarter"]),
  auraEffect: z.enum(["none", "subtle", "strong", "holographic"]),
  resolution: z.enum(["512", "1024", "2048"]),
});

export type AvatarGenerationParams = z.infer<typeof avatarGenerationSchema>;
