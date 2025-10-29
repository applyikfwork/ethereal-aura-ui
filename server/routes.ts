import { Express } from "express";
import { IStorage } from "./storage";
import { avatarGenerationSchema, insertAvatarSchema, insertUserSchema, Avatar } from "../shared/schema";
import { generateMultipleAvatars } from "./gemini";

export function registerRoutes(app: Express, storage: IStorage) {
  
  // User endpoints
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id/credits", async (req, res) => {
    try {
      const { credits } = req.body;
      await storage.updateUserCredits(req.params.id, credits);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id/premium", async (req, res) => {
    try {
      const { premium } = req.body;
      await storage.updateUserPremium(req.params.id, premium);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Avatar generation endpoint
  app.post("/api/avatars/generate", async (req, res) => {
    try {
      const params = avatarGenerationSchema.parse(req.body);
      const userId = req.body.userId;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.premium && user.credits <= 0) {
        return res.status(403).json({ message: "Insufficient credits" });
      }

      console.log("Generating avatars for user:", userId);
      const imageDataUrls = await generateMultipleAvatars(params, 4);

      const savedAvatars: Avatar[] = [];
      for (const imageUrl of imageDataUrls) {
        const avatar = await storage.createAvatar({
          userId,
          prompt: JSON.stringify(params),
          imageUrl,
          stylizedUrl: null,
          public: false,
          gender: params.gender,
          hairStyle: params.hairStyle,
          hairColor: params.hairColor,
          artStyle: params.artStyle,
          auraEffect: params.auraEffect,
          resolution: params.resolution,
        });
        savedAvatars.push(avatar);
      }

      if (!user.premium) {
        await storage.updateUserCredits(userId, user.credits - 1);
      }

      res.json({ avatars: savedAvatars, creditsRemaining: user.premium ? "unlimited" : user.credits - 1 });
    } catch (error: any) {
      console.error("Avatar generation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Avatar CRUD endpoints
  app.get("/api/avatars/:id", async (req, res) => {
    try {
      const avatar = await storage.getAvatarById(req.params.id);
      if (!avatar) {
        return res.status(404).json({ message: "Avatar not found" });
      }
      res.json(avatar);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/avatars", async (req, res) => {
    try {
      const avatars = await storage.getUserAvatars(req.params.userId);
      res.json(avatars);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/avatars/public/gallery", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const avatars = await storage.getPublicAvatars(limit);
      res.json(avatars);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/avatars/:id/public", async (req, res) => {
    try {
      const { public: isPublic } = req.body;
      await storage.updateAvatarPublic(req.params.id, isPublic);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/avatars/:id", async (req, res) => {
    try {
      await storage.deleteAvatar(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
