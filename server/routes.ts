import type { Express } from "express";
import multer from "multer";
import { IStorage } from "./storage";
import { avatarRequestSchema } from "@shared/schema";
import { generateAvatarWithGemini, enhancePromptWithGemini, generateAvatarPrompt } from "./gemini";
import { generateAvatarFromPhoto, generateStyleVariations, removeBackground, uploadImageToFirebase, resizeImage } from "./replicate-service";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export function registerRoutes(app: Express, storage: IStorage) {
  // Get user profile
  app.get("/api/user/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Upload image for avatar generation
  app.post("/api/upload-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const userId = req.body.userId || "demo";
      const filename = `${Date.now()}-${req.file.originalname}`;
      
      const imageUrl = await uploadImageToFirebase(req.file.buffer, userId, filename);
      
      res.json({ imageUrl });
    } catch (error: any) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload image" });
    }
  });

  // Generate avatar (supports both custom and photo-based)
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

      let imageUrl: string;
      let prompt: string;
      let variations: Array<{ style: string; url: string }> | undefined;
      
      // Photo-based avatar generation
      if (request.uploadedImageUrl) {
        try {
          const result = await generateAvatarFromPhoto(request.uploadedImageUrl, request);
          imageUrl = result.imageUrl;
          prompt = result.prompt;
          
          // Generate variations if premium
          if (isPremium) {
            variations = await generateStyleVariations(request.uploadedImageUrl, request);
          }
        } catch (error) {
          console.error("Photo-based generation failed:", error);
          return res.status(500).json({ error: "Failed to generate avatar from photo. Please try again." });
        }
      } 
      // Custom avatar generation (original flow)
      else {
        try {
          const result = await generateAvatarWithGemini(request);
          imageUrl = result.imageUrl;
          prompt = result.prompt;
        } catch (error) {
          console.warn("Gemini generation failed, using fallback:", error);
          prompt = generateAvatarPrompt(request);
          const style = request.artStyle || 'avataaars';
          const seed = `${request.gender}-${request.age}-${Date.now()}`;
          imageUrl = `https://api.dicebear.com/7.x/${style === 'realistic' ? 'avataaars' : style === 'anime' ? 'big-smile' : 'bottts'}/svg?seed=${seed}`;
        }
      }

      // Generate multiple export sizes
      const urls: any = {
        normal: imageUrl,
        thumbnail: imageUrl,
        stylized: isPremium ? imageUrl : undefined,
      };

      if (isPremium && request.uploadedImageUrl) {
        urls.profile = await resizeImage(imageUrl, 400, 400);
        urls.story = await resizeImage(imageUrl, 1080, 1920);
        urls.post = await resizeImage(imageUrl, 1080, 1080);
        urls.hd = await resizeImage(imageUrl, 2048, 2048);
      }
      
      const avatar = await storage.createAvatar({
        userId,
        prompt,
        request,
        urls,
        variations,
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
      console.error("Avatar generation error:", error);
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

  // Remove background from image
  app.post("/api/remove-background", async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      const resultUrl = await removeBackground(imageUrl);
      res.json({ imageUrl: resultUrl });
    } catch (error: any) {
      console.error("Background removal error:", error);
      res.status(500).json({ error: error.message || "Failed to remove background" });
    }
  });

  // Generate style variations
  app.post("/api/generate-variations", async (req, res) => {
    try {
      const { imageUrl } = req.body;
      const request = avatarRequestSchema.parse(req.body.request || {});
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      const variations = await generateStyleVariations(imageUrl, request);
      res.json({ variations });
    } catch (error: any) {
      console.error("Variation generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate variations" });
    }
  });
}
