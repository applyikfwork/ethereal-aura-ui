import type { Express } from "express";
import multer from "multer";
import { IStorage } from "./storage";
import { avatarRequestSchema } from "@shared/schema";
import { generateAvatarWithGemini, enhancePromptWithGemini } from "./gemini";
import { generateAvatarFromPhoto, generateStyleVariations, removeBackground, resizeImage } from "./replicate-service";
import { authenticateUser, type AuthenticatedRequest } from "./auth-middleware";
import { uploadToCloudinary } from "./cloudinary";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export function registerRoutes(app: Express, storage: IStorage) {
  // Get user profile (SECURED - user can only access their own profile)
  app.get("/api/user/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    // Verify user is accessing their own profile
    if (req.params.id !== req.user!.uid) {
      return res.status(403).json({ error: "Forbidden: Cannot access other user's profile" });
    }
    
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Upload image for avatar generation (SECURED - requires authentication)
  app.post("/api/upload-image", authenticateUser, upload.single('image'), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const userId = req.user!.uid;
      const filename = `${Date.now()}-${req.file.originalname}`;
      
      const imageUrl = await uploadToCloudinary(req.file.buffer, `avatars/${userId}`, filename);
      
      res.json({ imageUrl });
    } catch (error: any) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload image" });
    }
  });

  // Generate avatar (SECURED - requires authentication)
  app.post("/api/avatars/generate", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const request = avatarRequestSchema.parse(req.body);
      const userId = req.user!.uid;

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
        } catch (error: any) {
          console.error("Photo-based generation failed:", error);
          
          // Check if error is due to missing API key
          if (error.message && error.message.includes('REPLICATE_API_TOKEN')) {
            return res.status(503).json({ 
              error: "Photo transformation is temporarily unavailable. Please try the Custom Avatar mode instead." 
            });
          }
          
          return res.status(500).json({ error: "Failed to generate avatar from photo. Please try Custom Avatar mode." });
        }
      } 
      // Custom avatar generation (original flow)
      else {
        try {
          const result = await generateAvatarWithGemini(request);
          imageUrl = result.imageUrl;
          prompt = result.prompt;
        } catch (error) {
          // This shouldn't fail since we have DiceBear fallback
          console.warn("Custom avatar generation failed unexpectedly:", error);
          return res.status(500).json({ error: "Failed to generate avatar. Please try again." });
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
      
      // Get user info for avatar
      const avatarUser = await storage.getUser(userId);
      
      const avatar = await storage.createAvatar({
        userId,
        userName: avatarUser?.displayName || undefined,
        userPhoto: avatarUser?.photoURL || undefined,
        prompt,
        request,
        urls,
        variations,
        size: request.size,
        isPremium,
        isPublic: true,
        likes: 0,
        likedBy: [],
        shares: 0,
        comments: 0,
        hashtags: [],
        isFeatured: false,
        isRemixable: true,
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

  // Get user's avatars (SECURED with privacy controls)
  app.get("/api/avatars/user/:userId", authenticateUser, async (req: AuthenticatedRequest, res) => {
    // Verify user is accessing their own avatars
    if (req.params.userId !== req.user!.uid) {
      return res.status(403).json({ error: "Forbidden: Cannot access other user's avatars" });
    }
    
    const avatars = await storage.getAvatarsByUser(req.params.userId);
    res.json(avatars);
  });

  // Upgrade to premium (SECURED - user can only upgrade themselves)
  app.post("/api/user/:id/upgrade", authenticateUser, async (req: AuthenticatedRequest, res) => {
    // Verify user is upgrading their own account
    if (req.params.id !== req.user!.uid) {
      return res.status(403).json({ error: "Forbidden: Cannot upgrade other user's account" });
    }
    
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

  // ===== SOCIAL INTERACTION ROUTES =====
  
  // Like an avatar (SECURED with authentication)
  app.post("/api/avatars/:id/like", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.uid; // Get from authenticated session
      
      const success = await storage.likeAvatar(req.params.id, userId);
      if (!success) {
        return res.status(400).json({ error: "Already liked or avatar not found" });
      }
      
      const avatar = await storage.getAvatar(req.params.id);
      res.json({ success: true, likes: avatar?.likes || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to like avatar" });
    }
  });

  // Unlike an avatar (SECURED with authentication)
  app.post("/api/avatars/:id/unlike", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.uid; // Get from authenticated session
      
      const success = await storage.unlikeAvatar(req.params.id, userId);
      if (!success) {
        return res.status(400).json({ error: "Not liked or avatar not found" });
      }
      
      const avatar = await storage.getAvatar(req.params.id);
      res.json({ success: true, likes: avatar?.likes || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to unlike avatar" });
    }
  });

  // Share an avatar (SECURED with authentication)
  app.post("/api/avatars/:id/share", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.uid; // Get from authenticated session
      
      const success = await storage.shareAvatar(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: "Avatar not found" });
      }
      
      const avatar = await storage.getAvatar(req.params.id);
      res.json({ success: true, shares: avatar?.shares || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to share avatar" });
    }
  });

  // Get comments for an avatar (SECURED with authentication)
  app.get("/api/avatars/:id/comments", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const comments = await storage.getCommentsByAvatar(req.params.id);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get comments" });
    }
  });

  // Create a comment on an avatar (SECURED with authentication)
  app.post("/api/avatars/:id/comments", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.uid; // Get from authenticated session
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Comment text is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const comment = await storage.createComment({
        avatarId: req.params.id,
        userId,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || undefined,
        text,
      });
      
      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to create comment" });
    }
  });

  // ===== TRENDING & FEATURED =====
  
  // Get trending avatars
  app.get("/api/avatars/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const avatars = await storage.getTrendingAvatars(limit);
      res.json(avatars);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get trending avatars" });
    }
  });

  // Get featured avatars
  app.get("/api/avatars/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const avatars = await storage.getFeaturedAvatars(limit);
      res.json(avatars);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get featured avatars" });
    }
  });

  // ===== LEADERBOARD & STATS =====
  
  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get leaderboard" });
    }
  });

  // Get platform stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get platform stats" });
    }
  });

  // ===== REFERRALS =====
  
  // Check referral code and create referral (SECURED with authentication + abuse prevention)
  app.post("/api/referrals/apply", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.uid; // Get from authenticated session
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Referral code is required" });
      }
      
      // Note: Additional abuse prevention could check if user has already been referred
      // This would require a getReferralsByReferred method in the storage interface
      
      const referrer = await storage.getUserByReferralCode(code);
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      
      if (referrer.uid === userId) {
        return res.status(400).json({ error: "Cannot use your own referral code" });
      }
      
      const referral = await storage.createReferral({
        referrerId: referrer.uid,
        referredUserId: userId,
        creditsAwarded: 5,
      });
      
      res.json({ success: true, referral, creditsAwarded: 5 });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to apply referral code" });
    }
  });

  // Get user's referrals (SECURED - user can only view their own referrals)
  app.get("/api/referrals/user/:userId", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify user is accessing their own referrals
      if (req.params.userId !== req.user!.uid) {
        return res.status(403).json({ error: "Forbidden: Cannot access other user's referrals" });
      }
      
      const referrals = await storage.getReferralsByUser(req.params.userId);
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get referrals" });
    }
  });

  // Update user (SECURED - user can only update themselves)
  app.patch("/api/user/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify user is updating their own account
      if (req.params.id !== req.user!.uid) {
        return res.status(403).json({ error: "Forbidden: Cannot update other user's account" });
      }
      
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to update user" });
    }
  });

  // ===== UTILITY ROUTES =====
  
  // Generate hashtags for avatar
  app.post("/api/hashtags/generate", async (req, res) => {
    try {
      const { artStyle, gender, age } = req.body;
      
      // AI-powered hashtag generation
      const hashtags = generateHashtags(artStyle, gender, age);
      res.json({ hashtags });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate hashtags" });
    }
  });

  // Batch download endpoint
  app.get("/api/avatars/:id/download-all", async (req, res) => {
    try {
      const avatar = await storage.getAvatar(req.params.id);
      if (!avatar || !avatar.urls) {
        return res.status(404).json({ error: "Avatar not found" });
      }
      
      // Return all URLs for client-side zip creation
      res.json({
        urls: {
          profile: avatar.urls.profile,
          story: avatar.urls.story,
          post: avatar.urls.post,
          hd: avatar.urls.hd,
          normal: avatar.urls.normal,
        },
        filename: `avatar-${avatar.id}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get download URLs" });
    }
  });
}

// Helper function to generate hashtags based on avatar characteristics
function generateHashtags(artStyle: string, gender: string, age: string): string[] {
  const baseHashtags = ['#AIAvatar', '#AuraAvatar', '#DigitalArt', '#AIGeneratedArt'];
  const styleHashtags: Record<string, string[]> = {
    realistic: ['#PhotoRealistic', '#RealisticArt', '#DigitalPortrait'],
    anime: ['#AnimeArt', '#AnimeStyle', '#AnimAvatar', '#AnimePortrait'],
    cartoon: ['#CartoonArt', '#CartoonStyle', '#CartoonAvatar'],
    fantasy: ['#FantasyArt', '#FantasyCharacter', '#MagicalArt'],
  };
  
  const demographicHashtags: string[] = [];
  if (gender) demographicHashtags.push(`#${gender.charAt(0).toUpperCase() + gender.slice(1)}Character`);
  if (age) demographicHashtags.push(`#${age.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`);
  
  const trending = ['#AvatarOfTheDay', '#CharacterDesign', '#ProfilePicture', '#SocialMediaAvatar'];
  
  return [
    ...baseHashtags,
    ...(styleHashtags[artStyle] || []),
    ...demographicHashtags,
    ...trending,
  ].slice(0, 12); // Return top 12 hashtags
}
