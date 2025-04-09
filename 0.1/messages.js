/**
 * Base class for all message types
 */
export class BaseMessage {
  /**
   * @param {string} type - Message type
   * @param {Object=} data - Message data
   */
  constructor(type, data = {}) {
    /** @public {string} */
    this.type = type;

    /** @public {Object} */
    this.data = data;
  }

  /**
   * Serializes the message to JSON
   * @return {string}
   */
  serialize() {
    return [this.type, JSON.stringify(this.data)];
  }

  /**
   * Creates a message from JSON
   * @param {string} json - JSON string
   * @return {?BaseMessage}
   * @static
   */
  static fromJson(json) {
    try {
      const parsed = JSON.parse(json);
      return new BaseMessage(parsed.type, parsed.data);
    } catch (e) {
      console /*OK*/
        .error('Error parsing message:', e);
      return null;
    }
  }
}

/**
 * Handshake message for initial communication setup
 */
export class HandshakeMessage {
  /**
   *
   */
  constructor() {
    /** @public {Object} */
    this.data = {protocol: 'json', version: 1};
  }

  /**
   * Serializes the message to JSON
   * @return {string}
   */
  serialize() {
    return JSON.stringify(this.data) + '\u001e';
  }
}

/**
 * Application initialization message
 */
export class AppInitMessage extends BaseMessage {
  /**
   * @param {string} lockedId - Locked ID data
   * @param {boolean} newVisitor - New Visitor
   * @param {boolean} extension - Extension Status
   * @param {string} url - Url
   */
  constructor(lockedId, newVisitor, extension, url = {}) {
    super('app-init', {
      lockedId,
      newVisitor,
      extension,
      url,
    });
  }
}

/**
 * Ad unit initialization message
 */
export class UnitInitMessage extends BaseMessage {
  /**
   * @param {string} code - Generated Ad Unit ID
   * @param {string} path - Path of the Ad Unit
   * @param {string} lineItemId - Line Item ID
   * @param {string} creativeId - Creative ID
   * @param {string} servedSize - Served Size
   * @param {Array<string>} sizes - Available sizes
   * @param {Array<object>} keyValues - Key values for targeting
   * @param {string} provider - Provider name
   * @param {number} parentMawId - Parent MAW ID
   */
  constructor(
    code,
    path,
    lineItemId,
    creativeId,
    servedSize,
    sizes,
    keyValues,
    provider,
    parentMawId = {}
  ) {
    super('unit-init', {
      code,
      path,
      lineItemId,
      creativeId,
      servedSize,
      sizes,
      keyValues,
      provider,
      parentMawId,
    });
  }
}

/**
 * Ad unit snapshot message for reporting current state
 */
export class UnitSnapshotMessage extends BaseMessage {
  /**
   * @param {string} code - Ad unit ID
   * @param {number} visible -  Whether ad is considered visible
   */
  constructor(code, visible = {}) {
    super('unit-snapshot', {
      code,
      visible,
    });
  }
}

/**
 * Application status update message
 */
export class AppStatusMessage extends BaseMessage {
  /**
   * @param {boolean} isEngaged - Whether the user is active
   */
  constructor(isEngaged = {}) {
    super('page-status', {
      isEngaged,
    });
  }
}

/**
 * Application initialization response message
 */
export class AppInitResponseMessage extends BaseMessage {
  /**
   * @param {string} sellerId - Seller ID
   * @param {number} ivm - IntelliSense Viewability Mode - Experimental feature that uses an alternative method to control engagement and viewability (default is false)
   * @param {number} mobile - Is Mobile
   * @param {object} keyValues - Accepted Key values for targeting
   */
  constructor(sellerId, ivm, mobile, keyValues) {
    super('app-init-response', {
      sellerId,
      ivm,
      mobile,
      keyValues,
    });
  }
}

/**
 * Unit initialization response message
 */
export class UnitInitResponseMessage extends BaseMessage {
  /**
   * @param {string} code - Ad unit code identifier
   * @param {string} adunitId - Ad unit ID
   */
  constructor(code, adunitId) {
    super('unit-init-response', {
      code,
      adunitId,
    });
  }
}

/**
 * Unit Waterfall message
 */
export class UnitWaterfallMessage extends BaseMessage {
  /**
   * @param {string} code - Ad unit code identifier
   * @param {string} provider - Provider name
   * @param {string} path - Path of the Ad Unit
   * @param {Array<Array<number>>} sizes - Available sizes
   * @param {Array<object>} keyValues - Key values for targeting
   * @param {Array<string>} parametersMap - Parameters map
   */
  constructor(code, provider, path, sizes, keyValues, parametersMap) {
    super('unit-waterfall', {
      code,
      provider,
      path,
      sizes,
      keyValues,
      parametersMap,
    });
  }
}

/**
 * Factory class to create appropriate message instances
 */
export class MessageFactory {
  /**
   * Creates a message of the appropriate type from raw data
   * @param {string} type - Message type
   * @param {object} data - Message data
   * @return {BaseMessage}
   */
  static createMessage(type, data) {
    switch (type) {
      case 'app-init-response':
        return new AppInitResponseMessage(
          data.code || 'unknown',
          data.ivm ? 1 : 0,
          data.mobile ? 1 : 0,
          data.keyValues || {}
        );

      case 'unit-init-response':
        return new UnitInitResponseMessage(
          data.code || 'unknown',
          data.adunitId || 'unknown'
        );

      case 'unit-waterfall':
        return new UnitWaterfallMessage(
          data.code || 'unknown',
          data.provider || 'unknown',
          data.path || '',
          data.sizes || [],
          data.keyValues || [],
          data.parametersMap || []
        );
      default:
        return new BaseMessage(type, data);
    }
  }

  /**
   * Creates a message from a JSON string
   * @param {string} json - JSON string
   * @return {?BaseMessage}
   */
  static fromJson(json) {
    try {
      const parsed = JSON.parse(json);
      return this.createMessage(parsed.type, parsed.data);
    } catch (e) {
      console /*OK*/
        .error('Error parsing message:', e);
      return null;
    }
  }
}

/**
 * Message handler class to process incoming messages
 */
export class MessageHandler {
  /**
   * @param {Object=} options - Options object
   * @param {Function=} options.appInitHandler - Handler for app init messages
   * @param {Function=} options.unitInitHandler - Handler for unit init messages
   * @param {Function=} options.unitWaterfallHandler - Handler for unit waterfall messages
   */
  constructor({
    appInitHandler = null,
    unitInitHandler = null,
    unitWaterfallHandler = null,
  } = {}) {
    /** @private {Object<string, Function>} */
    this.handlers_ = {
      'app-init-response': appInitHandler,
      'unit-init-response': unitInitHandler,
      'unit-waterfall': unitWaterfallHandler,
    };
  }

  /**
   * Processes a message
   * @param {BaseMessage} message - Message to process
   * @return {boolean} Whether the message was handled
   */
  processMessage(message) {
    message = message.replace(/[^\x20-\x7E]/g, '');
    const messageObj = MessageFactory.fromJson(message);

    if (!messageObj) {
      return false;
    }

    const handler = this.handlers_[messageObj.type];
    if (handler && typeof handler === 'function') {
      handler(messageObj);
      return true;
    }

    return false;
  }

  /**
   * Registers a handler for a specific message type
   * @param {string} type - Message type
   * @param {Function} handler - Message handler
   */
  registerHandler(type, handler) {
    this.handlers_[type] = handler;
  }
}
