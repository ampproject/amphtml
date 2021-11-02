import {
  ACTION_ENUM,
  STATE_PROPERTY_ENUM,
  getStoreService,
} from './amp-story-store-service';
import {ANALYTICS_VARIABLE_ENUM, getVariableService} from './variable-service';
import {dev, user} from '#utils/log';
import {dict} from '#core/types/object';

/** @type {string} */
const TAG = 'amp-story-viewer-messaging-handler';

/** @enum {number} */
const DATA_SOURCES_ENUM = {
  STORE_SERVICE: 0,
  VARIABLE_SERVICE: 2,
};

/**
 * @typedef {{
 *   dataSource: !DataSources,
 *   property: (!STATE_PROPERTY_ENUM|!ANALYTICS_VARIABLE_ENUM)
 * }}
 */
let GetStateConfigurationDef;

/** @enum {!GetStateConfigurationDef} */
const GET_STATE_CONFIGURATIONS_ENUM = {
  'CURRENT_PAGE_ID': {
    dataSource: DATA_SOURCES_ENUM.STORE_SERVICE,
    property: STATE_PROPERTY_ENUM.CURRENT_PAGE_ID,
  },
  'EDUCATION_STATE': {
    dataSource: DATA_SOURCES_ENUM.STORE_SERVICE,
    property: STATE_PROPERTY_ENUM.EDUCATION_STATE,
  },
  'MUTED_STATE': {
    dataSource: DATA_SOURCES_ENUM.STORE_SERVICE,
    property: STATE_PROPERTY_ENUM.MUTED_STATE,
  },
  'PAGE_ATTACHMENT_STATE': {
    dataSource: DATA_SOURCES_ENUM.STORE_SERVICE,
    property: STATE_PROPERTY_ENUM.PAGE_ATTACHMENT_STATE,
  },
  'UI_STATE': {
    dataSource: DATA_SOURCES_ENUM.STORE_SERVICE,
    property: STATE_PROPERTY_ENUM.UI_STATE,
  },
  'STORY_PROGRESS': {
    dataSource: DATA_SOURCES_ENUM.VARIABLE_SERVICE,
    property: ANALYTICS_VARIABLE_ENUM.STORY_PROGRESS,
  },
};

/** @typedef {{action: !ACTION_ENUM, isValueValid: function(*):boolean}} */
let SetStateConfigurationDef;

/** @enum {!SetStateConfigurationDef} */
const SET_STATE_CONFIGURATIONS_ENUM = {
  'MUTED_STATE': {
    action: ACTION_ENUM.TOGGLE_MUTED,
    isValueValid: (value) => typeof value === 'boolean',
  },
};

/**
 * Viewer messaging handler.
 */
export class AmpStoryViewerMessagingHandler {
  /**
   * @param {!Window} win
   * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
   */
  constructor(win, viewer) {
    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    /** @private @const {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(win);

    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;
  }

  /**
   * @public
   */
  startListening() {
    this.viewer_.onMessageRespond('getDocumentState', (data) =>
      this.onGetDocumentState_(data)
    );
    this.viewer_.onMessage('onDocumentState', (data) =>
      this.onOnDocumentState_(data)
    );
    this.viewer_.onMessageRespond('setDocumentState', (data) =>
      this.onSetDocumentState_(data)
    );
    this.viewer_.onMessageRespond('customDocumentUI', (data) =>
      this.onCustomDocumentUI_(data)
    );
  }

  /**
   * @param {string} eventType
   * @param {?JsonObject|string|undefined} data
   * @param {boolean=} cancelUnsent
   */
  send(eventType, data, cancelUnsent = false) {
    this.viewer_.sendMessage(eventType, data, cancelUnsent);
  }

  /**
   * Handles 'getDocumentState' viewer messages.
   * @param {!Object=} data
   * @return {!Promise}
   * @private
   */
  onGetDocumentState_(data = {}) {
    const {state} = data;
    const config = GET_STATE_CONFIGURATIONS_ENUM[state];

    if (!config) {
      return Promise.reject(`Invalid 'state' parameter`);
    }

    let value;

    switch (config.dataSource) {
      case DATA_SOURCES_ENUM.STORE_SERVICE:
        value = this.storeService_.get(config.property);
        break;
      case DATA_SOURCES_ENUM.VARIABLE_SERVICE:
        value = this.variableService_.get()[config.property];
        break;
      default:
        dev().error(TAG, 'Unknown data source %s.', config.dataSource);
        break;
    }

    return Promise.resolve({state, value});
  }

  /**
   * Handles 'onDocumentState' viewer messages.
   * @param {!Object=} data
   * @private
   */
  onOnDocumentState_(data = {}) {
    const {state} = data;
    const config = GET_STATE_CONFIGURATIONS_ENUM[state];

    if (!config) {
      user().error(TAG, `Invalid 'state' parameter`);
      return;
    }

    this.storeService_.subscribe(config.property, (value) => {
      this.viewer_.sendMessage(
        'documentStateUpdate',
        dict({'state': state, 'value': value})
      );
    });
  }

  /**
   * Handles 'setDocumentState' viewer messages.
   * @param {!Object=} data
   * @return {!Promise<!Object|undefined>}
   * @private
   */
  onSetDocumentState_(data = {}) {
    const {state, value} = data;
    const config = SET_STATE_CONFIGURATIONS_ENUM[state];

    if (!config) {
      return Promise.reject(`Invalid 'state' parameter`);
    }

    if (!config.isValueValid(value)) {
      return Promise.reject(`Invalid 'value' parameter`);
    }

    this.storeService_.dispatch(config.action, value);

    return Promise.resolve({state, value});
  }

  /**
   * Handles 'customDocumentUI' viewer messages.
   * @param {!Object} data
   * @private
   */
  onCustomDocumentUI_(data) {
    this.storeService_.dispatch(
      ACTION_ENUM.SET_VIEWER_CUSTOM_CONTROLS,
      data.controls
    );
  }
}
