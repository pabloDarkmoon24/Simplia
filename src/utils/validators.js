// src/utils/validators.js

export const validators = {
  // Validar email
  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Validar teléfono colombiano
  isValidPhone: (phone) => {
    const regex = /^(\+57)?[0-9]{10}$/;
    return regex.test(phone.replace(/\s/g, ''));
  },

  // Sanitizar string (prevenir XSS)
  sanitizeString: (str) => {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  },

  // Validar que sea solo letras y espacios
  isValidName: (name) => {
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]{2,50}$/;
    return regex.test(name);
  },

  // Validar contraseña fuerte
  isStrongPassword: (password) => {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
  },

  // Validar monto (solo números positivos)
  isValidAmount: (amount) => {
    return !isNaN(amount) && amount > 0 && amount <= 100000000;
  }
};