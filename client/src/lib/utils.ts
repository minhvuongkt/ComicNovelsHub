import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMMM d, yyyy');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getGenreBadgeClass(genre: string): string {
  const genreLower = genre.toLowerCase();
  const validGenres = ['action', 'adventure', 'comedy', 'drama', 'fantasy', 'horror', 'mystery', 'romance', 'sci-fi', 'slice-of-life'];
  
  return validGenres.includes(genreLower) ? genreLower : 'default';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function getReadingProgress(
  currentChapter: number,
  totalChapters: number
): { percentage: number; label: string } {
  if (totalChapters === 0) return { percentage: 0, label: "No chapters" };
  
  const percentage = Math.round((currentChapter / totalChapters) * 100);
  
  if (percentage >= 100) {
    return { percentage: 100, label: "Completed" };
  } else {
    return { percentage, label: `${percentage}% read` };
  }
}

export function debounce<F extends (...args: any[]) => any>(fn: F, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<F>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  } as F;
}

export function isValidImageUrl(url: string): boolean {
  return url && (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('data:image/')
  );
}

export function getDefaultAvatarUrl(name: string): string {
  // Return a placeholder avatar URL using the user's initials
  // You can use a service like UI Avatars or similar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
}

export function parseContentType(content: string): 'image' | 'text' {
  try {
    // Try to parse content as JSON to see if it's an array of image URLs
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return 'image';
    }
  } catch (e) {
    // Not JSON, assume it's text content
  }
  
  return 'text';
}
