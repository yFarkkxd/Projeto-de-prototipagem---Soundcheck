import { GoogleGenAI, Type } from "@google/genai";
import { Album, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const LASTFM_API_KEY = (import.meta as any).env.VITE_LASTFM_API_KEY;

export async function searchMusic(query: string): Promise<Album[]> {
  try {
    // 1. Try Last.fm if key is available
    if (LASTFM_API_KEY) {
      try {
        const lastfmResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(query)}&api_key=${LASTFM_API_KEY}&format=json&limit=8`);
        const lastfmData = await lastfmResponse.json();
        
        if (lastfmData.results?.albummatches?.album?.length > 0) {
          return lastfmData.results.albummatches.album.map((item: any) => ({
            id: item.mbid || `${item.name}-${item.artist}`.replace(/\s+/g, '-').toLowerCase(),
            title: item.name,
            artist: item.artist,
            year: "N/A", // Search doesn't return year
            genre: "Various",
            coverUrl: item.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/400/400`,
            description: `Álbum de ${item.artist} encontrado via Last.fm.`,
          }));
        }
      } catch (err) {
        console.warn("Last.fm search failed, falling back to iTunes", err);
      }
    }

    // 2. Use iTunes Search API as standard/fallback
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

export async function getAlbumInfo(artist: string, album: string): Promise<any> {
  if (!LASTFM_API_KEY) return null;
  
  try {
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`);
    const data = await response.json();
    return data.album;
  } catch (e) {
    console.error("Failed to fetch album info from Last.fm", e);
    return null;
  }
}
