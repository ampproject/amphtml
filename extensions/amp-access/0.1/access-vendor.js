/**
 * This interface is intended to be implemented by AMP Access vendors to
 * provide authorization and pingback.
 * @interface
 */
export class AccessVendor {
  /**
   * Requests authorization from the vendor. Returns a promise that yields
   * a JSON authorization response.
   * @return {!Promise<!JsonObject>}
   */
  authorize() {}

  /**
   * Registeres the "viewed" event as a pingback to the authorization vendor.
   * This signal can be used to count-down quotas.
   * @return {!Promise}
   */
  pingback() {}
}
