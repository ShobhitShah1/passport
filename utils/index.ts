import { Password, PasswordStrength, AppCategory } from '../types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  return date.toLocaleDateString();
}

/**
 * Filter passwords based on search query and category
 */
export function filterPasswords(
  passwords: Password[],
  searchQuery: string,
  selectedCategory: AppCategory | null
): Password[] {
  let filtered = passwords;
  
  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(password =>
      password.appName.toLowerCase().includes(query) ||
      password.username?.toLowerCase().includes(query) ||
      password.notes?.toLowerCase().includes(query)
    );
  }
  
  // Filter by category (this would need app category mapping)
  if (selectedCategory) {
    // For now, we'll skip category filtering since we don't have app categories implemented yet
    // In a real implementation, you'd map app names to categories
  }
  
  return filtered;
}

/**
 * Sort passwords by various criteria
 */
export function sortPasswords(
  passwords: Password[],
  sortBy: 'name' | 'date' | 'strength' | 'lastUsed' = 'name'
): Password[] {
  return [...passwords].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.appName.localeCompare(b.appName);
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'strength':
        return b.strength - a.strength;
      case 'lastUsed':
        const aLastUsed = a.lastUsed?.getTime() || 0;
        const bLastUsed = b.lastUsed?.getTime() || 0;
        return bLastUsed - aLastUsed;
      default:
        return 0;
    }
  });
}

/**
 * Analyze password security
 */
export function analyzePasswordSecurity(passwords: Password[]) {
  const weakPasswords = passwords.filter(p => p.strength <= PasswordStrength.WEAK);
  const reusedPasswords = findReusedPasswords(passwords);
  const oldPasswords = passwords.filter(p => {
    const daysSinceUpdate = (Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 90; // Older than 90 days
  });
  
  const totalIssues = weakPasswords.length + reusedPasswords.length + oldPasswords.length;
  const totalPasswords = passwords.length;
  const overallScore = totalPasswords > 0 ? Math.max(0, 100 - (totalIssues / totalPasswords) * 100) : 100;
  
  return {
    weakPasswords,
    reusedPasswords,
    oldPasswords,
    breachedPasswords: [], // Would be populated by breach detection service
    overallScore: Math.round(overallScore),
  };
}

/**
 * Find reused passwords
 */
function findReusedPasswords(passwords: Password[]): Password[] {
  const passwordMap = new Map<string, Password[]>();
  
  // Group passwords by their actual password value
  passwords.forEach(password => {
    const key = password.password;
    if (!passwordMap.has(key)) {
      passwordMap.set(key, []);
    }
    passwordMap.get(key)!.push(password);
  });
  
  // Find passwords that are used more than once
  const reused: Password[] = [];
  passwordMap.forEach(passwordList => {
    if (passwordList.length > 1) {
      reused.push(...passwordList);
    }
  });
  
  return reused;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // In React Native, you'd use @react-native-clipboard/clipboard
    // For now, this is a placeholder
    console.log('Copying to clipboard:', text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Generate app category from app name (simple heuristic)
 */
export function guessAppCategory(appName: string): AppCategory {
  const name = appName.toLowerCase();
  
  if (name.includes('bank') || name.includes('pay') || name.includes('wallet')) {
    return AppCategory.FINANCE;
  }
  
  if (name.includes('social') || name.includes('chat') || name.includes('message')) {
    return AppCategory.SOCIAL;
  }
  
  if (name.includes('game') || name.includes('play')) {
    return AppCategory.GAMES;
  }
  
  if (name.includes('shop') || name.includes('store') || name.includes('buy')) {
    return AppCategory.SHOPPING;
  }
  
  if (name.includes('video') || name.includes('music') || name.includes('stream')) {
    return AppCategory.ENTERTAINMENT;
  }
  
  if (name.includes('work') || name.includes('office') || name.includes('doc')) {
    return AppCategory.PRODUCTIVITY;
  }
  
  return AppCategory.OTHER;
}

/**
 * Get readable time difference
 */
export function getTimeDifference(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
}