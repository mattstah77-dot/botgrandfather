export interface ConfigFieldSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  default?: any;
}

export interface ConfigSchema {
  [fieldName: string]: ConfigFieldSchema;
}

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Validate a config object against a template schema.
 * Simple but extensible — no external validation libraries needed for MVP.
 */
export function validateConfigAgainstSchema(
  config: Record<string, any>,
  schema: ConfigSchema,
): void {
  if (!config || typeof config !== 'object') {
    throw new ConfigValidationError('Config must be an object');
  }

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const value = config[fieldName];
    const isMissing = value === undefined || value === null;

    if (fieldSchema.required && isMissing) {
      throw new ConfigValidationError(`Missing required config field: "${fieldName}"`);
    }

    if (!isMissing) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== fieldSchema.type) {
        throw new ConfigValidationError(
          `Config field "${fieldName}" must be of type "${fieldSchema.type}", got "${actualType}"`,
        );
      }
    }
  }

  // Warn about unknown fields (not strict error for MVP flexibility)
  const knownFields = new Set(Object.keys(schema));
  for (const key of Object.keys(config)) {
    if (!knownFields.has(key)) {
      // In production this could be a strict error; for MVP we allow extra fields
    }
  }
}

/**
 * Apply defaults from schema to config.
 */
export function applyConfigDefaults(
  config: Record<string, any>,
  schema: ConfigSchema,
): Record<string, any> {
  const result = { ...config };
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    if (result[fieldName] === undefined && fieldSchema.default !== undefined) {
      result[fieldName] = fieldSchema.default;
    }
  }
  return result;
}
