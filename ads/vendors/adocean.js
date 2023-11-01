import {computeInMasterFrame, validateData, writeScript} from '#3p/3p';

import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';
import {parseJson} from '#core/types/object/json';

/**
 * @const {{[key: string]: string}}
 */
const ADO_JS_PATHS = {
  'sync': '/files/js/ado.js',
  'buffered': '/files/js/ado.FIF.test.js',
};

/**
 * @param {string} str
 * @return {boolean}
 */
function isFalseString(str) {
  return /^(?:false|off)?$/i.test(str);
}

/**
 * @param {string} mode
 * @param {!Window} global
 * @param {object} consent
 */
function setupAdoConfig(mode, global, consent) {
  if (global['ado']) {
    const config = {
      mode: mode == 'sync' ? 'old' : 'new',
      protocol: 'https:',
      fif: {
        enabled: mode != 'sync',
      },
      consent: consent.accepted,
      gdprApplies: consent.gdprApplies,
      gdprConsent: consent.consentString,
    };

    global['ado']['config'](config);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function setupPreview(global, data) {
  if (global.ado && data.aoPreview && !isFalseString(data.aoPreview)) {
    global.ado.preview({
      enabled: true,
    });
  }
}

/**
 * @param {string} str
 * @return {Object|undefined}
 * @throws {SyntaxError}
 */
function parseJSONObj(str) {
  return str.match(/^\s*{/) ? parseJson(str) : undefined;
}

/**
 * @param {string} keys
 * @return {string|undefined}
 */
function buildKeys(keys) {
  return keys || undefined;
}

/**
 * @param {string} vars
 * @return {Object|string|undefined}
 */
function buildVars(vars) {
  try {
    return parseJSONObj(vars);
  } catch (e) {
    return vars || undefined;
  }
}

/**
 * @param {string} clusters
 * @return {Object|undefined}
 */
function buildClusters(clusters) {
  try {
    return parseJSONObj(clusters);
  } catch (e) {
    // return undefined
  }
}

/** @type {number} */
let runSyncCount = 0;

/**
 * @param {!Window} global
 * @param {function()} cb
 */
function runSync(global, cb) {
  global['__aoPrivFnct' + ++runSyncCount] = cb;
  global.document.write(
    // eslint-disable-next-line no-useless-concat
    '<' + 'script>__aoPrivFnct' + runSyncCount + '();<' + '/script>'
  );
}

/**
 * @param {string} mode
 * @param {!Window} global
 * @param {!Object} data
 */
function appendPlacement(mode, global, data) {
  const doc = global.document;
  const placement = doc.createElement('div');
  placement.id = data['aoId'];

  const dom = doc.getElementById('c');
  dom.appendChild(placement);

  const config = {
    id: data['aoId'],
    server: data['aoEmitter'],
    keys: buildKeys(data['aoKeys']),
    vars: buildVars(data['aoVars']),
    clusters: buildClusters(data['aoClusters']),
  };

  if (global.ado) {
    if (mode == 'sync') {
      runSync(global, function () {
        global['ado']['placement'](config);
      });

      runSync(global, function () {
        if (!config['_hasAd']) {
          window.context.noContentAvailable();
        }
      });
    } else {
      global['ado']['onAd'](data['aoId'], function (isAd) {
        if (!isAd) {
          window.context.noContentAvailable();
        }
      });
      global['ado']['placement'](config);
    }
  }
}

/**
 * @param {string} masterId
 * @param {!Object} data
 * @param {!Window} global
 * @param {Function} callback
 */
function executeMaster(masterId, data, global, callback) {
  const config = {
    id: masterId,
    server: data['aoEmitter'],
    keys: buildKeys(data['aoKeys']),
    vars: buildVars(data['aoVars']),
    clusters: buildClusters(data['aoClusters']),
  };

  if (global['ado']) {
    global['ado']['onEmit']((masterId, instanceId, codes) => {
      callback(codes);
    });

    global['ado']['master'](config);
  }
}

/**
 *
 * @param {string} masterId
 * @param {!Object} data
 * @param {!Window} global
 * @param {Function} callback
 */
function requestCodes(masterId, data, global, callback) {
  const slaveId = data['aoId'];

  computeInMasterFrame(
    global,
    'ao-master-exec',
    (done) => {
      executeMaster(masterId, data, global, (codes) => done(codes));
    },
    (codes) => {
      const creative = codes[slaveId];
      if (codes[slaveId + '_second_phase']) {
        creative['code'] += '\n' + codes[slaveId + '_second_phase']['code'];
      }
      callback(creative);
    }
  );
}

class AdoBuffer {
  /**
   *
   * @param {object} container
   * @param {!Window} global
   */
  constructor(container, global) {
    this.container = container;
    this.global = global;
    this.callback = null;
  }

  /**
   *
   * @param {Function} callback
   */
  render(callback) {
    this.callback = callback;

    if (this.global.document.readyState === 'loading') {
      this.global.document.addEventListener(
        'DOMContentLoaded',
        this._init.bind(this)
      );
    } else {
      this._init();
    }
  }

  /**
   */
  _init() {
    const ado = this.global['ado'];
    const gao = this.global['gao'];

    if (ado['busy'] || (typeof gao !== 'undefined' && gao['busy'])) {
      ado['queue'].unshift(this._execute.bind(this));
    } else {
      this._execute();
    }
  }

  /**
   */
  _execute() {
    const adoElement = new this.global['AdoElement']({
      'id': this.container.id,
      'orgId': this.container.id,
      'clearId': this.container.id,
      '_isBuffer': true,
    });
    this.global['AdoElems'] = this.global['AdoElems'] || [];
    this.global['AdoElems'].push(adoElement);
    adoElement['getDOMElement']();
    adoElement['initBuffor']();
    this.global['ado']['elems'][this.container.id] = adoElement;

    this.callback(adoElement);

    adoElement['rewriteBuffor']();
    adoElement['dispatch']();
  }
}

/**
 *
 * @param {string} slaveId
 * @param {!Object} config
 * @param {!Window} global
 */
function executeSlave(slaveId, config, global) {
  const doc = global.document;
  const placement = doc.createElement('div');
  placement['id'] = slaveId;

  const dom = doc.getElementById('c');
  dom.appendChild(placement);

  if (global['ado']) {
    if (!config || config['isEmpty']) {
      global.context.noContentAvailable();
    } else {
      const buffer = new AdoBuffer(placement, global);
      buffer.render(() => {
        new Function(config['sendHitsDef'] + config['code'])();
      });
    }
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adocean(global, data) {
  validateData(
    data,
    ['aoEmitter', 'aoId'],
    ['aoMode', 'aoPreview', 'aoKeys', 'aoVars', 'aoClusters', 'aoMaster']
  );

  const masterId = data['aoMaster'];
  const mode = data['aoMode'] !== 'sync' || masterId ? 'buffered' : 'sync';
  const adoUrl = 'https://' + data['aoEmitter'] + ADO_JS_PATHS[mode];
  const ctx = global.context;

  const consent = {
    accepted:
      /* INSUFFICIENT and UNKNOWN should be treated as INSUFFICIENT
       * not defined states should be treated as INSUFFICIENT */
      ctx.initialConsentState ===
        null /* tags without data-block-on-consent */ ||
      ctx.initialConsentState === CONSENT_POLICY_STATE.SUFFICIENT ||
      ctx.initialConsentState === CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
    gdprApplies:
      typeof ctx.initialConsentMetadata?.gdprApplies === 'boolean'
        ? ctx.initialConsentMetadata.gdprApplies
        : undefined,
    consentString:
      ctx.initialConsentMetadata?.consentStringType ===
      CONSENT_STRING_TYPE.TCF_V2
        ? ctx.initialConsentValue
        : undefined,
  };

  writeScript(global, adoUrl, () => {
    setupAdoConfig(mode, global, consent);
    setupPreview(global, data);

    if (masterId) {
      const ado = global['ado'];
      if (ado && ado['features'] && ado['features']['passback']) {
        ado['features']['passback'] = false;
      }

      requestCodes(masterId, data, global, (codes) => {
        executeSlave(data['aoId'], codes, global);
      });
    } else {
      appendPlacement(mode, global, data);
    }
  });
}
