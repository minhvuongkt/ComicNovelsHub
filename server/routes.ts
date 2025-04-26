import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  insertCommentSchema,
  insertReportSchema,
  insertFavoriteSchema,
  insertReadingHistorySchema
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

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
