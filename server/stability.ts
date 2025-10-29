import FormData from "form-data";
import type { AvatarGenerationParams } from "../shared/schema";

// Lazy-load to ensure environment variables are ready
let apiKey: string | null = null;

function getApiKey(): string {
  if (!apiKey) {
    apiKey = process.env.STABILITY_API_KEY || "";
    if (!apiKey) {
      console.error("STABILITY_API_KEY is not set in environment variables");
      throw new Error("STABILITY_API_KEY is required for avatar generation. Please set it in Replit Secrets.");
    }
  }
  return apiKey;
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

  let prompt = `professional portrait photograph of a ${age} ${gender} with ${skinTone} skin tone, `;
  prompt += `${hairStyle} ${hairColor} hair, wearing ${outfit} clothing, `;
  prompt += `${pose} view, ${artStyle} art style, `;

  if (background !== "transparent") {
    prompt += `${background} background, `;
  } else {
    prompt += `clean white background, `;
  }

  if (auraEffect !== "none") {
    prompt += `with ${auraEffect} glowing magical aura effect surrounding the character, `;
  }

  prompt += `ultra detailed, high quality, sharp focus, professional lighting, centered composition`;

  return prompt;
}

function buildNegativePrompt(): string {
  return "blurry, distorted, ugly, multiple faces, multiple people, text, watermark, nsfw, deformed, low quality, bad anatomy, extra limbs, disfigured, poor composition, cropped, out of frame";
}

export async function generateAvatar(
  params: AvatarGenerationParams
): Promise<string> {
  try {
    const prompt = buildAvatarPrompt(params);
    const negativePrompt = buildNegativePrompt();

    console.log("Generating avatar with Stability AI");
    console.log("Prompt:", prompt);

    const key = getApiKey();

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("aspect_ratio", "1:1");
    formData.append("output_format", "png");

    // Use Stability AI v2beta API for image generation
    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Accept": "application/json",
          ...formData.getHeaders(),
        },
        body: formData as any,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stability AI API error:", response.status, errorText);
      
      if (response.status === 401) {
        throw new Error("Invalid Stability AI API key. Please check your STABILITY_API_KEY in Replit Secrets.");
      } else if (response.status === 402) {
        throw new Error("Insufficient credits in your Stability AI account. Please add credits at https://platform.stability.ai/");
      } else if (response.status === 403) {
        throw new Error("Access forbidden. Please check your Stability AI API permissions.");
      } else {
        throw new Error(`Stability AI API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();

    if (!data.image) {
      throw new Error("No image data returned from Stability AI");
    }

    // Return base64 encoded image as data URL
    return `data:image/png;base64,${data.image}`;
  } catch (error: any) {
    console.error("Failed to generate avatar:", error);
    
    if (error.message && error.message.includes("fetch")) {
      throw new Error("Network error connecting to Stability AI. Please check your internet connection.");
    }
    
    throw error;
  }
}

export async function generateMultipleAvatars(
  params: AvatarGenerationParams,
  count: number = 4
): Promise<string[]> {
  try {
    console.log(`Generating ${count} avatars with Stability AI`);

    // Stability AI doesn't support batch generation in one call,
    // so we make multiple parallel requests
    const promises = Array(count)
      .fill(null)
      .map(() => generateAvatar(params));

    const results = await Promise.all(promises);

    console.log(`Successfully generated ${results.length} avatars`);
    return results;
  } catch (error: any) {
    console.error("Failed to generate multiple avatars:", error);
    throw error;
  }
}
