import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeMeal(image?: string, description?: string) {
  const prompt = `
    Analyze this meal. If an image is provided, identify the food. If a description is provided, use that.
    Provide nutritional information: calories, protein (g), carbs (g), fat (g).
    Also provide a health score (0-100) and 2-3 short health tips.
    
    Return the data in JSON format.
  `;

  const parts: any[] = [{ text: prompt }];
  
  if (image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: image.split(',')[1]
      }
    });
  }
  
  if (description) {
    parts.push({ text: `Description: ${description}` });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedFood: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            healthScore: { type: Type.NUMBER },
            tips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["detectedFood", "calories", "protein", "carbs", "fat", "healthScore", "tips"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
}
