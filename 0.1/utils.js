/**
 * Get capitalized method with prefix
 * @param {string} prefix - The prefix
 * @param {string} methodName - The method name
 * @return {string} - The capitalized method with prefix
 */
export function getCapitalizedMethodWithPrefix(prefix, methodName) {
  return prefix + methodName.charAt(0).toUpperCase() + methodName.slice(1);
}
