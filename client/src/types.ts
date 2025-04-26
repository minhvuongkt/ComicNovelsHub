// Re-export types from shared schema
export * from '@shared/schema';

// Add extended types for frontend use
export interface Chapter {
  id: number;
  story_id: number;
  title: string;
  content: string;
  chapter_number: number;
  created_at: Date | null;
  
  // New fields for chapter types
  chapter_type?: string;
  images?: string | string[];
  font_family?: string;
}

export interface Story {
  id: number;
  title: string;
  alternative_title: string | null;
  cover_image: string | null;
  author_id: number | null;
  group_id: number | null;
  description: string | null;
  release_year: number | null;
  created_at: Date | null;
  
  // Virtual properties that may be included by the API
  author?: any;
  group?: any;
  genres?: any[];
  chapters?: Chapter[];
}

export interface Author {
  id: number;
  name: string;
  bio: string | null;
  created_at: Date | null;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_at: Date | null;
}

export interface Genre {
  id: number;
  name: string;
  description: string | null;
  created_at: Date | null;
}

export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar: string | null;
  gender: string | null;
  created_at: Date | null;
  
  // Virtual properties
  bio?: string | null;
}

export interface Comment {
  id: number;
  user_id: number;
  story_id: number;
  chapter_id: number | null;
  content: string;
  parent_id: number | null;
  created_at: Date | null;
  
  // Virtual properties
  user?: User;
  replies?: Comment[];
}

export interface Favorite {
  id: number;
  user_id: number;
  story_id: number;
  created_at: Date | null;
  
  // Virtual properties
  story?: Story;
}

export interface ReadingHistory {
  id: number;
  user_id: number;
  story_id: number;
  chapter_id: number;
  last_read_at: Date | null;
  
  // Virtual properties
  story?: Story;
  chapter?: Chapter;
}