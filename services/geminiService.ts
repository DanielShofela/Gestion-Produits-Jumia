import { GoogleGenAI } from "@google/genai";

// Note: In a real production app, this key should be proxied via a backend.
// For this client-side demo, we use the env variable directly.
const API_KEY = process.env.API_KEY || '';

export const generateDescription = async (name: string, category: string, variation: string) => {
  if (!API_KEY) {
    throw new Error("API Key manquante. Veuillez configurer votre clé API Gemini.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Agis comme un expert marketing e-commerce pour Jumia.
    Rédige une description courte (1 phrase d'accroche) et une description longue (3 points clés avec avantages) pour le produit suivant :
    
    Produit: ${name}
    Catégorie: ${category}
    Variation: ${variation}

    Format de réponse souhaité (JSON uniquement):
    {
      "shortDesc": "...",
      "longDesc": "..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA");
    
    return JSON.parse(text) as { shortDesc: string, longDesc: string };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};