import { GoogleGenAI, Modality } from "@google/genai";
import type { AvatarGenerationParams } from "../shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

  let prompt = `Create a high-resolution avatar portrait of a ${age} ${gender}, ${skinTone} skin tone, `;
  prompt += `${hairStyle} ${hairColor} hair, wearing ${outfit} clothing, `;
  prompt += `${pose} view, ${artStyle} art style`;

  if (background !== "transparent") {
    prompt += `, ${background} background`;
  } else {
    prompt += `, clean white background`;
  }

  if (auraEffect !== "none") {
    prompt += `, with ${auraEffect} glowing aura effect around the character`;
  }

  prompt += `, professional digital art, ultra detailed, high quality, centered composition, soft lighting`;

  return prompt;
}

function buildNegativePrompt(): string {
  return "blurry, distorted, ugly, multiple faces, multiple people, text, watermark, nsfw, deformed, low quality, bad anatomy, extra limbs, disfigured, poor composition";
}

export async function generateAvatar(
  params: AvatarGenerationParams
): Promise<string> {
  try {
    const prompt = buildAvatarPrompt(params);
    const negativePrompt = buildNegativePrompt();

    console.log("Generating avatar with prompt:", prompt);

    // Use Gemini's image generation model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [
        { 
          role: "user", 
          parts: [{ 
            text: `${prompt}\n\nNegative prompt: ${negativePrompt}` 
          }] 
        }
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("No content in response");
    }

    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageData = part.inlineData.data;
        return `data:image/png;base64,${imageData}`;
      }
    }

    throw new Error("No image data in response");
  } catch (error) {
    console.error("Failed to generate avatar:", error);
    throw new Error(`Failed to generate avatar: ${error}`);
  }
}

export async function generateMultipleAvatars(
  params: AvatarGenerationParams,
  count: number = 4
): Promise<string[]> {
  const promises = Array(count).fill(null).map(() => generateAvatar(params));
  return Promise.all(promises);
}
