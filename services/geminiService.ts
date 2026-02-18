
import { GoogleGenAI, Type } from "@google/genai";
import { Mood, Track } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Acts as the 'Backend Service' for music discovery.
 * Instead of simple text, it returns structured data with YouTube IDs.
 */
export async function generatePlaylist(mood: Mood | string): Promise<Partial<Track>[]> {
  const prompt = `Act as a high-end Music Curator and Backend API. 
  Generate a JSON list of 30 of the absolute most viewed, iconic, and legendary songs for a ${mood} mood.
  
  CRITICAL REQUIREMENTS:
  1. Return exactly 30 tracks.
  2. Include the REAL YouTube Video ID for each song.
  3. Ensure they are the official music videos or high-quality audio uploads with billions/millions of views.
  4. Mood mapping:
     - Sad: Emotional ballads, soul, acoustic.
     - Happy: Pop hits, disco, feel-good anthems.
     - Motivational: Rock, workout beats, high-tempo pop.
     - Sleep: Ambient, lofi, soft piano, nature-infused.
     - Anger: Metal, grunge, aggressive hip-hop.
     - Chill: Lo-fi hip hop, jazz-hop, indie-pop.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            videoId: { type: Type.STRING, description: "The 11-character YouTube video ID" },
            genre: { type: Type.STRING }
          },
          required: ["title", "artist", "videoId", "genre"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse Gemini playlist response:", error);
    return [];
  }
}

/**
 * Sentiment analysis 'Controller' logic.
 */
export async function detectMood(text: string): Promise<Mood> {
  const prompt = `Analyze user sentiment: "${text}". 
  Map this to one of: Happy, Sad, Motivational, Sleep, Anger, Chill.
  Return only the name of the mood.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 0 } }
  });

  const detected = response.text?.trim() as Mood;
  return Object.values(Mood).includes(detected) ? detected : Mood.CHILL;
}
