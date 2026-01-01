/**
 * Validation Module
 * Contains all validation logic and rules
 */

// Types and Interfaces
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export type ValidationType =
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | "name";

// Validation Rules
const isRequired = (
  message: string = "This field is required"
): { validate: (value: string) => boolean; errorMessage: string } => ({
  validate: (value: string) => value.trim().length > 0,
  errorMessage: message,
});

const minLength = (
  min: number,
  message?: string
): { validate: (value: string) => boolean; errorMessage: string } => ({
  validate: (value: string) => value.length >= min,
  errorMessage: message || `Must be at least ${min} characters`,
});

const isEmail = (
  message: string = "Invalid email address"
): { validate: (value: string) => boolean; errorMessage: string } => ({
  validate: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  errorMessage: message,
});

// Validation Rules Configuration
const validationRules: Record<
  ValidationType,
  Array<{
    validate: (value: string, compareValue?: string) => boolean;
    errorMessage: string;
  }>
> = {
  username: [
    isRequired("Username is required"),
    minLength(3, "Username must be at least 3 characters"),
  ],
  email: [
    isRequired("Email is required"),
    isEmail("Please enter a valid email address"),
  ],
  password: [
    isRequired("Password is required"),
    minLength(8, "Password must be at least 8 characters"),
  ],
  confirmPassword: [isRequired("Please confirm your password")],
  name: [
    isRequired("Name is required"),
    minLength(2, "Name must be at least 2 characters"),
  ],
};

/**
 * Main validation function
 *
 * @param type - Type of field to validate
 * @param value - Value to validate
 * @param compareValue - Optional value for comparison (used for confirmPassword)
 * @returns ValidationResult object
 */
export function validate(
  type: ValidationType,
  value: string,
  compareValue?: string
): ValidationResult {
  const rules = validationRules[type];

  if (!rules) {
    return {
      isValid: false,
      error: `Unknown validation type: ${type}`,
    };
  }

  // Special handling for confirmPassword
  if (type === "confirmPassword" && compareValue !== undefined) {
    // Check required first
    if (value.trim().length === 0) {
      return {
        isValid: false,
        error: "Please confirm your password",
      };
    }

    // Then check if passwords match
    if (value !== compareValue) {
      return {
        isValid: false,
        error: "Passwords do not match",
      };
    }

    return { isValid: true };
  }

  // Regular validation for other types
  for (const rule of rules) {
    if (!rule.validate(value, compareValue)) {
      return {
        isValid: false,
        error: rule.errorMessage,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates an entire form by checking all fields
 *
 * @param formData - Object containing form values
 * @returns Object with validation results for each field
 */
export function validateForm(
  formData: Record<string, string>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  // Validate username
  if (formData.username !== undefined) {
    results.username = validate("username", formData.username);
  }

  // Validate email
  if (formData.email !== undefined) {
    results.email = validate("email", formData.email);
  }

  // Validate password
  if (formData.password !== undefined) {
    results.password = validate("password", formData.password);
  }

  // Validate confirmPassword (requires password for comparison)
  if (formData.confirmPassword !== undefined) {
    results.confirmPassword = validate(
      "confirmPassword",
      formData.confirmPassword,
      formData.password
    );
  }

  return results;
}

/**
 * Helper to check if entire form is valid
 *
 * @param validationResults - Results from validateForm
 * @returns boolean indicating if all fields are valid
 */
export function isFormValid(
  validationResults: Record<string, ValidationResult>
): boolean {
  return Object.values(validationResults).every((result) => result.isValid);
}

/**
 * Gets validation type based on field name
 *
 * @param fieldName - Name of the form field
 * @returns ValidationType
 */
export function getValidationType(fieldName: string): ValidationType {
  switch (fieldName) {
    case "username":
      return "username";
    case "email":
      return "email";
    case "password":
      return "password";
    case "confirmPassword":
      return "confirmPassword";
    default:
      return "name";
  }
}
