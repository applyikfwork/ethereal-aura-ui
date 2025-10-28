import { GoogleGenerativeAI } from '@google/generative-ai';
import Replicate from 'replicate';
import type { AvatarRequest } from '@shared/schema';

let genAI: GoogleGenerativeAI | null = null;
let replicate: Replicate | null = null;

// Initialize Replicate lazily when API key is available
function getReplicateClient(): Replicate | null {
  if (replicate) return replicate;
  
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (apiToken && apiToken.trim().length > 0) {
    replicate = new Replicate({ auth: apiToken });
    return replicate;
  }
  
  return null;
}

export async function initializeGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function getGeminiApiKey(): Promise<string | null> {
  try {
    // Use Replit secret for secure API key management
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || null;
  } catch (error) {
    console.error('Failed to get Gemini API key:', error);
    return null;
  }
}

export function generateAvatarPrompt(request: AvatarRequest): string {
  const {
    gender,
    age,
    ethnicity,
    hairStyle,
    hairColor,
    outfit,
    accessories,
    background,
    artStyle,
    auraEffect,
    pose,
    customPrompt,
  } = request;

  if (customPrompt) {
    return `Create a high-quality ${artStyle} style avatar: ${customPrompt}. Square composition, professional quality.`;
  }

  let prompt = `Create a high-quality ${artStyle} style avatar portrait of a ${age} ${gender}`;
  prompt += `, ${ethnicity} ethnicity`;
  prompt += `, with ${hairStyle} ${hairColor} hair`;
  prompt += `, wearing ${outfit}`;

  if (accessories.length > 0) {
    prompt += `, with ${accessories.join(', ')}`;
  }

  prompt += `. ${pose} view`;

  if (auraEffect !== 'none') {
    prompt += `, with ${auraEffect} effect around the character`;
  }

  if (background === 'transparent') {
    prompt += `, transparent background`;
  } else if (background === 'gradient') {
    prompt += `, soft gradient background`;
  }

  prompt += `. High detail, professional quality, square composition, suitable for avatar use.`;

  return prompt;
}

/**
 * Generate avatar with Gemini-enhanced prompts and Replicate AI
 * 
 * This function uses:
 * 1. Gemini AI to enhance the text prompt (if API key available)
 * 2. Replicate's SDXL model to generate the actual avatar image
 */
export async function generateAvatarWithGemini(
  request: AvatarRequest
): Promise<{ imageUrl: string; prompt: string }> {
  const apiKey = await getGeminiApiKey();
  
  let enhancedPrompt: string;
  
  // Try to enhance prompt with Gemini if API key is available
  if (apiKey) {
    if (!genAI) {
      initializeGemini(apiKey);
    }
    
    try {
      const basePrompt = generateAvatarPrompt(request);
      enhancedPrompt = await enhancePromptWithGemini(basePrompt);
      console.log('Enhanced prompt with Gemini:', enhancedPrompt);
    } catch (error) {
      console.warn('Failed to enhance prompt with Gemini, using base prompt:', error);
      enhancedPrompt = generateAvatarPrompt(request);
    }
  } else {
    console.log('Gemini API key not available, using base prompt');
    enhancedPrompt = generateAvatarPrompt(request);
  }

  // Try to generate image using Replicate SDXL if API key is available
  const replicateClient = getReplicateClient();
  
  if (replicateClient) {
    try {
      console.log('Generating avatar with Replicate using prompt:', enhancedPrompt);
      
      const model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
      
      const output = await replicateClient.run(model as any, {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: 'low quality, blurry, distorted, disfigured, ugly, bad anatomy, multiple people, watermark, text',
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 30,
          width: parseInt(request.size),
          height: parseInt(request.size),
        },
      }) as string[];

      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      return {
        imageUrl,
        prompt: enhancedPrompt,
      };
    } catch (error) {
      console.error('Replicate generation failed:', error);
    }
  } else {
    console.log('Replicate API not configured, using DiceBear fallback');
  }
  
  // Fallback to DiceBear - generate high-quality avatar based on parameters
  const style = getDiceBearStyle(request.artStyle, request.gender);
  const seed = generateDiceBearSeed(request);
  const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  
  console.log('Using DiceBear avatar with style:', style);
  return {
    imageUrl: avatarUrl,
    prompt: enhancedPrompt,
  };
}

// Helper function to choose appropriate DiceBear style based on art style
function getDiceBearStyle(artStyle: string, gender: string): string {
  if (artStyle === 'anime' || artStyle === 'cartoon') {
    return 'big-smile';
  }
  if (artStyle === 'fantasy') {
    return 'adventurer';
  }
  // For realistic, use avataaars or personas based on gender
  return gender === 'female' ? 'avataaars' : 'personas';
}

// Generate a unique but consistent seed based on avatar parameters
function generateDiceBearSeed(request: AvatarRequest): string {
  const parts = [
    request.gender,
    request.age,
    request.ethnicity,
    request.hairStyle.replace(/\s+/g, '-'),
    request.hairColor.replace(/\s+/g, '-'),
    Date.now().toString(),
  ];
  return parts.join('-').toLowerCase();
}

// Alternative: Use Gemini to enhance prompts for image generation services
export async function enhancePromptWithGemini(userPrompt: string): Promise<string> {
  const apiKey = await getGeminiApiKey();
  
  if (!apiKey) {
    return userPrompt;
  }

  if (!genAI) {
    initializeGemini(apiKey);
  }

  try {
    const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });
    
    const enhancePrompt = `You are an AI art prompt expert. Take this user's avatar description and enhance it into a detailed, vivid prompt suitable for AI image generation. Keep it under 100 words and focus on visual details.

User description: ${userPrompt}

Enhanced prompt:`;

    const result = await model.generateContent(enhancePrompt);
    const response = await result.response;
    const enhancedPrompt = response.text();
    
    return enhancedPrompt;
  } catch (error) {
    console.error('Failed to enhance prompt with Gemini:', error);
    return userPrompt;
  }
}
