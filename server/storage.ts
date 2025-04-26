import {
  User, InsertUser, 
  Author, InsertAuthor,
  Group, InsertGroup,
  Genre, InsertGenre,
  Story, InsertStory,
  Chapter, InsertChapter,
  StoryGenre, InsertStoryGenre,
  Comment, InsertComment,
  Report, InsertReport,
  Favorite, InsertFavorite,
  ReadingHistory, InsertReadingHistory
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(page?: number, limit?: number, search?: string): Promise<User[]>;
  
  // Author operations
  getAuthor(id: number): Promise<Author | undefined>;
  createAuthor(author: InsertAuthor): Promise<Author>;
  updateAuthor(id: number, data: Partial<InsertAuthor>): Promise<Author | undefined>;
  deleteAuthor(id: number): Promise<boolean>;
  listAuthors(): Promise<Author[]>;
  
  // Group operations
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, data: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  listGroups(): Promise<Group[]>;
  
  // Genre operations
  getGenre(id: number): Promise<Genre | undefined>;
  createGenre(genre: InsertGenre): Promise<Genre>;
  updateGenre(id: number, data: Partial<InsertGenre>): Promise<Genre | undefined>;
  deleteGenre(id: number): Promise<boolean>;
  listGenres(): Promise<Genre[]>;
  
  // Story operations
  getStory(id: number): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, data: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: number): Promise<boolean>;
  listStories(page?: number, limit?: number, filters?: any): Promise<Story[]>;
  
  // Chapter operations
  getChapter(id: number): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: number, data: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: number): Promise<boolean>;
  listChaptersByStory(storyId: number, order?: string): Promise<Chapter[]>;
  
  // StoryGenre operations
  addGenreToStory(storyGenre: InsertStoryGenre): Promise<StoryGenre>;
  removeGenreFromStory(storyId: number, genreId: number): Promise<boolean>;
  getGenresByStory(storyId: number): Promise<Genre[]>;
  getStoriesByGenre(genreId: number): Promise<Story[]>;
  
  // Comment operations
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  listCommentsByStory(storyId: number): Promise<Comment[]>;
  listCommentsByChapter(chapterId: number): Promise<Comment[]>;
  
  // Report operations
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<boolean>;
  listReports(): Promise<Report[]>;
  
  // Favorite operations
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, storyId: number): Promise<boolean>;
  listFavoritesByUser(userId: number): Promise<{ story: Story, favorite: Favorite }[]>;
  
  // Reading History operations
  addReadingHistory(history: InsertReadingHistory): Promise<ReadingHistory>;
  updateReadingHistory(userId: number, storyId: number, chapterId: number): Promise<ReadingHistory | undefined>;
  deleteReadingHistory(userId: number, storyId: number): Promise<boolean>;
  clearReadingHistory(userId: number): Promise<boolean>;
  listReadingHistoryByUser(userId: number): Promise<{ story: Story, chapter: Chapter, history: ReadingHistory }[]>;
}

export class MemStorage implements IStorage {
  sessionStore: session.SessionStore;
  private users: Map<number, User>;
  private authors: Map<number, Author>;
  private groups: Map<number, Group>;
  private genres: Map<number, Genre>;
  private stories: Map<number, Story>;
  private chapters: Map<number, Chapter>;
  private storyGenres: Map<number, StoryGenre>;
  private comments: Map<number, Comment>;
  private reports: Map<number, Report>;
  private favorites: Map<number, Favorite>;
  private readingHistories: Map<number, ReadingHistory>;
  
  // Auto-increment counters
  private userCounter: number;
  private authorCounter: number;
  private groupCounter: number;
  private genreCounter: number;
  private storyCounter: number;
  private chapterCounter: number;
  private storyGenreCounter: number;
  private commentCounter: number;
  private reportCounter: number;
  private favoriteCounter: number;
  private readingHistoryCounter: number;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.authors = new Map();
    this.groups = new Map();
    this.genres = new Map();
    this.stories = new Map();
    this.chapters = new Map();
    this.storyGenres = new Map();
    this.comments = new Map();
    this.reports = new Map();
    this.favorites = new Map();
    this.readingHistories = new Map();
    
