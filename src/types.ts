export interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  genre: string;
  coverUrl: string;
  description: string;
  tracks?: string[];
}

export interface Review {
  id: string;
  albumId: string;
  albumTitle: string;
  artist: string;
  coverUrl: string;
  rating: number; // Now 0-5
  comment: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  joinedAt: number;
}
