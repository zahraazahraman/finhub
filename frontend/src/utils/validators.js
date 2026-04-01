export const validators = {
  required: (value, fieldName = "This field") =>
    !value?.toString().trim() ? `${fieldName} is required.` : null,

  email: (value) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? "Enter a valid email address."
      : null,

  minLength: (value, min, fieldName = "This field") =>
    value?.length < min
      ? `${fieldName} must be at least ${min} characters.`
      : null,

  maxLength: (value, max, fieldName = "This field") =>
    value?.length > max
      ? `${fieldName} must be at most ${max} characters.`
      : null,

  match: (value, matchValue, fieldName = "Passwords") =>
    value !== matchValue ? `${fieldName} do not match.` : null,

  numeric: (value, fieldName = "This field") =>
    isNaN(value) ? `${fieldName} must be a number.` : null,

  range: (value, min, max, fieldName = "This field") =>
    value < min || value > max
      ? `${fieldName} must be between ${min} and ${max}.`
      : null,

  phone: (value) =>
    value && !/^[0-9+\-\s()]{7,15}$/.test(value)
      ? "Enter a valid phone number."
      : null,
};

// Run multiple validators and return first error found
export function validate(value, rules) {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

// Validate an entire form object
export function validateForm(fields) {
  const errors = {};
  for (const [key, rules] of Object.entries(fields)) {
    const error = rules;
    if (error) errors[key] = error;
  }
  return errors;
}