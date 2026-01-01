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

if (!form || !successMessage) {
  throw new Error("DOM elements missing");
}

// get form data
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
    field.classList.add("error");
    field.classList.remove("success");
    errorElement.textContent = result.error;
    errorElement.style.opacity = "1";
  } else {
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

  if (type === "confirmPassword") compareValue = formData.password;

  const validationResult = validate(type, field.value, compareValue);
  updateFieldUI(field, validationResult);
};

// Real-time validation
inputs.forEach((input) => {
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    if (input.classList.contains("error")) validateField(input);
  });
});

// Form submission
form.addEventListener("submit", (e: Event) => {
  e.preventDefault();
  const formData = getFormData();
  const validationResults = validateForm(formData);
  const isValid = isFormValid(validationResults);

  Object.entries(validationResults).forEach(([fieldName, result]) => {
    const field = form.querySelector<HTMLInputElement>(`#${fieldName}`);
    if (field) updateFieldUI(field, result);
  });

  if (isValid) {
    successMessage.classList.remove("hidden");
    form.reset();
    inputs.forEach((input) => input.classList.remove("success", "error"));
    setTimeout(() => successMessage.classList.add("hidden"), 5000);
    console.log("Form Submitted Successfully:", formData);
  } else {
    successMessage.classList.add("hidden");
  }
});

export { validate, validateField };
