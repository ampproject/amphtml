/**
 * Base class for all message types
 */
export class BaseMessage {
  /**
   * @param {string} action - Message action
   * @param {Object=} message - Message content
   */
  constructor(action, message = {}) {
    /** @public {string} */
    this.action = action;

    /** @public {Object} */
    this.message = message;
  }

  /**
   * Serializes the message to JSON
   * @return {string}
   */
  serialize() {
    return [this.action, JSON.stringify(this.message)];
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
      return new BaseMessage(parsed.action, parsed.message);
    } catch (e) {
      // console /*OK*/
      //   .error('Error parsing message:', e);
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
    this.message = {protocol: 'json', version: 1};
  }

  /**
   * Serializes the message to JSON
   * @return {string}
   */
  serialize() {
    return JSON.stringify(this.message) + '\u001e';
  }
}

/**
 * Application initialization message
 */
export class AppInitMessage extends BaseMessage {
  /**
   * @param {string} lockedId - Locked ID message
   * @param {boolean} newVisitor - New Visitor
   * @param {boolean} extension - Extension Status
   * @param {string} url - Url
   * @param {boolean=} reconnect - Reconnect flag
   */
  constructor(lockedId, newVisitor, extension, url = {}, reconnect = false) {
    super('app-init', {
      lockedId,
      newVisitor,
      extension,
      url,
      reconnect,
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
   * @param {object} iabTaxonomy - IAB Taxonomy
   * @param {boolean} status - Status of the app
   */
  constructor(sellerId, ivm, mobile, keyValues, iabTaxonomy, status) {
    super('app-init-response', {
      sellerId,
      ivm,
      mobile,
      keyValues,
      iabTaxonomy,
      status,
    });
  }
}

/**
 * Unit initialization response message
 */
export class UnitInitResponseMessage extends BaseMessage {
  /**
   * @param {string} code - Ad unit code identifier
   * @param {string} adUnitId - Ad unit ID
   */
  constructor(code, adUnitId) {
    super('unit-init-response', {
      code,
      adUnitId,
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
   * Creates a message of the appropriate action from raw message
   * @param {string} action - Message action
   * @param {object} message - Message message
   * @return {BaseMessage}
   */
  static createMessage(action, message) {
    message = JSON.parse(message);
    switch (action) {
      case 'app-init-response':
        return new AppInitResponseMessage(
          message.sellerId || 'unknown',
          message.ivm ? 1 : 0,
          message.mobile ? 1 : 0,
          message.keyValues || {},
          message.iabTaxonomy || {},
          message.status || false
        );

      case 'unit-init-response':
        return new UnitInitResponseMessage(
          message.code || 'unknown',
          message.adunitId || 'unknown'
        );

      case 'unit-waterfall':
        return new UnitWaterfallMessage(
          message.code || 'unknown',
          message.provider || 'unknown',
          message.path || '',
          message.sizes || [],
          message.keyValues || [],
          message.parametersMap || []
        );
      default:
        return new BaseMessage(action, message);
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
      return this.createMessage(parsed.action, parsed.message);
    } catch (e) {
      // console /*OK*/
      //   .error('Error parsing message:', e);
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
      'waterfall': unitWaterfallHandler,
      'disconnect': null,
      'connect': null,
    };
  }

  /**
   * Processes a message
   * @param {string} raw
   * @return {boolean} Whether the message was handled
   */
  processMessage(raw) {
    const messages = raw.split('\u001e').filter(Boolean);
    const parsedMessages = messages.map((m) => JSON.parse(m));

    console /*Ok*/
      .log('total messages:', parsedMessages.length);

    parsedMessages.forEach((message) => {
      const messageObj = MessageFactory.fromJson(message.arguments);
      if (messageObj) {
        if (!messageObj) {
          return false;
        }

        console /*OK*/
          .log('[iat-debug] Message:', messageObj.action, messageObj.message);

        const handler = this.handlers_[messageObj.action];
        if (handler && typeof handler === 'function') {
          handler(messageObj.message);
          return true;
        }

        return false;
      }
    });
  }
}
