/**
 * Waterfall model that keeps data for the next ad refresh.
 */
export class NextRefresh {
  /**
   * @param {Object=} data Initial data.
   */
  constructor(data = {}) {
    /** @public {string} */
    this.code = data.code || '';

    /** @public {string} */
    this.provider = data.provider || '';

    /** @public {string} */
    this.path = data.path || '';

    /** @public {!Array<!Array<number>>} */
    this.sizesArray = data.sizesArray || [];

    /** @public {string} */
    this.sizesString = data.sizesString || '';

    /** @public {!Array<!Object<string, string>>} */
    this.keyValues = data.keyValues || [];

    /** @public {!Array<!Object<string, string>>} */
    this.parameters = data.parameters || [];
  }

  /**
   * Creates a NextRefresh instance from a raw waterfall message from the server.
   * @param {!Object} message The waterfall message to process.
   * @return {!NextRefresh}
   */
  static fromWaterfallMessage(message) {
    const data = {
      code: message.code,
      provider: message.provider,
      path: message.path,
      sizesArray: [],
      sizesString: '',
      keyValues: [],
      parameters: message.parametersMap || [],
    };

    if (Array.isArray(message.sizes) && message.sizes.length > 0) {
      data.sizesArray = message.sizes
        .map((size) => {
          if (Array.isArray(size) && size.length >= 2) {
            return [parseInt(size[0], 10), parseInt(size[1], 10)];
          } else if (typeof size === 'string' && size.includes('x')) {
            const [width, height] = size
              .split('x')
              .map((dim) => parseInt(dim, 10));
            return [width, height];
          }
          return null;
        })
        .filter(Boolean); // Filter out null values

      data.sizesString = data.sizesArray
        .map((size) => `${size[0]}x${size[1]}`)
        .join('|');
    }

    if (Array.isArray(message.keyValues) && message.keyValues.length > 0) {
      data.keyValues = message.keyValues
        .map((kv) => {
          if (typeof kv === 'object' && kv.key && kv.value) {
            return {
              key: kv.key,
              value: kv.value,
            };
          } else if (typeof kv === 'string' && kv.includes('=')) {
            const [key, value] = kv.split('=');
            return {
              key: key.trim(),
              value: value ? value.trim() : '',
            };
          }
          return null;
        })
        .filter(Boolean); // Filter out null values
    }

    return new NextRefresh(data);
  }
}
