/** @fileoverview Shared constants. */

/**
 * How long to wait before giving up on an entitlements request.
 * @const
 */
export const ENTITLEMENTS_REQUEST_TIMEOUT = 3000;

/**
 * Possible score factors.
 * @const @enum {string}
 */
export const SubscriptionsScoreFactor = {
  // User is known to platform and has a form of payment registered
  IS_READY_TO_PAY: 'isReadyToPay',
  // Platform supports the current viewer environment
  SUPPORTS_VIEWER: 'supportsViewer',
};

/**
 * All other score factors are ignored if not specified in the publisher
 * config so adding a default here would be meaningless.
 */
export const DEFAULT_SCORE_CONFIG = {};
