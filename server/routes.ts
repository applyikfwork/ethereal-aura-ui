import type { Express } from "express";
import { IStorage } from "./storage";
import { avatarRequestSchema, type AvatarRequest } from "@shared/schema";

export function registerRoutes(app: Express, storage: IStorage) {
  // Get user profile
  app.get("/api/user/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Generate avatar
  app.post("/api/avatars/generate", async (req, res) => {
    try {
      const request = avatarRequestSchema.parse(req.body);
      const userId = request.userId || "demo";

      // Check user credits
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPremium = user.isPremium;
      const requestedSize = parseInt(request.size);

      // Credit logic
      if (!isPremium && user.credits <= 0) {
        return res.status(403).json({ error: "No credits remaining. Upgrade to premium for unlimited avatars!" });
      }

      if (!isPremium && requestedSize > 512) {
        return res.status(403).json({ error: "HD sizes require premium. Upgrade now!" });
      }

      // Generate prompt from request
      const prompt = generatePrompt(request);

      // For now, use placeholder images
      // TODO: Integrate real AI generation (OpenAI DALL-E, Replicate, etc.)
      const placeholderUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
      
      const avatar = await storage.createAvatar({
        userId,
        prompt,
        request,
        urls: {
          normal: placeholderUrl,
          thumbnail: placeholderUrl,
          stylized: isPremium ? placeholderUrl : undefined,
        },
        size: request.size,
        isPremium,
      });

      // Deduct credits for free users
      if (!isPremium) {
        await storage.updateUserCredits(userId, user.credits - 1);
      }

      const newCredits = user.credits - 1;
      res.json({ avatar, creditsRemaining: isPremium ? "unlimited" : newCredits });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  // Get all avatars for gallery
  app.get("/api/avatars", async (_req, res) => {
    const avatars = await storage.getAllAvatars(20);
    res.json(avatars);
  });

  // Get user's avatars
  app.get("/api/avatars/user/:userId", async (req, res) => {
    const avatars = await storage.getAvatarsByUser(req.params.userId);
    res.json(avatars);
  });

  // Upgrade to premium
  app.post("/api/user/:id/upgrade", async (req, res) => {
    const user = await storage.upgradeUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });
}

// Helper function to generate prompt from request
function generatePrompt(request: AvatarRequest): string {
  const { gender, age, ethnicity, hairStyle, hairColor, outfit, accessories, background, artStyle, auraEffect, pose } = request;
  
  let prompt = `Create a high-quality ${artStyle} style avatar portrait of a ${age} ${gender}`;
  prompt += `, ${ethnicity} ethnicity`;
  prompt += `, with ${hairStyle} ${hairColor} hair`;
  prompt += `, wearing ${outfit}`;
  
  if (accessories.length > 0) {
    prompt += `, with ${accessories.join(", ")}`;
  }
  
  prompt += `. ${pose} view`;
  
  if (auraEffect !== "none") {
    prompt += `, with ${auraEffect} effect around the character`;
  }
  
  if (background === "transparent") {
    prompt += `, transparent background`;
  } else if (background === "gradient") {
    prompt += `, soft gradient background`;
  }
  
  prompt += `. High detail, professional quality, square composition.`;
  
  return prompt;
}
