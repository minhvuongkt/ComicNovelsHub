import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Create an admin user for testing
export async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByEmail("admin@goctruyennho.com");
    
    if (!existingAdmin) {
      const adminUser = await storage.createUser({
        first_name: "Admin",
        last_name: "User",
        email: "admin@goctruyennho.com",
        password: await hashPassword("password123"),
        role: "admin",
        gender: null,
        avatar: null
      });
      
      console.log("Admin user created successfully:", adminUser.email);
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}