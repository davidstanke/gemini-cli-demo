import { GoogleGenAI, Type } from "@google/genai";
import { SpecialItem, Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestRecipes(items: SpecialItem[]): Promise<Recipe[]> {
  const itemsList = items.map(i => `${i.name} (on sale for $${i.salePrice})`).join(', ');
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 3 unique, gourmet recipes that primarily feature these supermarket special items: ${itemsList}. 
    Focus on making the most of the sale items. 
    Each recipe must include a name, list of ingredients (including standard pantry staples if needed), and step-by-step instructions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            ingredients: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            instructions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["name", "ingredients", "instructions"]
        }
      }
    }
  });

  const recipesRaw = JSON.parse(response.text || "[]");
  return recipesRaw.map((r: any, idx: number) => ({
    ...r,
    id: `recipe-${Date.now()}-${idx}`,
    imageUrl: '' // To be filled by generation
  }));
}

export async function generateRecipeImage(recipeName: string, ingredients: string[]): Promise<string> {
  try {
    const prompt = `A professional, high-end, photorealistic food photography shot of a finished dish: ${recipeName}. 
    The dish features ingredients like ${ingredients.slice(0, 5).join(', ')}. 
    Plated beautifully on a ceramic dish in a bright, modern kitchen setting. 
    Soft natural lighting, shallow depth of field, appetizing and gourmet.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (error) {
    console.error("Image generation failed:", error);
    return "https://picsum.photos/seed/food/800/800";
  }
}
