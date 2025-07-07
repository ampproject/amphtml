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
   * @param {number} lastTimestamp - Last Time Stamp
   * @param {boolean} extension - Extension Status
   * @param {boolean=} reconnect - Reconnect flag
   */
  constructor(
    lockedId,
    newVisitor,
    lastTimestamp,
    extension,
    reconnect = false
  ) {
    super('app-init', {
      lockedId,
      newVisitor,
      lastTimeStamp: lastTimestamp,
      extension,
      reconnect,
    });
  }
}

/**
 * Ad unit initialization message
 */
export class UnitInitMessage extends BaseMessage {
  /**
   * @param {object} params
   * @param {string} params.code - Generated Ad Unit ID
   * @param {string} params.creativeId - Creative ID
   * @param {Array<object>} params.keyValues - Key values for targeting
   * @param {string} params.lineItemId - Line Item ID
   * @param {number=} params.parentMawId - Parent MAW ID
   * @param {number=} params.passback - Passback
   * @param {string} params.path - Path of the Ad Unit
   * @param {string} params.position - Waterfall Position
   * @param {boolean=} params.reconnect - reconnect
   * @param {string} params.servedSize - Served Size
   * @param {Array<string>} params.sizes - Available sizes
   * @param {boolean} params.isHouseDemand - Is House Demand
   */
  constructor({
    code,
    creativeId,
    isHouseDemand,
    keyValues,
    lineItemId,
    parentMawId = 0,
    passback = false,
    path,
    position,
    reconnect = false,
    servedSize,
    sizes,
  }) {
    super('unit-init', {
      code,
      path,
      lineItemId,
      creativeId,
      servedSize,
      sizes,
      keyValues,
      position,
      parentMawId,
      passback,
      reconnect,
      isHouseDemand,
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
export class PageStatusMessage extends BaseMessage {
  /**
   * @param {number} Engagement - Engagement status
   * @param {number} DocumentVisible - Whether the page is visible
   */
  constructor(Engagement = {}, DocumentVisible = {}) {
    super('page-status', {
      Engagement,
      DocumentVisible,
    });
  }
}

/**
 * Application initialization response message
 */
export class AppInitResponseMessage extends BaseMessage {
  /**
   * @param {object} params - The parameters for the message.
   * @param {number=} params.applicationId
   * @param {string=} params.countryCode
   * @param {boolean=} params.ivm - IntelliSense Viewability Mode.
   * @param {object=} params.requiredKeys - Accepted Key values for targeting.
   * @param {object=} params.iabTaxonomy - IAB Taxonomy.
   * @param {string=} params.reason - Reason for the status.
   * @param {number=} params.sectionId - Section ID for the app.
   * @param {string=} params.serverTimestamp - The Server Timestamp
   * @param {number=} params.status - Status of the app.
   */
  constructor({
    applicationId,
    countryCode,
    iabTaxonomy,
    ivm,
    reason,
    requiredKeys,
    sectionId,
    serverTimestamp,
    status,
  }) {
    const messagePayload = {};

    if (applicationId !== undefined) {
      messagePayload.applicationId = applicationId;
    }
    if (countryCode !== undefined) {
      messagePayload.countryCode = countryCode;
    }
    if (ivm !== undefined) {
      messagePayload.ivm = ivm;
    }
    if (requiredKeys !== undefined) {
      messagePayload.requiredKeys = requiredKeys;
    }
    if (iabTaxonomy !== undefined) {
      messagePayload.iabTaxonomy = iabTaxonomy;
    }
    if (status !== undefined) {
      messagePayload.status = status;
    }
    if (reason !== undefined) {
      messagePayload.reason = reason;
    }
    if (sectionId !== undefined) {
      messagePayload.sectionId = sectionId;
    }
    if (serverTimestamp !== undefined) {
      messagePayload.serverTimestamp = serverTimestamp;
    }

    super('app-init-response', messagePayload);
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
   * @param {object} params The parameters for the message.
   * @param {string} params.unitCode The unique code for the ad unit.
   * @param {!Array<!WaterfallEntry>} params.entries The waterfall entries for different providers.
   * @param {{[key: string]: string}=} params.commonKeyValues Key-values to be applied to all entries.
   */
  constructor({commonKeyValues = {}, entries = [], unitCode}) {
    super('unit-waterfall', {
      unitCode,
      entries,
      commonKeyValues,
    });
  }
}

/**
 * Represents a single entry in an ad unit's waterfall.
 */
export class WaterfallEntry {
  /**
   * @param {object} params The parameters for the entry.
   * @param {number=} params.position The position of this entry in the waterfall.
   * @param {string=} params.provider The ad provider for this entry (e.g., 'pgam').
   * @param {string=} params.path The ad unit path for this provider.
   * @param {!Array<!Array<number>>=} params.sizes The ad sizes for this entry.
   * @param {{[key: string]: (string|Array<string>)}=} params.keyValues Specific key-values for this entry.
   * @param {{[key: string]: Object}=} params.vendors Vendor-specific data (e.g., for prebid).
   */
  constructor({
    keyValues = {},
    path = '',
    position = 0,
    provider = '',
    sizes = [],
    vendors = {},
  } = {}) {
    /** @public {number} */
    this.position = position;

    /** @public {string} */
    this.provider = provider;

    /** @public {string} */
    this.path = path;

    /** @public {!Array<!Array<number>>} */
    this.sizes = sizes;

    /** @public {!Object<string, string|!Array<string>>} */
    this.keyValues = keyValues;

    /** @public {!Object<string, !Object>} */
    this.vendors = vendors;
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
        return new AppInitResponseMessage(message);

      case 'unit-init-response':
        return new UnitInitResponseMessage(
          message.code || 'unknown',
          message.adunitId || 'unknown'
        );

      case 'unit-waterfall':
        const entries = (message.entries || []).map(
          (entryData) => new WaterfallEntry(entryData)
        );
        return new UnitWaterfallMessage({
          unitCode: message.unitCode || 'unknown',
          entries,
          commonKeyValues: message.commonKeyValues || {},
        });
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
   * @param {Function=} options.disconnectHandler - Handler for disconnect messages
   */
  constructor({
    appInitHandler = null,
    disconnectHandler = null,
    unitInitHandler = null,
    unitWaterfallHandler = null,
  } = {}) {
    /** @private {Object<string, Function>} */
    this.handlers_ = {
      'app-init-response': appInitHandler,
      'unit-init-response': unitInitHandler,
      'waterfall': unitWaterfallHandler,
      'disconnect': disconnectHandler,
    };
  }

  /**
   * Processes a pre-parsed message object.
   * @param {?BaseMessage} messageObj The message object to handle.
   * @return {boolean} Whether the message was handled.
   */
  processMessage(messageObj) {
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
}
