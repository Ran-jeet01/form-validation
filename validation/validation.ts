// types and   interfaces
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export type ValidationType =
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | "name"
  | "phone"
  | "address"
  | "age";

// Validation rules for different ways to satisfy
const isRequired = (message = "This field is required") => ({
  validate: (value: string) => value.trim().length > 0,
  errorMessage: message,
});

const minLength = (min: number, message?: string) => ({
  validate: (value: string) => value.length >= min,
  errorMessage: message || `Must be at least ${min} characters`,
});

const isEmail = (message = "Invalid email address") => ({
  validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  errorMessage: message,
});
// Validation rules setup according to different input field

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
  phone: [
    isRequired("Phone number is required"),
    {
      validate: (v) => /^\d{10}$/.test(v),
      errorMessage: "Phone number must be 10 digits",
    },
  ],
  address: [
    isRequired("Address is required"),
    minLength(5, "Address must be at least 5 characters"),
  ],
  age: [
    isRequired("Age is required"),
    {
      validate: (v) => !isNaN(Number(v)) && Number(v) > 0 && Number(v) < 120,
      errorMessage: "Please enter a valid age",
    },
  ],
};
// this function is to check the if confirm password === password

export function validate(
  type: ValidationType,
  value: string,
  compareValue?: string
): ValidationResult {
  const rules = validationRules[type];
  if (!rules)
    return { isValid: false, error: `Unknown validation type: ${type}` };

  if (type === "confirmPassword" && compareValue !== undefined) {
    if (value.trim().length === 0)
      return { isValid: false, error: "Please confirm your password" };
    if (value !== compareValue)
      return { isValid: false, error: "Passwords do not match" };
    return { isValid: true };
  }

  for (const rule of rules) {
    if (!rule.validate(value, compareValue))
      return { isValid: false, error: rule.errorMessage };
  }
  return { isValid: true };
}
// check all input at once not individually
export function validateForm(
  formData: Record<string, string>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  Object.keys(formData).forEach((key) => {
    const type = getValidationType(key);
    const compareValue =
      type === "confirmPassword" ? formData.password : undefined;
    results[key] = validate(type, formData[key], compareValue);
  });
  return results;
}

export function isFormValid(
  validationResults: Record<string, ValidationResult>
): boolean {
  return Object.values(validationResults).every((r) => r.isValid);
}
// conforming the type of the input field

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
    case "phone":
      return "phone";
    case "address":
      return "address";
    case "age":
      return "age";
    default:
      return "name";
  }
}
