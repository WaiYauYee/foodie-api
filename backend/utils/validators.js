// utils/validators.js

// ============================================
// VALIDATION HELPERS
// ============================================

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
};

const validateSignUpData = (data) => {
  // Check if data exists
  if (!data) {
    return { valid: false, message: "Request body is required" };
  }

  // Check required fields exist and are not empty
  if (!data.firstName || !data.firstName.trim()) {
    return { valid: false, message: "First name is required" };
  }
  if (!data.lastName || !data.lastName.trim()) {
    return { valid: false, message: "Last name is required" };
  }
  if (!data.email) {
    return { valid: false, message: "Email is required" };
  }
  if (!data.password) {
    return { valid: false, message: "Password is required" };
  }
  if (!data.confirmPassword) {
    return { valid: false, message: "Confirm password is required" };
  }

  // Validate email format
  if (!validateEmail(data.email)) {
    return { valid: false, message: "Invalid email format" };
  }

  // Check passwords match
  if (data.password !== data.confirmPassword) {
    return { valid: false, message: "Passwords do not match" };
  }

  // Validate password strength
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    return { valid: false, message: passwordValidation.message };
  }

  return { valid: true };
};

const validateOnboardingData = (data) => {
  if (!data) return { valid: false, message: "Onboarding data is missing" };
  if (data.triedOtherApps === undefined) return { valid: false, message: "Answer is required" };
  if (!data.dietType) return { valid: false, message: "Diet Type is required" };
  if (!data.primaryGoal) return { valid: false, message: "Primary goal is required" };
  if (!data.gender) return { valid: false, message: "Gender is required" };
  if (!data.birthDate) return { valid: false, message: "Date of birth is required" };
  if (!data.heightCm) return { valid: false, message: "Valid height is required" };
  if (!data.startWeight) return { valid: false, message: "Start weight is required" };
  if (!data.goalWeight) return { valid: false, message: "Goal weight is required" };
  if (!data.activityLevel) return { valid: false, message: "Activity level is required" };
  if (!data.dietaryGoal) return { valid: false, message: "Dietary goal is required" };
  return { valid: true };
};

module.exports = { validateEmail, validatePassword, validateSignUpData, validateOnboardingData };
