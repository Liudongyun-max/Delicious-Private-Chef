import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Schema, GenerateContentResponse } from "@google/genai";
import { Recipe } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  
  // Curated list of distinct and popular dishes
  private readonly DISHES = [
    "东坡肉", "西湖醋鱼", "龙井虾仁", "叫花鸡", "松鼠桂鱼",
    "宫保鸡丁", "鱼香肉丝", "麻婆豆腐", "回锅肉", "水煮鱼",
    "开水白菜", "文思豆腐", "佛跳墙", "白切鸡", "三杯鸡",
    "口水鸡", "辣子鸡", "剁椒鱼头", "红烧狮子头", "水晶虾仁",
    "九转大肠", "葱烧海参", "油焖大虾", "地三鲜", "锅包肉",
    "酸菜鱼", "毛血旺", "夫妻肺片", "干煸四季豆", "蚂蚁上树",
    "糖醋排骨", "红烧茄子", "清蒸鲈鱼", "蒜蓉粉丝蒸扇贝", "啤酒鸭",
    "粉蒸肉", "梅菜扣肉", "黄焖鸡", "新疆大盘鸡", "避风塘炒蟹"
  ];

  constructor() {
    const apiKey = process.env['API_KEY'];
    if (!apiKey) {
      console.error('API_KEY is missing in environment variables');
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  getRandomDishName(): string {
    const index = Math.floor(Math.random() * this.DISHES.length);
    return this.DISHES[index];
  }

  /**
   * Helper to timeout a promise
   */
  private withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), ms)
      )
    ]);
  }

  /**
   * Helper to clean JSON string from markdown
   */
  private cleanJson(text: string): string {
    if (!text) return '';
    // Remove markdown code blocks (```json ... ``` or just ``` ... ```)
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  async generateRecipe(dishName: string): Promise<Recipe> {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        servings: { type: Type.NUMBER },
        difficulty: { type: Type.STRING },
        time: {
          type: Type.OBJECT,
          properties: {
            prepMinutes: { type: Type.NUMBER },
            cookMinutes: { type: Type.NUMBER },
            totalMinutes: { type: Type.NUMBER },
          }
        },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              amount: { type: Type.STRING },
              optional: { type: Type.BOOLEAN },
              substitute: { type: Type.STRING },
            }
          }
        },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              step: { type: Type.NUMBER },
              text: { type: Type.STRING },
              timeMinutes: { type: Type.NUMBER },
              heatLevel: { type: Type.STRING },
              tips: { type: Type.STRING },
            }
          }
        },
        tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        nutrition: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fat: { type: Type.STRING },
          }
        }
      }
    };

    const prompt = `Create a detailed cooking recipe for the dish: "${dishName}". 
    The output must be in Chinese (Simplified). 
    Ensure all fields in the JSON schema are filled accurately. 
    For difficulty, use one of: "简单", "中等", "困难".`;

    // Retry logic: Try up to 2 times
    let lastError: any;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        // Increased timeout to 35 seconds to accommodate slower responses
        const response = await this.withTimeout<GenerateContentResponse>(
          this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: schema,
            },
          }),
          35000, 
          "Recipe generation timed out"
        );

        if (!response.text) {
          throw new Error('Failed to generate recipe text (empty response).');
        }

        const cleanedJson = this.cleanJson(response.text);
        return JSON.parse(cleanedJson) as Recipe;

      } catch (error) {
        console.warn(`Recipe generation attempt ${attempt} failed:`, error);
        lastError = error;
        // Wait 1 second before retrying
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.error("All recipe generation attempts failed.");
    throw lastError;
  }

  async generateImage(dishName: string): Promise<string> {
    const prompt = `A professional, high-resolution food photography shot of ${dishName}. 
    Delicious, appetizing, restaurant quality, warm lighting, top-down view or 45-degree angle.`;

    try {
      // Timeout image generation after 15 seconds (increased from 12)
      // We cast to any here because the exact Image Response type structure 
      // is dynamically handled.
      const response = await this.withTimeout(
        this.ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '4:3',
          },
        }),
        15000,
        "Image generation timed out"
      ) as any;

      const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (!base64ImageBytes) {
        // If API returns success but no bytes, fallback
        return `https://picsum.photos/800/600?random=${Date.now()}`;
      }

      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
      console.warn("Image generation failed or timed out, using placeholder.", error);
      // Fallback to a placeholder image immediately on error
      return `https://picsum.photos/800/600?random=${Date.now()}`;
    }
  }
}