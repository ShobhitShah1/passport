import * as Crypto from 'expo-crypto';
import { PasswordGeneratorOptions, GeneratedPassword, PasswordStrength } from '../../types';

// Character sets for password generation
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()/\\\'\"~,;.<>';

/**
 * Generate a secure password based on the provided options
 */
export async function generatePassword(
  options: PasswordGeneratorOptions
): Promise<GeneratedPassword> {
  let charset = '';
  let requiredChars: string[] = [];

  // Build character set based on options
  if (options.includeLowercase) {
    charset += LOWERCASE;
    requiredChars.push(getRandomChar(LOWERCASE));
  }
  
  if (options.includeUppercase) {
    charset += UPPERCASE;
    requiredChars.push(getRandomChar(UPPERCASE));
  }
  
  if (options.includeNumbers) {
    charset += NUMBERS;
    requiredChars.push(getRandomChar(NUMBERS));
  }
  
  if (options.includeSymbols) {
    charset += SYMBOLS;
    requiredChars.push(getRandomChar(SYMBOLS));
  }

  // Add custom characters if provided
  if (options.customCharacters) {
    charset += options.customCharacters;
  }

  // Remove similar/ambiguous characters if requested
  if (options.excludeSimilar) {
    charset = charset.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
  }
  
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(char => !AMBIGUOUS_CHARS.includes(char)).join('');
  }

  if (charset.length === 0) {
    throw new Error('No characters available for password generation');
  }

  // Generate password
  const password = await generateSecurePassword(charset, options.length, requiredChars);
  const strength = calculatePasswordStrength(password);
  const entropy = calculateEntropy(password, charset.length);

  return {
    password,
    strength,
    entropy,
  };
}

/**
 * Generate a cryptographically secure password
 */
async function generateSecurePassword(
  charset: string,
  length: number,
  requiredChars: string[]
): Promise<string> {
  if (length < requiredChars.length) {
    throw new Error('Password length must be at least the number of required character types');
  }

  // Start with required characters to ensure all types are included
  let password = [...requiredChars];

  // Fill the rest with random characters
  const remainingLength = length - requiredChars.length;
  const randomBytes = await Crypto.getRandomBytesAsync(remainingLength);
  
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password.push(charset[randomIndex]);
  }

  // Shuffle the password to avoid predictable patterns
  return shuffleArray(password).join('');
}

/**
 * Get a random character from a character set
 */
function getRandomChar(charset: string): string {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset[randomIndex];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate password strength based on various criteria
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Pattern detection (reduce score for common patterns)
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 1; // Sequential patterns

  // Normalize score to enum values
  if (score <= 2) return PasswordStrength.VERY_WEAK;
  if (score <= 4) return PasswordStrength.WEAK;
  if (score <= 6) return PasswordStrength.MODERATE;
  if (score <= 8) return PasswordStrength.STRONG;
  return PasswordStrength.VERY_STRONG;
}

/**
 * Calculate password entropy
 */
export function calculateEntropy(password: string, charsetSize: number): number {
  return Math.log2(Math.pow(charsetSize, password.length));
}

/**
 * Get default password generation options
 */
export function getDefaultPasswordOptions(): PasswordGeneratorOptions {
  return {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false,
  };
}

/**
 * Generate a memorable passphrase instead of a random password
 */
export async function generatePassphrase(
  wordCount: number = 4,
  separator: string = '-'
): Promise<GeneratedPassword> {
  // Simple word list for demonstration - in production, use a larger dictionary
  const words = [
    'apple', 'bridge', 'castle', 'dragon', 'elephant', 'forest', 'garden', 'house',
    'island', 'jungle', 'knight', 'library', 'mountain', 'ocean', 'palace', 'queen',
    'river', 'sunset', 'temple', 'universe', 'village', 'wizard', 'crystal', 'phoenix'
  ];

  const randomBytes = await Crypto.getRandomBytesAsync(wordCount);
  const selectedWords: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const randomIndex = randomBytes[i] % words.length;
    selectedWords.push(words[randomIndex]);
  }

  const passphrase = selectedWords.join(separator);
  const strength = calculatePasswordStrength(passphrase);
  const entropy = Math.log2(Math.pow(words.length, wordCount));

  return {
    password: passphrase,
    strength,
    entropy,
  };
}

/**
 * Check if a password has been compromised in known data breaches
 * (This would typically call an API like HaveIBeenPwned)
 */
export function checkPasswordBreach(password: string): Promise<boolean> {
  // Placeholder implementation - would integrate with breach detection service
  return Promise.resolve(false);
}

/**
 * Get password strength description
 */
export function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return 'Very Weak';
    case PasswordStrength.WEAK:
      return 'Weak';
    case PasswordStrength.MODERATE:
      return 'Moderate';
    case PasswordStrength.STRONG:
      return 'Strong';
    case PasswordStrength.VERY_STRONG:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.VERY_WEAK:
      return '#ff4757'; // Red
    case PasswordStrength.WEAK:
      return '#ff6b9d'; // Light red
    case PasswordStrength.MODERATE:
      return '#ffab00'; // Orange
    case PasswordStrength.STRONG:
      return '#00d4ff'; // Blue
    case PasswordStrength.VERY_STRONG:
      return '#00ff88'; // Green
    default:
      return '#666666'; // Gray
  }
}