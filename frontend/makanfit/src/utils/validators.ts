// utils/validators.ts
// Shared form validation for email, name, password, height and birth date.

export const validateEmail = (
  email: string
): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true };
};

/** label is used in the message, e.g. "first name" -> "Please enter your first name" */
export const validateName = (
  name: string,
  label = "name"
): { isValid: boolean; error?: string } => {
  const value = String(name ?? "").trim();

  if (!value) {
    return { isValid: false, error: `Please enter your ${label}` };
  }

  if (value.length > 50) {
    return { isValid: false, error: `Your ${label} is too long` };
  }

  // letters (any language), spaces, hyphens, apostrophes, dots
  if (!/^[\p{L}\s.'-]+$/u.test(value)) {
    return {
      isValid: false,
      error: `Your ${label} can only contain letters and spaces`,
    };
  }

  return { isValid: true };
};

export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  return { isValid: true };
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your new password" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true };
};

export const validateHeight = (
  heightCm: string | number | null | undefined
): { isValid: boolean; error?: string } => {
  const h = Number(heightCm);

  if (heightCm == null || heightCm === "" || !Number.isFinite(h)) {
    return { isValid: false, error: "Please enter your height" };
  }

  if (h < 50 || h > 250) {
    return { isValid: false, error: "Height must be between 50 and 250 cm" };
  }

  return { isValid: true };
};

export const validateBirthDate = (
  birthDate: string | null | undefined
): { isValid: boolean; error?: string } => {
  if (!birthDate) {
    return { isValid: false, error: "Please select your date of birth" };
  }

  const d = new Date(birthDate);
  const now = new Date();
  const oldest = new Date();
  oldest.setFullYear(now.getFullYear() - 120);

  if (isNaN(d.getTime())) {
    return { isValid: false, error: "Please enter a valid date" };
  }

  if (d > now) {
    return { isValid: false, error: "Date of birth can't be in the future" };
  }

  if (d < oldest) {
    return { isValid: false, error: "Please enter a valid date of birth" };
  }

  return { isValid: true };
};

/** New email must be valid and different from the current one. */
export const validateEmailChange = (
  newEmail: string,
  currentEmail: string
): { isValid: boolean; error?: string } => {
  const result = validateEmail(newEmail);
  if (!result.isValid) return result;

  if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
    return {
      isValid: false,
      error: "Your new email is the same as your current email.",
    };
  }

  return { isValid: true };
};

export const validateTerms = (
  accepted: boolean
): { isValid: boolean; error?: string } => {
  if (!accepted) {
    return { isValid: false, error: "You must accept the terms and conditions" };
  }

  return { isValid: true };
};