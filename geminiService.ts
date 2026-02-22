
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeCanImage(base64Image: string) {
  const base64Data = base64Image.split(',')[1] || base64Image;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: "Analyze this beverage can and provide metadata in JSON format. Fields: group (the parent company, e.g. Coca-Cola Company), acronym (short code for group), brand (the drink brand), name (specific product name), year (approximate release year if visible), size (volume in ml), imageDesc (a technical description for filenames). Return only the JSON." },
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

export async function analyzeCreditCardImage(base64Image: string) {
  const base64Data = base64Image.split(',')[1] || base64Image;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: "Analyze this credit card (front view) and provide metadata in JSON format. Fields: cardName (e.g. Nubank Ultravioleta), issuer (Bank name), network (Visa, Mastercard, etc), category (Gold, Platinum, Black, etc), year (approximate release/issue year), imageDesc (technical description for filename). Return only JSON." },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cardName: { type: Type.STRING },
            issuer: { type: Type.STRING },
            network: { type: Type.STRING },
            category: { type: Type.STRING },
            year: { type: Type.STRING },
            imageDesc: { type: Type.STRING },
          },
          required: ["cardName", "issuer", "network", "category", "imageDesc"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error (Card):", error);
    return null;
  }
}

export async function analyzeCarMiniatureImage(base64Image: string) {
  const base64Data = base64Image.split(',')[1] || base64Image;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: "Analyze this car miniature (diecast) and provide metadata in JSON format. Fields: minatureName (model name), miniatureBrand (Hot Wheels, Matchbox...), line (Mainline, STH, Premium...), year (release year), scale (1:64...), condition (Mint, Loose...), mainColor, material, origin (real | fantasia | conceito), realCarBrand, realCarModel, segment (SUV, Muscle, Supercar...), imageDesc (filename format). Return only JSON." },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            minatureName: { type: Type.STRING },
            miniatureBrand: { type: Type.STRING },
            line: { type: Type.STRING },
            year: { type: Type.STRING },
            scale: { type: Type.STRING },
            condition: { type: Type.STRING },
            mainColor: { type: Type.STRING },
            material: { type: Type.STRING },
            origin: { type: Type.STRING },
            realCarBrand: { type: Type.STRING },
            realCarModel: { type: Type.STRING },
            segment: { type: Type.STRING },
            imageDesc: { type: Type.STRING },
          },
          required: ["minatureName", "miniatureBrand", "line", "scale", "imageDesc"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error (Car):", error);
    return null;
  }
}
