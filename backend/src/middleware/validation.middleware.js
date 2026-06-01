import { ValidationError } from '../utils/errors.js';

/**
 * Creates an Express middleware to validate request bodies.
 * @param {Object} schema Validation rules. Example: { name: { required: true, type: 'string' } }
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    if (!req.body) {
      return next(new ValidationError('Request body is missing'));
    }

    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required.`;
        continue;
      }

      // Check type if value exists
      if (value !== undefined && value !== null) {
        if (rules.type) {
          if (rules.type === 'array') {
            if (!Array.isArray(value)) {
              errors[field] = `${field} must be an array.`;
            }
          } else if (typeof value !== rules.type) {
            errors[field] = `${field} must be a ${rules.type}.`;
          }
        }

        // Custom validation function
        if (rules.custom && typeof rules.custom === 'function') {
          try {
            const isValid = rules.custom(value);
            if (!isValid) {
              errors[field] = rules.message || `${field} failed validation.`;
            }
          } catch (err) {
            errors[field] = err.message || `${field} validation failed.`;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(new ValidationError('Request validation failed', errors));
    }

    next();
  };
};

export default validateBody;
