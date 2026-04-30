import { GoogleGenAI, Type } from "@google/genai";
import { Album, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function searchMusic(query: string): Promise<Album[]> {
  try {
    // Use iTunes Search API for real data and artwork (no key required)
    const itunesResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=8`);
    const itunesData = await itunesResponse.json();
    
    if (itunesData.results && itunesData.results.length > 0) {
      return itunesData.results.map((item: any) => ({
        id: item.collectionId.toString(),
        title: item.collectionName,
        artist: item.artistName,
        year: new Date(item.releaseDate).getFullYear().toString(),
        genre: item.primaryGenreName,
        coverUrl: item.artworkUrl100.replace('100x100bb', '600x600bb'), // Get higher resolution
        description: `Álbum de ${item.artistName} lançado em ${new Date(item.releaseDate).getFullYear()}.`,
      }));
    }

    // Fallback to Gemini if iTunes fails or returns nothing
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for music albums matching: "${query}". Provide a list of 4 real albums with details.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              year: { type: Type.STRING },
              genre: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "artist", "year", "genre", "description"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any, index: number) => ({
      ...item,
      id: `${item.title}-${item.artist}-${index}`.replace(/\s+/g, '-').toLowerCase(),
      coverUrl: `https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/400`
    }));
  } catch (e) {
    console.error("Music search failed", e);
    return [];
  }
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 4 realistic music reviewer profiles matching the search query: "${query}". 
    Provide name, a creative handle (starting with @), a short bio about their music taste, and random counts for followers/following.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            handle: { type: Type.STRING },
            bio: { type: Type.STRING },
            followersCount: { type: Type.NUMBER },
            followingCount: { type: Type.NUMBER }
          },
          required: ["name", "handle", "bio", "followersCount", "followingCount"]
        }
      }
    }
  });

  try {
    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any, index: number) => ({
      ...item,
      id: `user-${item.handle.replace('@', '')}-${index}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.handle)}`,
      joinedAt: Date.now() - Math.floor(Math.random() * 10000000000)
    }));
  } catch (e) {
    console.error("User search failed", e);
    return [];
  }
}
