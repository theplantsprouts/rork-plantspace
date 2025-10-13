import validator from 'validator';

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return validator.escape(validator.trim(input));
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  return validator.normalizeEmail(validator.trim(email)) || '';
};

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  return validator.isEmail(email.trim());
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (!username) {
    return { valid: false, message: 'Username is required' };
  }
  
  const sanitized = validator.trim(username);
  
  if (sanitized.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  
  if (sanitized.length > 30) {
    return { valid: false, message: 'Username must be less than 30 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(sanitized)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { valid: true };
};

export const validateName = (name: string): { valid: boolean; message?: string } => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }
  
  const sanitized = validator.trim(name);
  
  if (sanitized.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (sanitized.length > 50) {
    return { valid: false, message: 'Name must be less than 50 characters' };
  }
  
  return { valid: true };
};

export const validateBio = (bio: string): { valid: boolean; message?: string } => {
  if (!bio) {
    return { valid: false, message: 'Bio is required' };
  }
  
  const sanitized = validator.trim(bio);
  
  if (sanitized.length < 10) {
    return { valid: false, message: 'Bio must be at least 10 characters long' };
  }
  
  if (sanitized.length > 500) {
    return { valid: false, message: 'Bio must be less than 500 characters' };
  }
  
  return { valid: true };
};

export const validatePostContent = (content: string): { valid: boolean; message?: string } => {
  if (!content) {
    return { valid: false, message: 'Post content is required' };
  }
  
  const sanitized = validator.trim(content);
  
  if (sanitized.length < 1) {
    return { valid: false, message: 'Post content cannot be empty' };
  }
  
  if (sanitized.length > 5000) {
    return { valid: false, message: 'Post content must be less than 5000 characters' };
  }
  
  return { valid: true };
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
