import { GoogleGenAI } from "@google/genai";
import type { AvatarGenerationParams } from "../shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// Lazy-load the AI client to ensure environment variables are ready
let ai: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('GEMINI')));
      throw new Error("GEMINI_API_KEY is required for avatar generation. Please set it in Replit Secrets.");
    }
    // This API key is from Gemini Developer API Key, not vertex AI API Key
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

function buildAvatarPrompt(params: AvatarGenerationParams): string {
  const {
    gender,
    age,
    skinTone,
    hairStyle,
    hairColor,
    outfit,
    background,
    artStyle,
    pose,
    auraEffect,
  } = params;

  let prompt = `Create a high-quality ${artStyle} digital portrait of a ${age} ${gender} with ${skinTone} skin tone. `;
  prompt += `Hair: ${hairStyle} style, ${hairColor} color. `;
  prompt += `Outfit: ${outfit}. `;
  prompt += `Pose: ${pose} view. `;

  if (background !== "transparent") {
    prompt += `Background: ${background}. `;
  } else {
    prompt += `Background: clean white background. `;
  }

  if (auraEffect !== "none") {
    prompt += `Add a ${auraEffect} glowing aura effect around the character. `;
  }

  prompt += `Style: professional digital art, ultra detailed, high quality, centered composition, soft studio lighting, sharp focus. `;
  prompt += `Avoid: multiple faces, multiple people, text, watermarks, blurry, distorted, low quality, bad anatomy, extra limbs, disfigured.`;

  return prompt;
}

export async function generateAvatar(
  params: AvatarGenerationParams
): Promise<string> {
  try {
    const prompt = buildAvatarPrompt(params);

    console.log("Generating avatar with prompt:", prompt);

    const client = getAIClient();

    // Use Imagen 4.0 for high-quality image generation
    const response = await client.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No image generated");
    }

    const generatedImage = response.generatedImages[0];
    if (!generatedImage.image || !generatedImage.image.imageBytes) {
      throw new Error("No image data in response");
    }

    const imageData = generatedImage.image.imageBytes;
    return `data:image/png;base64,${imageData}`;
  } catch (error: any) {
    console.error("Failed to generate avatar:", error);
    
    // Provide more detailed error information
    if (error.message && error.message.includes("quota")) {
      throw new Error("API quota exceeded. Please try again later or check your Gemini API quota.");
    } else if (error.message && error.message.includes("API key")) {
      throw new Error("Invalid API key. Please check your GEMINI_API_KEY in Replit Secrets.");
    } else {
      throw new Error(`Failed to generate avatar: ${error.message || error}`);
    }
  }
}

export async function generateMultipleAvatars(
  params: AvatarGenerationParams,
  count: number = 4
): Promise<string[]> {
  try {
    const prompt = buildAvatarPrompt(params);

    console.log(`Generating ${count} avatars with prompt:`, prompt);

    const client = getAIClient();

    // Use Imagen 4.0 batch generation (more efficient than multiple calls)
    const response = await client.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: prompt,
      config: {
        numberOfImages: count,
        aspectRatio: "1:1",
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No images generated");
    }

    const imageDataUrls: string[] = [];
    for (const generatedImage of response.generatedImages) {
      if (generatedImage.image && generatedImage.image.imageBytes) {
        const imageData = generatedImage.image.imageBytes;
        imageDataUrls.push(`data:image/png;base64,${imageData}`);
      }
    }

    if (imageDataUrls.length === 0) {
      throw new Error("No valid image data in response");
    }

    console.log(`Successfully generated ${imageDataUrls.length} avatars`);
    return imageDataUrls;
  } catch (error: any) {
    console.error("Failed to generate multiple avatars:", error);
    
    // Provide more detailed error information
    if (error.message && error.message.includes("quota")) {
      throw new Error("API quota exceeded. Please try again later or check your Gemini API quota.");
    } else if (error.message && error.message.includes("API key")) {
      throw new Error("Invalid API key. Please check your GEMINI_API_KEY in Replit Secrets.");
    } else {
      throw new Error(`Failed to generate avatars: ${error.message || error}`);
    }
  }
}
