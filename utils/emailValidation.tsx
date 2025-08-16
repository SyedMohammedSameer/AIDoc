// utils/emailValidation.ts
export interface EmailValidationResult {
    isValid: boolean;
    score: number; // 0-100, higher is better
    issues: string[];
    suggestions: string[];
    level: 'valid' | 'warning' | 'error';
  }
  
  export class EmailValidator {
    // Common disposable email domains to block
    private static readonly DISPOSABLE_DOMAINS = new Set([
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
      'throwaway.email', 'temp-mail.org', 'getnada.com', 'maildrop.cc',
      'sharklasers.com', 'yopmail.com', 'mohmal.com', 'mytrashmail.com'
    ]);
  
    // Common typos in popular email domains
    private static readonly DOMAIN_TYPOS = new Map([
      ['gmial.com', 'gmail.com'],
      ['gmai.com', 'gmail.com'],
      ['gmail.co', 'gmail.com'],
      ['gmeil.com', 'gmail.com'],
      ['hotmial.com', 'hotmail.com'],
      ['hotmai.com', 'hotmail.com'],
      ['hotmil.com', 'hotmail.com'],
      ['yahooo.com', 'yahoo.com'],
      ['yaho.com', 'yahoo.com'],
      ['outloo.com', 'outlook.com'],
      ['outlok.com', 'outlook.com'],
      ['iclou.com', 'icloud.com'],
      ['iclould.com', 'icloud.com']
    ]);
  
    // Comprehensive email validation
    public static validateEmail(email: string): EmailValidationResult {
      const result: EmailValidationResult = {
        isValid: false,
        score: 0,
        issues: [],
        suggestions: [],
        level: 'error'
      };
  
      // Basic checks
      if (!email) {
        result.issues.push('Email is required');
        return result;
      }
  
      const trimmedEmail = email.trim().toLowerCase();
      
      // Length validation
      if (trimmedEmail.length > 254) {
        result.issues.push('Email is too long (max 254 characters)');
        return result;
      }
  
      if (trimmedEmail.length < 5) {
        result.issues.push('Email is too short');
        return result;
      }
  
      // Basic format validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      
      if (!emailRegex.test(trimmedEmail)) {
        result.issues.push('Invalid email format');
        return result;
      }
  
      let score = 50; // Base score for valid format
  
      // Split email into parts
      const [localPart, domainPart] = trimmedEmail.split('@');
  
      // Validate local part (before @)
      const localValidation = this.validateLocalPart(localPart);
      score += localValidation.score;
      result.issues.push(...localValidation.issues);
      result.suggestions.push(...localValidation.suggestions);
  
      // Validate domain part (after @)
      const domainValidation = this.validateDomainPart(domainPart);
      score += domainValidation.score;
      result.issues.push(...domainValidation.issues);
      result.suggestions.push(...domainValidation.suggestions);
  
      // Check for disposable email
      if (this.DISPOSABLE_DOMAINS.has(domainPart)) {
        result.issues.push('Temporary/disposable email addresses are not allowed');
        score -= 30;
      }
  
      // Check for common typos
      const suggestion = this.DOMAIN_TYPOS.get(domainPart);
      if (suggestion) {
        result.suggestions.push(`Did you mean ${localPart}@${suggestion}?`);
        score -= 20;
      }
  
      // Final scoring and level determination
      result.score = Math.max(0, Math.min(100, score));
      
      if (result.score >= 80 && result.issues.length === 0) {
        result.isValid = true;
        result.level = 'valid';
      } else if (result.score >= 60 && result.issues.length === 0) {
        result.isValid = true;
        result.level = 'warning';
      } else {
        result.isValid = false;
        result.level = 'error';
      }
  
      return result;
    }
  
    private static validateLocalPart(localPart: string): { score: number; issues: string[]; suggestions: string[] } {
      const result = { score: 0, issues: [] as string[], suggestions: [] as string[] };
  
      if (localPart.length > 64) {
        result.issues.push('Email username is too long');
        return result;
      }
  
      if (localPart.length < 1) {
        result.issues.push('Email username is required');
        return result;
      }
  
      // Check for consecutive dots
      if (localPart.includes('..')) {
        result.issues.push('Email cannot contain consecutive dots');
        return result;
      }
  
      // Check for dots at start or end
      if (localPart.startsWith('.') || localPart.endsWith('.')) {
        result.issues.push('Email cannot start or end with a dot');
        return result;
      }
  
      // Check for valid characters
      const validLocalRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
      if (!validLocalRegex.test(localPart)) {
        result.issues.push('Email contains invalid characters');
        return result;
      }
  
      // Scoring based on quality
      result.score = 20; // Base score for valid local part
  
      // Bonus for reasonable length
      if (localPart.length >= 3 && localPart.length <= 20) {
        result.score += 10;
      }
  
      // Penalty for too many special characters
      const specialCharCount = (localPart.match(/[^a-zA-Z0-9]/g) || []).length;
      if (specialCharCount > localPart.length * 0.3) {
        result.score -= 5;
        result.suggestions.push('Consider using fewer special characters');
      }
  
      return result;
    }
  
    private static validateDomainPart(domainPart: string): { score: number; issues: string[]; suggestions: string[] } {
      const result = { score: 0, issues: [] as string[], suggestions: [] as string[] };
  
      if (domainPart.length > 253) {
        result.issues.push('Domain name is too long');
        return result;
      }
  
      if (domainPart.length < 4) {
        result.issues.push('Domain name is too short');
        return result;
      }
  
      // Check for valid domain format
      const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(domainPart)) {
        result.issues.push('Invalid domain format');
        return result;
      }
  
      // Check for TLD
      if (!domainPart.includes('.')) {
        result.issues.push('Domain must include a top-level domain (e.g., .com)');
        return result;
      }
  
      const parts = domainPart.split('.');
      const tld = parts[parts.length - 1];
  
      // Validate TLD
      if (tld.length < 2) {
        result.issues.push('Top-level domain is too short');
        return result;
      }
  
      if (!/^[a-zA-Z]+$/.test(tld)) {
        result.issues.push('Top-level domain should contain only letters');
        return result;
      }
  
      // Base score for valid domain
      result.score = 20;
  
      // Check for common, reputable domains
      const popularDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com'];
      if (popularDomains.includes(domainPart)) {
        result.score += 10;
      }
  
      // Check for business domains (more than 2 parts)
      if (parts.length >= 3) {
        result.score += 5;
      }
  
      // Penalty for suspicious patterns
      if (domainPart.includes('--')) {
        result.score -= 5;
        result.suggestions.push('Domain contains unusual characters');
      }
  
      return result;
    }
  
    // Quick validation for real-time feedback
    public static quickValidate(email: string): boolean {
      if (!email) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    }
  
    // Get user-friendly validation message
    public static getValidationMessage(result: EmailValidationResult): string {
      if (result.isValid && result.level === 'valid') {
        return 'Email looks great!';
      }
      
      if (result.isValid && result.level === 'warning') {
        return result.suggestions[0] || 'Email is valid but could be improved';
      }
      
      return result.issues[0] || 'Please enter a valid email address';
    }
  
    // Check if email domain supports plus addressing (email+tag@domain.com)
    public static supportsPlusAddressing(email: string): boolean {
      const domain = email.split('@')[1]?.toLowerCase();
      const supportedDomains = ['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com'];
      return supportedDomains.includes(domain);
    }
  
    // Normalize email (remove dots from Gmail, convert to lowercase, etc.)
    public static normalizeEmail(email: string): string {
      const [localPart, domainPart] = email.toLowerCase().trim().split('@');
      
      // Gmail specific normalization
      if (['gmail.com', 'googlemail.com'].includes(domainPart)) {
        // Remove dots and everything after +
        const normalizedLocal = localPart.replace(/\./g, '').split('+')[0];
        return `${normalizedLocal}@gmail.com`;
      }
      
      return `${localPart}@${domainPart}`;
    }
  }
  
  // Hook for real-time email validation in React components
  export function useEmailValidation(email: string) {
    const [validation, setValidation] = React.useState<EmailValidationResult | null>(null);
    const [isValidating, setIsValidating] = React.useState(false);
  
    React.useEffect(() => {
      if (!email) {
        setValidation(null);
        return;
      }
  
      setIsValidating(true);
      
      // Debounce validation
      const timer = setTimeout(() => {
        const result = EmailValidator.validateEmail(email);
        setValidation(result);
        setIsValidating(false);
      }, 300);
  
      return () => clearTimeout(timer);
    }, [email]);
  
    return { validation, isValidating };
  }