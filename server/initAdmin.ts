import { db } from './db';
import { storage } from './storage';
import { users } from '@shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function initAdminUser() {
  try {
    // Check if admin user already exists
    const adminUser = await storage.getUserByEmail('admin@goctruyennho.com');
    
    if (!adminUser) {
      console.log('Initializing admin user...');
      
      // Create admin user
      const hashedPassword = await hashPassword('password123');
      
      const admin = await storage.createUser({
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@goctruyennho.com',
        password: hashedPassword,
        role: 'admin',
      });
      
      console.log(`Admin user created with ID: ${admin.id}`);
      
      // Also initialize genres if they don't exist
      const genreCount = await db.select().from(users);
      
      if (genreCount.length === 1) {
        console.log('Initializing default genres...');
        
        const defaultGenres = [
          { name: 'Action', description: 'Stories with fighting, violence, and physical feats' },
          { name: 'Adventure', description: 'Stories focused on journey and exploration' },
          { name: 'Comedy', description: 'Humorous stories designed to make you laugh' },
          { name: 'Drama', description: 'Stories with serious tone and emotional conflicts' },
          { name: 'Fantasy', description: 'Stories set in magical or supernatural worlds' },
          { name: 'Horror', description: 'Stories designed to frighten or disturb' },
          { name: 'Mystery', description: 'Stories involving a puzzle or crime to be solved' },
          { name: 'Romance', description: 'Stories centered around love relationships' },
          { name: 'Sci-Fi', description: 'Stories based on scientific or technological innovations' },
          { name: 'Slice of Life', description: 'Stories depicting everyday experiences' },
        ];
        
        for (const genre of defaultGenres) {
          await storage.createGenre(genre);
        }
        
        console.log('Default genres created');
      }
    } else {
      console.log('Admin user already exists, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}