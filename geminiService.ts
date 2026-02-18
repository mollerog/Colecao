
import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeCanImage(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extract the base64 part if it contains the data:image prefix
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              },
            },
            {
              text: "Analyze this beverage can and provide metadata in JSON format. Fields: group (the parent company, e.g. Coca-Cola Company), acronym (short code for group), brand (the drink brand), name (specific product name), year (approximate release year if visible), size (volume in ml), imageDesc (a technical description for filenames). Return only the JSON.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            group: { type: Type.STRING },
            acronym: { type: Type.STRING },
            brand: { type: Type.STRING },
            name: { type: Type.STRING },
            year: { type: Type.STRING },
            size: { type: Type.STRING },
            imageDesc: { type: Type.STRING },
          },
          required: ["group", "acronym", "brand", "size", "imageDesc"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}
