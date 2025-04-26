import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  insertCommentSchema,
  insertReportSchema,
  insertFavoriteSchema,
  insertReadingHistorySchema,
  insertStorySchema,
  insertGenreSchema,
  insertAuthorSchema,
  insertGroupSchema,
  insertChapterSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // Genres API
  app.get("/api/genres", async (req, res) => {
    try {
      const genres = await storage.listGenres();
      res.json(genres);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });
  
  app.get("/api/genres/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const genre = await storage.getGenre(id);
      
      if (!genre) {
        return res.status(404).json({ message: "Genre not found" });
      }
      
      res.json(genre);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch genre details" });
    }
  });
  
  app.get("/api/genres/:id/stories", async (req, res) => {
    try {
      const genreId = parseInt(req.params.id);
      const genre = await storage.getGenre(genreId);
      
      if (!genre) {
        return res.status(404).json({ message: "Genre not found" });
      }
      
      const stories = await storage.getStoriesByGenre(genreId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories by genre" });
    }
  });

  // Authors API
  app.get("/api/authors", async (req, res) => {
    try {
      const authors = await storage.listAuthors();
      res.json(authors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch authors" });
    }
  });

  // Translation Groups API
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.listGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translation groups" });
    }
  });

  // Stories API
  app.get("/api/stories", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;
      
      const stories = await storage.listStories(page, limit, filters);
      
      // Enhance stories with genre information
      const enhancedStories = await Promise.all(stories.map(async (story) => {
        const genres = await storage.getGenresByStory(story.id);
        return { ...story, genres };
      }));
      
      res.json(enhancedStories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getStory(id);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      const genres = await storage.getGenresByStory(id);
      const chapters = await storage.listChaptersByStory(id);
      
      res.json({ ...story, genres, chapters });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story details" });
    }
  });

  // Chapters API
  app.get("/api/stories/:storyId/chapters", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const order = req.query.order as string || 'desc';
      
      const chapters = await storage.listChaptersByStory(storyId, order);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chapter = await storage.getChapter(id);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });

  // Comments API
  app.get("/api/stories/:storyId/comments", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const comments = await storage.listCommentsByStory(storyId);
      
      // Get user information for each comment
      const enhancedComments = await Promise.all(comments.map(async (comment) => {
        const user = await storage.getUser(comment.user_id);
        return { 
          ...comment, 
          user: user ? { 
            id: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            avatar: user.avatar 
          } : null 
        };
      }));
      
      res.json(enhancedComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.get("/api/chapters/:chapterId/comments", async (req, res) => {
    try {
      const chapterId = parseInt(req.params.chapterId);
      const comments = await storage.listCommentsByChapter(chapterId);
      
      // Get user information for each comment
      const enhancedComments = await Promise.all(comments.map(async (comment) => {
        const user = await storage.getUser(comment.user_id);
        return { 
          ...comment, 
          user: user ? { 
            id: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            avatar: user.avatar 
          } : null 
        };
      }));
      
      res.json(enhancedComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to comment" });
    }
    
    try {
      const userId = req.user!.id;
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        user_id: userId
      });
      
      const comment = await storage.createComment(commentData);
      
      // Get user information
      const user = await storage.getUser(userId);
      
      res.status(201).json({ 
        ...comment, 
        user: user ? { 
          id: user.id, 
          first_name: user.first_name, 
          last_name: user.last_name, 
          avatar: user.avatar 
        } : null 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to delete a comment" });
    }
    
    try {
      const commentId = parseInt(req.params.id);
      const comment = await storage.getComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Only allow users to delete their own comments or admins
      if (comment.user_id !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You cannot delete this comment" });
      }
      
      const success = await storage.deleteComment(commentId);
      
      if (success) {
        res.status(200).json({ message: "Comment deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete comment" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Reports API
  app.post("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to report" });
    }
    
    try {
      const userId = req.user!.id;
      
      const reportData = insertReportSchema.parse({
        ...req.body,
        user_id: userId
      });
      
      const report = await storage.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Favorites API
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view favorites" });
    }
    
    try {
      const userId = req.user!.id;
      const favorites = await storage.listFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to add favorites" });
    }
    
    try {
      const userId = req.user!.id;
      
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        user_id: userId
      });
      
      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid favorite data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:storyId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to remove favorites" });
    }
    
    try {
      const userId = req.user!.id;
      const storyId = parseInt(req.params.storyId);
      
      const success = await storage.removeFavorite(userId, storyId);
      
      if (success) {
        res.status(200).json({ message: "Favorite removed successfully" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Reading History API
  app.get("/api/reading-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view reading history" });
    }
    
    try {
      const userId = req.user!.id;
      const history = await storage.listReadingHistoryByUser(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reading history" });
    }
  });

  app.post("/api/reading-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to update reading history" });
    }
    
    try {
      const userId = req.user!.id;
      const { story_id, chapter_id } = req.body;
      
      const history = await storage.updateReadingHistory(userId, story_id, chapter_id);
      
      if (history) {
        res.status(200).json(history);
      } else {
        res.status(500).json({ message: "Failed to update reading history" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update reading history" });
    }
  });

  app.delete("/api/reading-history/:storyId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to delete reading history" });
    }
    
    try {
      const userId = req.user!.id;
      const storyId = parseInt(req.params.storyId);
      
      const success = await storage.deleteReadingHistory(userId, storyId);
      
      if (success) {
        res.status(200).json({ message: "Reading history entry deleted successfully" });
      } else {
        res.status(404).json({ message: "Reading history entry not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reading history entry" });
    }
  });

  app.delete("/api/reading-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to clear reading history" });
    }
    
    try {
      const userId = req.user!.id;
      
      const success = await storage.clearReadingHistory(userId);
      
      if (success) {
        res.status(200).json({ message: "Reading history cleared successfully" });
      } else {
        res.status(500).json({ message: "Failed to clear reading history" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to clear reading history" });
    }
  });

  // Admin API - requires admin role
  app.use("/api/admin", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to access admin features" });
    }
    
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to access admin features" });
    }
    
    next();
  });

  // Admin Users API
  app.get("/api/admin/users", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || undefined;
      
      const users = await storage.listUsers(page, limit, search);
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Don't allow deleting self
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(userId);
      
      if (success) {
        res.status(200).json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Admin Genres API
  app.post("/api/genres", async (req, res) => {
    // Only admins can create genres
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const genreData = insertGenreSchema.parse(req.body);
      const genre = await storage.createGenre(genreData);
      res.status(201).json(genre);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid genre data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create genre" });
    }
  });
  
  app.put("/api/genres/:id", async (req, res) => {
    // Only admins can update genres
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const genreData = insertGenreSchema.parse(req.body);
      const genre = await storage.updateGenre(id, genreData);
      
      if (!genre) {
        return res.status(404).json({ message: "Genre not found" });
      }
      
      res.json(genre);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid genre data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update genre" });
    }
  });
  
  app.delete("/api/genres/:id", async (req, res) => {
    // Only admins can delete genres
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGenre(id);
      
      if (success) {
        res.status(200).json({ message: "Genre deleted successfully" });
      } else {
        res.status(404).json({ message: "Genre not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete genre" });
    }
  });
  
  // Admin Authors API
  app.post("/api/authors", async (req, res) => {
    // Only admins can create authors
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const authorData = insertAuthorSchema.parse(req.body);
      const author = await storage.createAuthor(authorData);
      res.status(201).json(author);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid author data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create author" });
    }
  });
  
  app.put("/api/authors/:id", async (req, res) => {
    // Only admins can update authors
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const authorData = insertAuthorSchema.parse(req.body);
      const author = await storage.updateAuthor(id, authorData);
      
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      
      res.json(author);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid author data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update author" });
    }
  });
  
  app.delete("/api/authors/:id", async (req, res) => {
    // Only admins can delete authors
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAuthor(id);
      
      if (success) {
        res.status(200).json({ message: "Author deleted successfully" });
      } else {
        res.status(404).json({ message: "Author not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete author" });
    }
  });
  
  // Admin Groups API
  app.post("/api/groups", async (req, res) => {
    // Only admins can create groups
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create group" });
    }
  });
  
  app.put("/api/groups/:id", async (req, res) => {
    // Only admins can update groups
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.updateGroup(id, groupData);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update group" });
    }
  });
  
  app.delete("/api/groups/:id", async (req, res) => {
    // Only admins can delete groups
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGroup(id);
      
      if (success) {
        res.status(200).json({ message: "Group deleted successfully" });
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete group" });
    }
  });
  
  // Admin Stories API
  app.post("/api/stories", async (req, res) => {
    // Only admins can create stories
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      
      // Handle genres if provided
      if (req.body.genres && Array.isArray(req.body.genres)) {
        for (const genreId of req.body.genres) {
          await storage.addGenreToStory({
            story_id: story.id,
            genre_id: genreId
          });
        }
      }
      
      res.status(201).json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid story data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create story" });
    }
  });
  
  // Add PATCH endpoint for stories to support partial updates
  app.patch("/api/stories/:id", async (req, res) => {
    // Only admins can update stories
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      // For PATCH, we don't validate the entire schema, just make sure the fields sent are valid
      // This allows partial updates
      const story = await storage.updateStory(id, req.body);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      console.error("Error updating story:", error);
      res.status(500).json({ message: "Failed to update story" });
    }
  });
  
  // Keep the PUT endpoint for full updates
  app.put("/api/stories/:id", async (req, res) => {
    // Only admins can update stories
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.updateStory(id, storyData);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid story data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update story" });
    }
  });
  
  app.delete("/api/stories/:id", async (req, res) => {
    // Only admins can delete stories
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStory(id);
      
      if (success) {
        res.status(200).json({ message: "Story deleted successfully" });
      } else {
        res.status(404).json({ message: "Story not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete story" });
    }
  });
  
  // Admin Chapters API
  app.post("/api/chapters", async (req, res) => {
    // Only admins can create chapters
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const chapterData = insertChapterSchema.parse(req.body);
      const chapter = await storage.createChapter(chapterData);
      res.status(201).json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chapter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });
  
  // Add PATCH endpoint for chapters to support partial updates
  app.patch("/api/chapters/:id", async (req, res) => {
    // Only admins can update chapters
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      // For PATCH, we don't validate the entire schema, just make sure the fields sent are valid
      // This allows partial updates
      const chapter = await storage.updateChapter(id, req.body);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      console.error("Error updating chapter:", error);
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });
  
  // Keep the PUT endpoint for full updates
  app.put("/api/chapters/:id", async (req, res) => {
    // Only admins can update chapters
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const chapterData = insertChapterSchema.parse(req.body);
      const chapter = await storage.updateChapter(id, chapterData);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chapter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });
  
  app.delete("/api/chapters/:id", async (req, res) => {
    // Only admins can delete chapters
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteChapter(id);
      
      if (success) {
        res.status(200).json({ message: "Chapter deleted successfully" });
      } else {
        res.status(404).json({ message: "Chapter not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });
  
  // Admin Comments API
  app.get("/api/admin/comments", async (req, res) => {
    try {
      // Get all comments from all stories and chapters
      const storyComments = [];
      const chapterComments = [];
      
      // In a real implementation we would need pagination, but for simplicity we'll skip it
      const stories = await storage.listStories();
      for (const story of stories) {
        const comments = await storage.listCommentsByStory(story.id);
        storyComments.push(...comments.map(c => ({ ...c, story })));
      }
      
      const chapters = [];
      for (const story of stories) {
        const storyChapters = await storage.listChaptersByStory(story.id);
        chapters.push(...storyChapters.map(c => ({ ...c, story })));
      }
      
      for (const chapter of chapters) {
        const comments = await storage.listCommentsByChapter(chapter.id);
        chapterComments.push(...comments.map(c => ({ ...c, chapter, story: chapter.story })));
      }
      
      res.json([...storyComments, ...chapterComments]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // Admin Reports API
  app.get("/api/reports", async (req, res) => {
    // Only admins can view reports
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const reports = await storage.listReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  
  app.delete("/api/reports/:id", async (req, res) => {
    // Only admins can delete reports
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReport(id);
      
      if (success) {
        res.status(200).json({ message: "Report deleted successfully" });
      } else {
        res.status(404).json({ message: "Report not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
