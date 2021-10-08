import {user} from '#utils/log';

/** @const */
const TAG = 'amp-subscriptions';

/**
 * Describes metering state for a single publication.
 * @typedef {{
 *   id: string,
 *   attributes: !Array<{
 *     name: string,
 *     timestamp: string,
 *   }>,
 * }}
 */
let MeteringStateDef;

/** Handles metering functionality. */
export class Metering {
  /**
   *
   * @param {{
   *   platformKey: string,
   * }} params
   */
  constructor({platformKey}) {
    /**
     * Remembers if metering entitlements were fetched
     * with the current metering state.
     *
     * This helps avoid redundant fetches.
     * @type {boolean}
     */
    this.entitlementsWereFetchedWithCurrentMeteringState = false;

    /**
     * Key for the subscription platform with metering enabled.
     * @const
     */
    this.platformKey = platformKey;

    /**
     * Metering state for user.
     * Currently this isn't persisted. It's just saved in memory.
     * @private
     */
    this.meteringStateString_ = '';
  }

  /**
   * Saves metering state for a given publication ID.
   *
   * @param {!MeteringStateDef} meteringState
   * @return {!Promise}
   */
  saveMeteringState(meteringState) {
    const meteringStateString = JSON.stringify(meteringState);

    const meteringStateChangedPromise = Promise.resolve(
      this.meteringStateString_
    ).then((existingMeteringStateString) => {
      const changed = meteringStateString !== existingMeteringStateString;

      // Log when an existing metering state is updated.
      if (existingMeteringStateString && changed) {
        user().info(
          TAG,
          `Meter state changed from ${existingMeteringStateString} to ${meteringStateString}`
        );
      }

      return changed;
    });

    return meteringStateChangedPromise.then((meteringStateChanged) => {
      if (!meteringStateChanged) {
        // Bail. Fetching metering entitlements again is redundant,
        // until the metering state changes.
        return;
      }

      this.meteringStateString_ = meteringStateString;
      this.entitlementsWereFetchedWithCurrentMeteringState = false;
    });
  }

  /**
   * Loads metering state for a given publication ID.
   *
   * @return {!Promise<?MeteringStateDef>}
   */
  loadMeteringState() {
    if (!this.meteringStateString_) {
      return Promise.resolve(null);
    }

    return Promise.resolve(JSON.parse(this.meteringStateString_));
  }
}
