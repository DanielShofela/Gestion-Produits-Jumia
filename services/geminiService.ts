import { GoogleGenAI, Type } from "@google/genai";

export const generateDescription = async (name: string, category: string, variation: string) => {
  // Use process.env.API_KEY directly as required by guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Agis comme un expert marketing e-commerce pour Jumia.
    Rédige une description courte (1 phrase d'accroche) et une description longue (3 points clés avec avantages) pour le produit suivant :
    
    Produit: ${name}
    Catégorie: ${category}
    Variation: ${variation}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortDesc: {
              type: Type.STRING,
              description: "Une description courte (1 phrase d'accroche)",
            },
            longDesc: {
              type: Type.STRING,
              description: "Une description longue (3 points clés avec avantages)",
            },
          },
          required: ["shortDesc", "longDesc"],
        },
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