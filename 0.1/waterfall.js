/**
 * Represents a single entry in the ad waterfall.
 */
class WaterfallEntry {
  /**
   * @param {object} params The parameters for the entry.
   * @param {number} params.position
   * @param {string} params.provider
   * @param {string} params.path
   * @param {!Array<!Array<number>>} params.sizes
   * @param {{[key: string]: (string|!Array<string>)}} params.keyValues
   * @param {{[key: string]: !Object}} params.vendors
   */
  constructor({
    keyValues = {},
    path = '',
    position = 0,
    provider = '',
    sizes = [],
    vendors = {},
  }) {
    this.position = position;
    this.provider = provider;
    this.path = path;
    this.sizes = sizes;
    this.keyValues = keyValues;
    this.vendors = vendors;
  }
}

/**
 * Waterfall model that keeps data for the next ad refresh.
 */
export class Waterfall {
  /**
   * @param {string} unitCode
   * @param {!Array<!WaterfallEntry>} entries
   * @param {{[key: string]: string}} commonKeyValues
   */
  constructor(unitCode, entries, commonKeyValues) {
    /** @public {string} */
    this.unitCode = unitCode;

    /** @private {!Array<!WaterfallEntry>} */
    this.entries_ = entries.sort((a, b) => a.position - b.position);

    /** @public {{[key: string]: string}} */
    this.commonKeyValues = commonKeyValues;

    /** @private {number} The index of the next entry to use. */
    this.currentIndex_ = 0;
  }

  /**
   * Gets the currently active waterfall entry.
   * @return {?WaterfallEntry}
   */
  getCurrentEntry() {
    return this.entries_[this.currentIndex_] || null;
  }

  /**
   * Advances the waterfall to the next entry.
   * @return {?WaterfallEntry} The new current entry, or null if the waterfall is exhausted.
   */
  getNextEntry() {
    this.currentIndex_++;
    return this.getCurrentEntry();
  }

  /**
   * Creates a Waterfall instance from a UnitWaterfallMessage.
   * @param {!UnitWaterfallMessage} waterfallMessage The message to process.
   * @return {!Waterfall}
   */
  static fromWaterfallMessage(waterfallMessage) {
    const {commonKeyValues, entries, unitCode} = waterfallMessage.message;

    const waterfallEntries = (entries || []).map(
      (entryData) => new WaterfallEntry(entryData)
    );

    return new Waterfall(unitCode, waterfallEntries, commonKeyValues);
  }
}
