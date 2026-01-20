import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Schema, GenerateContentResponse } from "@google/genai";
import { GeneratedMenu, Recipe } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env['API_KEY'];
    if (!apiKey) {
      console.error('API_KEY is missing in environment variables');
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
    const timeout = new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    );
    return Promise.race([promise, timeout]);
  }

  private cleanJson(text: string): string {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  async generateMenu(prompt: string): Promise<GeneratedMenu> {
    const menuSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        menu_title: { type: Type.STRING },
        generated_at: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              time_min: { type: Type.NUMBER },
              difficulty: { type: Type.STRING, enum: ["简单", "中等", "困难"] },
              servings: { type: Type.NUMBER },
              image_prompt: { type: Type.STRING, description: "Detailed, realistic food photography prompt for an image generation model. Clean plating, natural light." },
            },
            required: ["id", "title", "tags", "time_min", "difficulty", "servings", "image_prompt"]
          }
        }
      },
      required: ["menu_title", "generated_at", "items"]
    };

    // The component now provides the full, detailed prompt.
    const response: GenerateContentResponse = await this.withTimeout(
      this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: menuSchema },
      }),
      45000,
      "Menu generation timed out."
    );
    
    if (!response.text) {
      throw new Error('Failed to generate menu (empty response).');
    }
    
    return JSON.parse(this.cleanJson(response.text)) as GeneratedMenu;
  }
  
  async generateRecipe(dishName: string): Promise<Recipe> {
    const recipeSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        summary: { type: Type.STRING, description: "A brief summary of the dish, max 60 characters." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        time_min: { type: Type.NUMBER },
        difficulty: { type: Type.STRING, enum: ["简单", "中等", "困难"] },
        servings: { type: Type.NUMBER },
        cover_image_prompt: { type: Type.STRING },
        ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, amount: { type: Type.STRING }, note: { type: Type.STRING }, substitute: { type: Type.STRING } } } },
        steps: {
          type: Type.ARRAY,
          description: "A minimum of 6 detailed steps.",
          items: {
            type: Type.OBJECT,
            properties: {
              step: { type: Type.NUMBER },
              title: { type: Type.STRING, description: "A short title for the step." },
              instruction: { type: Type.STRING, description: "Detailed instructions (action, purpose, notes), at least 40 characters." },
              duration_min: { type: Type.NUMBER },
              heat: { type: Type.STRING },
              tip: { type: Type.STRING, description: "A practical, actionable tip for this step." }
            }
          }
        },
        chef_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        nutrition: { type: Type.OBJECT, properties: { kcal: { type: Type.NUMBER }, protein_g: { type: Type.NUMBER }, fat_g: { type: Type.NUMBER }, carb_g: { type: Type.NUMBER } } }
      },
      required: ["id", "title", "summary", "tags", "time_min", "difficulty", "servings", "cover_image_prompt", "ingredients", "steps", "chef_tips", "nutrition"]
    };

    const prompt = `Create a detailed, high-quality cooking recipe for the dish: "${dishName}".
    The output must be in Chinese (Simplified).
    Ensure there are at least 6 detailed steps, each with a very descriptive instruction, title, and a useful tip.
    The response must be a single, valid JSON object that strictly adheres to the provided schema. Do not output any text outside the JSON.`;

    // FIX: Explicitly type the response to avoid 'unknown' type from withTimeout.
    const response: GenerateContentResponse = await this.withTimeout(
      this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: recipeSchema },
      }),
      60000,
      "Recipe detail generation timed out."
    );

    if (!response.text) {
      throw new Error('Failed to generate recipe details (empty response).');
    }
    
    return JSON.parse(this.cleanJson(response.text)) as Recipe;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      // FIX: Replace `as any` with a more specific type to ensure type safety.
      // The `generateImages` response type is not exported, so we use an inline structural type.
      const response: { generatedImages: { image: { imageBytes: string } }[] } = await this.withTimeout(
        this.ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: `Realistic food photography of "${prompt}", clean plating, appetizing, natural lighting, shallow depth of field, high resolution.`,
          config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
        }),
        30000,
        "Image generation timed out"
      );
      const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (!base64ImageBytes) {
        throw new Error("No image bytes returned from API.");
      }
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
      console.warn("Image generation failed, returning a placeholder.", error);
      // In a real app, you might have a proper placeholder or error state.
      // For this demo, we'll throw to let the UI handle it.
      throw new Error("Image generation failed");
    }
  }
}