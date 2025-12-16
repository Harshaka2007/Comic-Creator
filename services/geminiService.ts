import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ComicScript, PanelData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SCRIPT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export const generateComicScript = async (prompt: string, panelCount: number): Promise<ComicScript> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A catchy title for the comic strip" },
      panels: {
        type: Type.ARRAY,
        description: `Exactly ${panelCount} panels for the comic`,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "Detailed visual description of the scene, characters, lighting, and action for image generation. Be descriptive but concise." },
            dialogue: { type: Type.STRING, description: "Character dialogue (e.g., 'Hero: Watch out!'). Keep it short for bubbles." },
            caption: { type: Type.STRING, description: "Narrator caption or sound effects (e.g., 'BOOM!', 'Meanwhile...'). Optional." }
          },
          required: ["id", "description", "dialogue"]
        }
      }
    },
    required: ["title", "panels"]
  };

  try {
    const response = await ai.models.generateContent({
      model: SCRIPT_MODEL,
      contents: `Create a comic book script based on this idea: "${prompt}". The comic should have exactly ${panelCount} panels.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert comic book writer. Focus on visual storytelling. Ensure descriptions are vivid for an AI image generator."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No script generated");
    
    // Parse and add client-side state fields
    const data = JSON.parse(text);
    return {
      title: data.title,
      panels: data.panels.map((p: any) => ({ ...p, isGenerating: false }))
    };

  } catch (error) {
    console.error("Script generation failed:", error);
    throw error;
  }
};

export const translateScript = async (panels: PanelData[], targetLanguage: string): Promise<PanelData[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        dialogue: { type: Type.STRING, description: `The translated dialogue in ${targetLanguage}` },
        caption: { type: Type.STRING, description: `The translated caption in ${targetLanguage}` }
      },
      required: ["id", "dialogue"]
    }
  };

  try {
    // Only send necessary fields to save tokens and avoid confusion
    const minimalInput = panels.map(p => ({
      id: p.id,
      dialogue: p.dialogue,
      caption: p.caption
    }));

    const response = await ai.models.generateContent({
      model: SCRIPT_MODEL,
      contents: `Translate the following comic book dialogue and captions into ${targetLanguage}. 
      Do NOT translate technical terms if they should remain in English, but translate the meaning.
      Return the result as a JSON array matching the IDs.
      
      Input: ${JSON.stringify(minimalInput)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No translation generated");

    const translations = JSON.parse(text);
    
    // Merge translations back into original panels
    return panels.map(panel => {
      const translation = translations.find((t: any) => t.id === panel.id);
      if (translation) {
        return {
          ...panel,
          dialogue: translation.dialogue || panel.dialogue,
          caption: translation.caption || panel.caption
        };
      }
      return panel;
    });

  } catch (error) {
    console.error("Translation failed:", error);
    throw error;
  }
};

export const generatePanelImage = async (panelDescription: string, styleContext: string): Promise<string> => {
  try {
    const fullPrompt = `Comic book panel, ${styleContext}. ${panelDescription}. High quality, detailed, masterpiece, bold lines, vibrant colors.`;
    
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: fullPrompt,
      config: {
        // We don't use specific responseMimeType for images in generateContent for flash-image usually, 
        // but the model returns parts.
      }
    });

    // Check for inline data (image)
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};