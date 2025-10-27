import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AvatarRequest } from '@shared/schema';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

let genAI: GoogleGenerativeAI | null = null;

export async function initializeGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function getGeminiApiKey(): Promise<string | null> {
  try {
    // In a real implementation, this would fetch from Firestore
    // For now, we'll use environment variable as fallback
    return process.env.VITE_GEMINI_API_KEY || null;
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

export async function generateAvatarWithGemini(
  request: AvatarRequest
): Promise<{ imageUrl: string; prompt: string }> {
  const apiKey = await getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please contact admin.');
  }

  if (!genAI) {
    initializeGemini(apiKey);
  }

  const prompt = generateAvatarPrompt(request);

  // Note: Gemini doesn't directly generate images. 
  // This is a placeholder for the actual implementation.
  // You would need to use Imagen API or another image generation service.
  // For now, we'll use a placeholder service.
  
  console.log('Generated prompt:', prompt);
  
  // Placeholder: Return a DiceBear avatar for demonstration
  const seed = `${Date.now()}-${Math.random()}`;
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  
  return {
    imageUrl: avatarUrl,
    prompt,
  };
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
