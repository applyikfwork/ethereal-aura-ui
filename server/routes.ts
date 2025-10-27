import type { Express } from "express";
import { IStorage } from "./storage";
import { avatarRequestSchema, type AvatarRequest } from "@shared/schema";
import { generateAvatarWithGemini, enhancePromptWithGemini, generateAvatarPrompt } from "./gemini";

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

      // Generate avatar using Gemini (with fallback to placeholder)
      let imageUrl: string;
      let prompt: string;
      
      try {
        const result = await generateAvatarWithGemini(request);
        imageUrl = result.imageUrl;
        prompt = result.prompt;
      } catch (error) {
        console.warn("Gemini generation failed, using fallback:", error);
        prompt = generateAvatarPrompt(request);
        // Better placeholder with more variety based on request
        const style = request.artStyle || 'avataaars';
        const seed = `${request.gender}-${request.age}-${Date.now()}`;
        imageUrl = `https://api.dicebear.com/7.x/${style === 'realistic' ? 'avataaars' : style === 'anime' ? 'big-smile' : 'bottts'}/svg?seed=${seed}`;
      }
      
      const avatar = await storage.createAvatar({
        userId,
        prompt,
        request,
        urls: {
          normal: imageUrl,
          thumbnail: imageUrl,
          stylized: isPremium ? imageUrl : undefined,
        },
        size: request.size,
        isPremium,
        isPublic: true,
        likes: 0,
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
  
  // Enhance prompt with Gemini AI
  app.post("/api/prompt/enhance", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const enhancedPrompt = await enhancePromptWithGemini(prompt);
      res.json({ enhancedPrompt });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to enhance prompt" });
    }
  });
}
