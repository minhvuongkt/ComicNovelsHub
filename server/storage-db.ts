import { users, type User, type InsertUser, authors, type Author, type InsertAuthor, 
  groups, type Group, type InsertGroup, genres, type Genre, type InsertGenre, 
  stories, type Story, type InsertStory, chapters, type Chapter, type InsertChapter,
  storyGenres, type StoryGenre, type InsertStoryGenre, comments, type Comment, type InsertComment,
  reports, type Report, type InsertReport, favorites, type Favorite, type InsertFavorite,
  readingHistories, type ReadingHistory, type InsertReadingHistory } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, or, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.count > 0;
  }

  async listUsers(page: number = 1, limit: number = 10, search?: string): Promise<User[]> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(users);
    
    if (search) {
      query = query.where(
        or(
          like(users.first_name, `%${search}%`),
          like(users.last_name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }
    
    return await query.limit(limit).offset(offset);
  }

  // Author operations
  async getAuthor(id: number): Promise<Author | undefined> {
    const [author] = await db.select().from(authors).where(eq(authors.id, id));
    return author;
  }

  async createAuthor(authorData: InsertAuthor): Promise<Author> {
    const [author] = await db.insert(authors).values(authorData).returning();
    return author;
  }

  async updateAuthor(id: number, data: Partial<InsertAuthor>): Promise<Author | undefined> {
    const [updatedAuthor] = await db
      .update(authors)
      .set(data)
      .where(eq(authors.id, id))
      .returning();
    return updatedAuthor;
  }

  async deleteAuthor(id: number): Promise<boolean> {
    const result = await db.delete(authors).where(eq(authors.id, id));
    return result.count > 0;
  }

  async listAuthors(): Promise<Author[]> {
    return await db.select().from(authors);
  }

  // Group operations
  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async createGroup(groupData: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(groupData).returning();
    return group;
  }

  async updateGroup(id: number, data: Partial<InsertGroup>): Promise<Group | undefined> {
    const [updatedGroup] = await db
      .update(groups)
      .set(data)
      .where(eq(groups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id));
    return result.count > 0;
  }

  async listGroups(): Promise<Group[]> {
    return await db.select().from(groups);
  }

  // Genre operations
  async getGenre(id: number): Promise<Genre | undefined> {
    const [genre] = await db.select().from(genres).where(eq(genres.id, id));
    return genre;
  }

  async createGenre(genreData: InsertGenre): Promise<Genre> {
    const [genre] = await db.insert(genres).values(genreData).returning();
    return genre;
  }

  async updateGenre(id: number, data: Partial<InsertGenre>): Promise<Genre | undefined> {
    const [updatedGenre] = await db
      .update(genres)
      .set(data)
      .where(eq(genres.id, id))
      .returning();
    return updatedGenre;
  }

  async deleteGenre(id: number): Promise<boolean> {
    const result = await db.delete(genres).where(eq(genres.id, id));
    return result.count > 0;
  }

  async listGenres(): Promise<Genre[]> {
    return await db.select().from(genres);
  }

  // Story operations
  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  async createStory(storyData: InsertStory): Promise<Story> {
    const [story] = await db.insert(stories).values(storyData).returning();
    return story;
  }

  async updateStory(id: number, data: Partial<InsertStory>): Promise<Story | undefined> {
    const [updatedStory] = await db
      .update(stories)
      .set(data)
      .where(eq(stories.id, id))
      .returning();
    return updatedStory;
  }

  async deleteStory(id: number): Promise<boolean> {
    const result = await db.delete(stories).where(eq(stories.id, id));
    return result.count > 0;
  }

  async listStories(page: number = 1, limit: number = 10, filters?: any): Promise<Story[]> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(stories);
    
    if (filters) {
      // Apply filters
      if (filters.authorId) {
        query = query.where(eq(stories.author_id, filters.authorId));
      }
      
      if (filters.groupId) {
        query = query.where(eq(stories.group_id, filters.groupId));
      }
      
      if (filters.search) {
        query = query.where(
          or(
            like(stories.title, `%${filters.search}%`),
            like(stories.description, `%${filters.search}%`)
          )
        );
      }
    }
    
    return await query.limit(limit).offset(offset);
  }

  // Chapter operations
  async getChapter(id: number): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async createChapter(chapterData: InsertChapter): Promise<Chapter> {
    const [chapter] = await db.insert(chapters).values(chapterData).returning();
    return chapter;
  }

  async updateChapter(id: number, data: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const [updatedChapter] = await db
      .update(chapters)
      .set(data)
      .where(eq(chapters.id, id))
      .returning();
    return updatedChapter;
  }

  async deleteChapter(id: number): Promise<boolean> {
    const result = await db.delete(chapters).where(eq(chapters.id, id));
    return result.count > 0;
  }

  async listChaptersByStory(storyId: number, order: string = 'desc'): Promise<Chapter[]> {
    const orderFn = order === 'asc' ? asc : desc;
    return await db
      .select()
      .from(chapters)
      .where(eq(chapters.story_id, storyId))
      .orderBy(orderFn(chapters.chapter_number));
  }

  // StoryGenre operations
  async addGenreToStory(storyGenreData: InsertStoryGenre): Promise<StoryGenre> {
    const [storyGenre] = await db.insert(storyGenres).values(storyGenreData).returning();
    return storyGenre;
  }

  async removeGenreFromStory(storyId: number, genreId: number): Promise<boolean> {
    const result = await db
      .delete(storyGenres)
      .where(
        and(
          eq(storyGenres.story_id, storyId),
          eq(storyGenres.genre_id, genreId)
        )
      );
    return result.count > 0;
  }

  async getGenresByStory(storyId: number): Promise<Genre[]> {
    return await db
      .select({
        id: genres.id,
        name: genres.name,
        description: genres.description,
        created_at: genres.created_at
      })
      .from(genres)
      .innerJoin(storyGenres, eq(genres.id, storyGenres.genre_id))
      .where(eq(storyGenres.story_id, storyId));
  }

  async getStoriesByGenre(genreId: number): Promise<Story[]> {
    return await db
      .select({
        id: stories.id,
        title: stories.title,
        description: stories.description,
        alternative_title: stories.alternative_title,
        cover_image: stories.cover_image,
        author_id: stories.author_id,
        group_id: stories.group_id,
        release_year: stories.release_year,
        created_at: stories.created_at
      })
      .from(stories)
      .innerJoin(storyGenres, eq(stories.id, storyGenres.story_id))
      .where(eq(storyGenres.genre_id, genreId));
  }

  // Comment operations
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.count > 0;
  }

  async listCommentsByStory(storyId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.story_id, storyId),
          sql`${comments.chapter_id} IS NULL`
        )
      )
      .orderBy(desc(comments.created_at));
  }

  async listCommentsByChapter(chapterId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.chapter_id, chapterId))
      .orderBy(desc(comments.created_at));
  }

  // Report operations
  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }

  async deleteReport(id: number): Promise<boolean> {
    const result = await db.delete(reports).where(eq(reports.id, id));
    return result.count > 0;
  }

  async listReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.created_at));
  }

  // Favorite operations
  async addFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(favoriteData).returning();
    return favorite;
  }

  async removeFavorite(userId: number, storyId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.user_id, userId),
          eq(favorites.story_id, storyId)
        )
      );
    return result.count > 0;
  }

  async listFavoritesByUser(userId: number): Promise<{ story: Story, favorite: Favorite }[]> {
    const results = await db
      .select({
        story: stories,
        favorite: favorites
      })
      .from(favorites)
      .innerJoin(stories, eq(favorites.story_id, stories.id))
      .where(eq(favorites.user_id, userId))
      .orderBy(desc(favorites.created_at));
    
    return results;
  }

  // Reading History operations
  async addReadingHistory(historyData: InsertReadingHistory): Promise<ReadingHistory> {
    const [history] = await db.insert(readingHistories).values(historyData).returning();
    return history;
  }

  async updateReadingHistory(userId: number, storyId: number, chapterId: number): Promise<ReadingHistory | undefined> {
    const [existingHistory] = await db
      .select()
      .from(readingHistories)
      .where(
        and(
          eq(readingHistories.user_id, userId),
          eq(readingHistories.story_id, storyId)
        )
      );
    
    if (existingHistory) {
      const [updatedHistory] = await db
        .update(readingHistories)
        .set({ 
          chapter_id: chapterId,
          last_read_at: new Date()
        })
        .where(eq(readingHistories.id, existingHistory.id))
        .returning();
      return updatedHistory;
    } else {
      return await this.addReadingHistory({
        user_id: userId,
        story_id: storyId,
        chapter_id: chapterId
      });
    }
  }

  async deleteReadingHistory(userId: number, storyId: number): Promise<boolean> {
    const result = await db
      .delete(readingHistories)
      .where(
        and(
          eq(readingHistories.user_id, userId),
          eq(readingHistories.story_id, storyId)
        )
      );
    return result.count > 0;
  }

  async clearReadingHistory(userId: number): Promise<boolean> {
    const result = await db
      .delete(readingHistories)
      .where(eq(readingHistories.user_id, userId));
    return result.count > 0;
  }

  async listReadingHistoryByUser(userId: number): Promise<{ story: Story, chapter: Chapter, history: ReadingHistory }[]> {
    const results = await db
      .select({
        story: stories,
        chapter: chapters,
        history: readingHistories
      })
      .from(readingHistories)
      .innerJoin(stories, eq(readingHistories.story_id, stories.id))
      .innerJoin(chapters, eq(readingHistories.chapter_id, chapters.id))
      .where(eq(readingHistories.user_id, userId))
      .orderBy(desc(readingHistories.last_read_at));
    
    return results;
  }
}

export const storage = new DatabaseStorage();