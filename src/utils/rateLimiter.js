// src/utils/rateLimiter.js

class RateLimiter {
  constructor() {
    this.attempts = new Map();
  }

  canAttempt(key, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Filtrar intentos dentro de la ventana de tiempo
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < windowMs
    );
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();