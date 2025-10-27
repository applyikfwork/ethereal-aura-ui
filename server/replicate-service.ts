import Replicate from 'replicate';
import type { AvatarRequest } from '@shared/schema';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface GenerationResult {
  imageUrl: string;
  variations?: Array<{ style: string; url: string }>;
  prompt: string;
}

export async function generateAvatarFromPhoto(
  imageUrl: string,
  request: AvatarRequest
): Promise<GenerationResult> {
  try {
    const { artStyle, background, auraEffect } = request;

    let stylePrompt = '';
    let model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

    switch (artStyle) {
      case 'anime':
        stylePrompt = 'anime style, vibrant colors, detailed anime character portrait';
        break;
      case 'cartoon':
        stylePrompt = '3D cartoon style, pixar style, smooth cartoon rendering';
        break;
      case 'fantasy':
        stylePrompt = 'fantasy art style, magical, ethereal, detailed fantasy portrait';
        break;
      case 'realistic':
      default:
        stylePrompt = 'photorealistic, high detail, professional portrait';
        break;
    }

    let backgroundPrompt = '';
    if (background === 'gradient') {
      backgroundPrompt = 'soft gradient background, studio lighting';
    } else if (background === 'transparent') {
      backgroundPrompt = 'simple background, easy to remove';
    }

    let effectPrompt = '';
    if (auraEffect === 'light-glow') {
      effectPrompt = ', glowing aura effect, soft light emanating';
    } else if (auraEffect === 'holographic') {
      effectPrompt = ', holographic effect, iridescent, futuristic';
    }

    const prompt = `transform this person into ${stylePrompt}${effectPrompt}, ${backgroundPrompt}, high quality, detailed, portrait`;

    const output = await replicate.run(model as any, {
      input: {
        image: imageUrl,
        prompt: prompt,
        negative_prompt: 'low quality, blurry, distorted, disfigured, ugly, bad anatomy',
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 25,
      },
    }) as string[];

    return {
      imageUrl: Array.isArray(output) ? output[0] : output,
      prompt,
    };
  } catch (error) {
    console.error('Replicate generation error:', error);
    throw new Error('Failed to generate avatar from photo');
  }
}

export async function generateStyleVariations(
  imageUrl: string,
  _request: AvatarRequest
): Promise<Array<{ style: string; url: string }>> {
  const styles = [
    { name: 'realistic', prompt: 'photorealistic, high detail, professional portrait' },
    { name: 'anime', prompt: 'anime style, vibrant colors, detailed anime character' },
    { name: 'cartoon', prompt: '3D cartoon style, pixar style, smooth rendering' },
    { name: 'cyberpunk', prompt: 'cyberpunk style, neon lights, futuristic, sci-fi' },
    { name: 'watercolor', prompt: 'watercolor painting style, soft colors, artistic' },
    { name: '3d-render', prompt: '3D rendered, CGI, high quality 3D model' },
  ];

  const variations: Array<{ style: string; url: string }> = [];

  for (const style of styles.slice(0, 4)) {
    try {
      const output = await replicate.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b' as any,
        {
          input: {
            image: imageUrl,
            prompt: `transform this person into ${style.prompt}, high quality avatar`,
            negative_prompt: 'low quality, blurry, distorted',
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 20,
          },
        }
      ) as string[];

      variations.push({
        style: style.name,
        url: Array.isArray(output) ? output[0] : output,
      });
    } catch (error) {
      console.error(`Failed to generate ${style.name} variation:`, error);
    }
  }

  return variations;
}

export async function removeBackground(imageUrl: string): Promise<string> {
  try {
    const output = await replicate.run(
      'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003' as any,
      {
        input: {
          image: imageUrl,
        },
      }
    ) as unknown as string;

    return output;
  } catch (error) {
    console.error('Background removal error:', error);
    throw new Error('Failed to remove background');
  }
}

export async function uploadImageToFirebase(
  imageBuffer: Buffer,
  userId: string,
  filename: string
): Promise<string> {
  try {
    const admin = await import('firebase-admin');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      });
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(`avatars/${userId}/${filename}`);
    
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/png',
      },
    });

    await file.makePublic();
    
    return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw new Error('Failed to upload image to storage');
  }
}

export async function resizeImage(
  imageUrl: string,
  width: number,
  height: number
): Promise<string> {
  try {
    const sharp = await import('sharp');
    
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    const resizedBuffer = await sharp.default(Buffer.from(buffer))
      .resize(width, height, { fit: 'cover' })
      .png()
      .toBuffer();
    
    return `data:image/png;base64,${resizedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Image resize error:', error);
    return imageUrl;
  }
}
