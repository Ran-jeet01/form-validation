// script to get functionality froem validation.ts and use like using library
import {
  validate,
  validateForm,
  isFormValid,
  getValidationType,
} from "../validation/validation";
import type { ValidationResult } from "../validation/validation";

// DOM Elements
const form = document.getElementById("registration-form") as HTMLFormElement;
const inputs = document.querySelectorAll<HTMLInputElement>(".form-input");
const successMessage = document.getElementById("success-message");

// Check  DOM elements exist
if (!form || !successMessage) {
  throw new Error("DOM elements missing");
}
// getting form data
const getFormData = (): Record<string, string> => {
  const data: Record<string, string> = {};

  inputs.forEach((input) => {
    data[input.name] = input.value;
  });

  return data;
};

const updateFieldUI = (
  field: HTMLInputElement,
  result: ValidationResult
): void => {
  const errorElement = document.getElementById(`${field.id}-error`);

  if (!errorElement) return;

  if (!result.isValid && result.error) {
    // Show error
    field.classList.add("error");
    field.classList.remove("success");
    errorElement.textContent = result.error;
    errorElement.style.opacity = "1";
  } else {
    // Clear error
    field.classList.remove("error");
    field.classList.add("success");
    errorElement.textContent = "";
    errorElement.style.opacity = "0";
  }
};

const validateField = (field: HTMLInputElement): void => {
  const formData = getFormData();
  const type = getValidationType(field.name);
  let compareValue: string | undefined;

  // Special handling for confirmPassword
  if (type === "confirmPassword") {
    compareValue = formData.password;
  }

  // Call the validation function from validation module
  const validationResult = validate(type, field.value, compareValue);

  // Update UI
  updateFieldUI(field, validationResult);
};

//  event listeners for real-time validation of the data
inputs.forEach((input) => {
  // Validate when user leaves this field
  input.addEventListener("blur", () => {
    validateField(input);
  });

  // Clear/update error as user types
  input.addEventListener("input", () => {
    if (input.classList.contains("error")) {
      validateField(input);
    }
  });
});

// Form submission handler
form.addEventListener("submit", (e: Event) => {
  e.preventDefault();

  const formData = getFormData();
  const validationResults = validateForm(formData);
  const isValid = isFormValid(validationResults);

  // Update UI for each field
  Object.entries(validationResults).forEach(([fieldName, result]) => {
    const field = form.querySelector<HTMLInputElement>(`#${fieldName}`);
    if (field) {
      updateFieldUI(field, result);
    }
  });

  if (isValid) {
    // Show success message
    successMessage.classList.remove("hidden");

    // Reset form
    form.reset();
    inputs.forEach((input) => {
      input.classList.remove("success");
      input.classList.remove("error");
      const errorElement = document.getElementById(`${input.id}-error`);
      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.opacity = "0";
      }
    });

    // Hide success message after 5 seconds
    setTimeout(() => {
      successMessage.classList.add("hidden");
    }, 5000);

    console.log("Form Submitted Successfully:", formData);
  } else {
    successMessage.classList.add("hidden");
  }
});

// Export for use in browser console if needed
export { validate, validateField };
