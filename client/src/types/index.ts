// Story Types
export interface Story {
  id: number;
  title: string;
  alternative_title?: string;
  cover_image?: string;
  author_id?: number;
  group_id?: number;
  release_year?: number;
  description?: string;
  created_at: string;
  author?: Author;
  group?: TranslationGroup;
  genres?: Genre[];
  chapters?: Chapter[];
}

export interface StorySummary {
  id: number;
  title: string;
  cover_image?: string;
  author_name?: string;
  rating?: number;
  latest_chapter?: number;
  chapter_count?: number;
  completed?: boolean;
}

// User Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  gender?: string;
  role: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  gender?: string;
}

// Content Types
export interface Author {
  id: number;
  name: string;
  bio?: string;
  created_at: string;
}

export interface TranslationGroup {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Genre {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Chapter {
  id: number;
  story_id: number;
  title: string;
  content: string;
  chapter_number: number;
  chapter_type?: 'novel' | 'comic' | 'oneshot';
  images?: string[] | string;
  font_family?: string;
  created_at: string;
}

// User Interaction Types
export interface Comment {
  id: number;
  user_id: number;
  story_id: number;
  chapter_id?: number;
  content: string;
  parent_id?: number;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  replies?: Comment[];
}

export interface Report {
  id: number;
  user_id: number;
  target_type: 'story' | 'chapter' | 'comment';
  target_id: number;
  reason: string;
  created_at: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  story_id: number;
  created_at: string;
}

export interface ReadingHistory {
  id: number;
  user_id: number;
  story_id: number;
  chapter_id: number;
  last_read_at: string;
}

export interface ReadingHistoryItem {
  story: Story;
  chapter: Chapter;
  history: ReadingHistory;
}

export interface FavoriteItem {
  story: Story;
  favorite: Favorite;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// Theme
export type Theme = 'light' | 'dark' | 'system';
