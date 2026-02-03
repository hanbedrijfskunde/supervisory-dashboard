/**
 * Generate a unique ID
 * @returns {string} UUID v4
 */
export function generateId() {
  return crypto.randomUUID()
}
