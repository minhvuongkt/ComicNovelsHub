import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, uniqueIndex, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar").default(""),
  gender: text("gender").default(""),
  role: text("role").default("user").notNull(), // user, admin
  created_at: timestamp("created_at").defaultNow(),
});

// Author table
export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").default(""),
  created_at: timestamp("created_at").defaultNow(),
});

// Translation Group table
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  created_at: timestamp("created_at").defaultNow(),
});

// Genre table
export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  created_at: timestamp("created_at").defaultNow(),
});

// Story table
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  alternative_title: text("alternative_title").default(""),
  cover_image: text("cover_image").default(""),
  author_id: integer("author_id").references(() => authors.id),
  group_id: integer("group_id").references(() => groups.id),
  release_year: integer("release_year"),
  description: text("description").default(""),
  created_at: timestamp("created_at").defaultNow(),
});

// Chapter table with support for different content types
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  story_id: integer("story_id").references(() => stories.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Text content for novel type
  chapter_type: text("chapter_type").default("novel").notNull(), // "novel", "oneshot", "comic"
  images: text("images").default("[]"), // JSON array of image URLs for comic/oneshot types
  font_family: text("font_family").default("Arial, sans-serif"), // For novel type text customization
  chapter_number: integer("chapter_number").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// StoryGenre join table
export const storyGenres = pgTable("story_genres", {
  id: serial("id").primaryKey(),
  story_id: integer("story_id").references(() => stories.id).notNull(),
  genre_id: integer("genre_id").references(() => genres.id).notNull(),
});

// Comment table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  story_id: integer("story_id").references(() => stories.id).notNull(),
  chapter_id: integer("chapter_id").references(() => chapters.id),
  content: text("content").notNull(),
  parent_id: integer("parent_id").references(() => comments.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Report table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  target_type: text("target_type").notNull(), // story, chapter, comment
  target_id: integer("target_id").notNull(),
  reason: text("reason").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Favorite table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  story_id: integer("story_id").references(() => stories.id).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Reading History table
export const readingHistories = pgTable("reading_histories", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  story_id: integer("story_id").references(() => stories.id).notNull(),
  chapter_id: integer("chapter_id").references(() => chapters.id).notNull(),
  last_read_at: timestamp("last_read_at").defaultNow(),
});

// Zod schemas for validation and type inference
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
}).extend({
  role: z.enum(['user', 'admin']).default('user').optional(),
});

export const insertAuthorSchema = createInsertSchema(authors).omit({
  id: true,
  created_at: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  created_at: true,
});

export const insertGenreSchema = createInsertSchema(genres).omit({
  id: true,
  created_at: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  created_at: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  created_at: true,
});

export const insertStoryGenreSchema = createInsertSchema(storyGenres).omit({
  id: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  created_at: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  created_at: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  created_at: true,
});

export const insertReadingHistorySchema = createInsertSchema(readingHistories).omit({
  id: true,
  last_read_at: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Author = typeof authors.$inferSelect;
export type InsertAuthor = z.infer<typeof insertAuthorSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type Genre = typeof genres.$inferSelect;
export type InsertGenre = z.infer<typeof insertGenreSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type StoryGenre = typeof storyGenres.$inferSelect;
export type InsertStoryGenre = z.infer<typeof insertStoryGenreSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type ReadingHistory = typeof readingHistories.$inferSelect;
export type InsertReadingHistory = z.infer<typeof insertReadingHistorySchema>;