    this.userCounter = 1;
    this.authorCounter = 1;
    this.groupCounter = 1;
    this.genreCounter = 1;
    this.storyCounter = 1;
    this.chapterCounter = 1;
    this.storyGenreCounter = 1;
    this.commentCounter = 1;
    this.reportCounter = 1;
    this.favoriteCounter = 1;
    this.readingHistoryCounter = 1;
    
    // Initialize with some data
    this.seedGenres();
  }

  // Seed initial data
  private seedGenres() {
    const genreNames = [
      { name: "Action", description: "Stories with fighting, battles, and physical challenges." },
      { name: "Adventure", description: "Stories about journeys, exploring new places, and exciting experiences." },
      { name: "Comedy", description: "Humorous and entertaining stories that aim to make readers laugh." },
      { name: "Drama", description: "Stories with emotional and serious themes that evoke feelings." },
      { name: "Fantasy", description: "Stories with magical elements, mythical creatures, and imaginary worlds." },
      { name: "Horror", description: "Stories meant to frighten, scare, and create a sense of dread." },
      { name: "Mystery", description: "Stories that focus on solving puzzles, crimes, or unexplained phenomena." },
      { name: "Romance", description: "Stories that focus on relationships and emotional attraction between characters." },
      { name: "Sci-Fi", description: "Stories based on scientific concepts, futuristic technology, and space travel." },
      { name: "Slice of Life", description: "Stories depicting everyday experiences in characters' lives." }
    ];
    
    genreNames.forEach(genre => {
      this.createGenre(genre);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const now = new Date();
    
    const user: User = {
      ...userData,
      id,
      role: "user",
      avatar: userData.avatar || "",
      gender: userData.gender || "",
      created_at: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...data
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async listUsers(page: number = 1, limit: number = 10, search?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return users.slice(start, end);
  }

  // Author operations
  async getAuthor(id: number): Promise<Author | undefined> {
    return this.authors.get(id);
  }

  async createAuthor(authorData: InsertAuthor): Promise<Author> {
    const id = this.authorCounter++;
    const now = new Date();
    
    const author: Author = {
      ...authorData,
      id,
      created_at: now
    };
    
    this.authors.set(id, author);
    return author;
  }

  async updateAuthor(id: number, data: Partial<InsertAuthor>): Promise<Author | undefined> {
    const author = await this.getAuthor(id);
    if (!author) return undefined;
    
    const updatedAuthor: Author = {
      ...author,
      ...data
    };
    
    this.authors.set(id, updatedAuthor);
    return updatedAuthor;
  }

  async deleteAuthor(id: number): Promise<boolean> {
    return this.authors.delete(id);
  }

  async listAuthors(): Promise<Author[]> {
    return Array.from(this.authors.values());
  }

  // Group operations
  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(groupData: InsertGroup): Promise<Group> {
    const id = this.groupCounter++;
    const now = new Date();
    
    const group: Group = {
      ...groupData,
      id,
      created_at: now
    };
    
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: number, data: Partial<InsertGroup>): Promise<Group | undefined> {
    const group = await this.getGroup(id);
    if (!group) return undefined;
    
    const updatedGroup: Group = {
      ...group,
      ...data
    };
    
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }

  async listGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  // Genre operations
  async getGenre(id: number): Promise<Genre | undefined> {
    return this.genres.get(id);
  }

  async createGenre(genreData: InsertGenre): Promise<Genre> {
    const id = this.genreCounter++;
    const now = new Date();
    
    const genre: Genre = {
      ...genreData,
      id,
      created_at: now
    };
    
    this.genres.set(id, genre);
    return genre;
  }

  async updateGenre(id: number, data: Partial<InsertGenre>): Promise<Genre | undefined> {
    const genre = await this.getGenre(id);
    if (!genre) return undefined;
    
    const updatedGenre: Genre = {
      ...genre,
      ...data
    };
    
    this.genres.set(id, updatedGenre);
    return updatedGenre;
  }

  async deleteGenre(id: number): Promise<boolean> {
    return this.genres.delete(id);
  }

  async listGenres(): Promise<Genre[]> {
    return Array.from(this.genres.values());
  }

  // Story operations
  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async createStory(storyData: InsertStory): Promise<Story> {
    const id = this.storyCounter++;
    const now = new Date();
    
    const story: Story = {
      ...storyData,
      id,
      created_at: now
    };
    
    this.stories.set(id, story);
    return story;
  }

  async updateStory(id: number, data: Partial<InsertStory>): Promise<Story | undefined> {
    const story = await this.getStory(id);
    if (!story) return undefined;
    
    const updatedStory: Story = {
      ...story,
      ...data
    };
    
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteStory(id: number): Promise<boolean> {
    return this.stories.delete(id);
  }

  async listStories(page: number = 1, limit: number = 10, filters?: any): Promise<Story[]> {
    let stories = Array.from(this.stories.values());
    
    if (filters) {
      if (filters.title) {
        const titleLower = filters.title.toLowerCase();
        stories = stories.filter(story => 
          story.title.toLowerCase().includes(titleLower) ||
          (story.alternative_title && story.alternative_title.toLowerCase().includes(titleLower))
        );
      }
      
      if (filters.authorId) {
        stories = stories.filter(story => story.author_id === filters.authorId);
      }
      
      if (filters.groupId) {
        stories = stories.filter(story => story.group_id === filters.groupId);
      }
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return stories.slice(start, end);
  }

  // Chapter operations
  async getChapter(id: number): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async createChapter(chapterData: InsertChapter): Promise<Chapter> {
    const id = this.chapterCounter++;
    const now = new Date();
    
    const chapter: Chapter = {
      ...chapterData,
      id,
      created_at: now
    };
    
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: number, data: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const chapter = await this.getChapter(id);
    if (!chapter) return undefined;
    
    const updatedChapter: Chapter = {
      ...chapter,
      ...data
    };
    
    this.chapters.set(id, updatedChapter);
    return updatedChapter;
  }

  async deleteChapter(id: number): Promise<boolean> {
    return this.chapters.delete(id);
  }

  async listChaptersByStory(storyId: number, order: string = 'desc'): Promise<Chapter[]> {
    const chapters = Array.from(this.chapters.values())
      .filter(chapter => chapter.story_id === storyId);
    
    return order === 'asc' 
      ? chapters.sort((a, b) => a.chapter_number - b.chapter_number)
      : chapters.sort((a, b) => b.chapter_number - a.chapter_number);
  }

  // StoryGenre operations
  async addGenreToStory(storyGenreData: InsertStoryGenre): Promise<StoryGenre> {
    const id = this.storyGenreCounter++;
    
    const storyGenre: StoryGenre = {
      ...storyGenreData,
      id
    };
    
    this.storyGenres.set(id, storyGenre);
    return storyGenre;
  }

  async removeGenreFromStory(storyId: number, genreId: number): Promise<boolean> {
    const storyGenreId = Array.from(this.storyGenres.entries())
      .find(([_, sg]) => sg.story_id === storyId && sg.genre_id === genreId)?.[0];
    
    if (storyGenreId) {
      return this.storyGenres.delete(storyGenreId);
    }
    
    return false;
  }

  async getGenresByStory(storyId: number): Promise<Genre[]> {
    const genreIds = Array.from(this.storyGenres.values())
      .filter(sg => sg.story_id === storyId)
      .map(sg => sg.genre_id);
    
    return genreIds.map(id => this.genres.get(id)).filter(Boolean) as Genre[];
  }

  async getStoriesByGenre(genreId: number): Promise<Story[]> {
    const storyIds = Array.from(this.storyGenres.values())
      .filter(sg => sg.genre_id === genreId)
      .map(sg => sg.story_id);
    
    return storyIds.map(id => this.stories.get(id)).filter(Boolean) as Story[];
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentCounter++;
    const now = new Date();
    
    const comment: Comment = {
      ...commentData,
      id,
      created_at: now
    };
    
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  async listCommentsByStory(storyId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.story_id === storyId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async listCommentsByChapter(chapterId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.chapter_id === chapterId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  // Report operations
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const id = this.reportCounter++;
    const now = new Date();
    
    const report: Report = {
      ...reportData,
      id,
      created_at: now
    };
    
    this.reports.set(id, report);
    return report;
  }

  async deleteReport(id: number): Promise<boolean> {
    return this.reports.delete(id);
  }

  async listReports(): Promise<Report[]> {
    return Array.from(this.reports.values())
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  // Favorite operations
  async addFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteCounter++;
    const now = new Date();
    
    const favorite: Favorite = {
      ...favoriteData,
      id,
      created_at: now
    };
    
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: number, storyId: number): Promise<boolean> {
    const favoriteId = Array.from(this.favorites.entries())
      .find(([_, fav]) => fav.user_id === userId && fav.story_id === storyId)?.[0];
    
    if (favoriteId) {
      return this.favorites.delete(favoriteId);
    }
    
    return false;
  }

  async listFavoritesByUser(userId: number): Promise<{ story: Story, favorite: Favorite }[]> {
    const favorites = Array.from(this.favorites.values())
      .filter(fav => fav.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return favorites.map(favorite => {
      const story = this.stories.get(favorite.story_id);
      return story ? { story, favorite } : null;
    }).filter(Boolean) as { story: Story, favorite: Favorite }[];
  }

  // Reading History operations
  async addReadingHistory(historyData: InsertReadingHistory): Promise<ReadingHistory> {
    const id = this.readingHistoryCounter++;
    const now = new Date();
    
    const history: ReadingHistory = {
      ...historyData,
      id,
      last_read_at: now
    };
    
    this.readingHistories.set(id, history);
    return history;
  }

  async updateReadingHistory(userId: number, storyId: number, chapterId: number): Promise<ReadingHistory | undefined> {
    const historyId = Array.from(this.readingHistories.entries())
      .find(([_, hist]) => hist.user_id === userId && hist.story_id === storyId)?.[0];
    
    if (historyId) {
      const history = this.readingHistories.get(historyId);
      if (history) {
        const updatedHistory: ReadingHistory = {
          ...history,
          chapter_id: chapterId,
          last_read_at: new Date()
        };
        
        this.readingHistories.set(historyId, updatedHistory);
        return updatedHistory;
      }
    } else {
      // Create new history if it doesn't exist
      return this.addReadingHistory({ user_id: userId, story_id: storyId, chapter_id: chapterId });
    }
  }

  async deleteReadingHistory(userId: number, storyId: number): Promise<boolean> {
    const historyId = Array.from(this.readingHistories.entries())
      .find(([_, hist]) => hist.user_id === userId && hist.story_id === storyId)?.[0];
    
    if (historyId) {
      return this.readingHistories.delete(historyId);
    }
    
    return false;
  }

  async clearReadingHistory(userId: number): Promise<boolean> {
    const historyIds = Array.from(this.readingHistories.entries())
      .filter(([_, hist]) => hist.user_id === userId)
      .map(([id, _]) => id);
    
    let success = true;
    historyIds.forEach(id => {
      if (!this.readingHistories.delete(id)) {
        success = false;
      }
    });
    
    return success;
  }

  async listReadingHistoryByUser(userId: number): Promise<{ story: Story, chapter: Chapter, history: ReadingHistory }[]> {
    const histories = Array.from(this.readingHistories.values())
      .filter(hist => hist.user_id === userId)
      .sort((a, b) => b.last_read_at.getTime() - a.last_read_at.getTime());
    
    return histories.map(history => {
      const story = this.stories.get(history.story_id);
      const chapter = this.chapters.get(history.chapter_id);
      return (story && chapter) ? { story, chapter, history } : null;
    }).filter(Boolean) as { story: Story, chapter: Chapter, history: ReadingHistory }[];
  }
}

// Import database storage
import { storage as dbStorage } from './storage-db';

// We're using the database implementation instead of memory storage
export const storage = dbStorage;
