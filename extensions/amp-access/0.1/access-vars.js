/**
 * Exports the substitution variables for access services.
 *
 * @interface
 */
export class AccessVars {
  /**
   * Returns the promise that will yield the access READER_ID.
   *
   * This is a restricted API.
   *
   * @return {?Promise<string>}
   */
  getAccessReaderId() {}

  /**
   * Returns the promise that will yield the value of the specified field from
   * the authorization response. This method will wait for the most recent
   * authorization request to complete. It will return null values for failed
   * requests with no fallback, but could be modified to block indefinitely.
   *
   * This is a restricted API.
   *
   * @param {string} unusedField
   * @return {?Promise<*>}
   */
  getAuthdataField(unusedField) {}
}
