import {loadScript, validateData} from '#3p/3p';

import {setStyle, setStyles} from '#core/dom/style';

// Required/optional parameters for legacy/standard builds are consolidated here
// to provide a more managable way of interacting with them. Most of the legacy
// optional attributes are deprecated but there's still tags live that might have
// them so they'll stay in this list to pass validation
const options = {
  endpoints: {
    legacy:
      'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js',
    standard: 'https://assets.revcontent.com/master/delivery.js',
    evergreen: 'https://delivery.revcontent.com/',
  },
  params: {
    legacy: {
      required: ['id', 'height'],
      optional: [
        'wrapper',
        'subIds',
        'revcontent',
        'env',
        'loadscript',
        'api',
        'key',
        'ssl',
        'adxw',
        'adxh',
        'rows',
        'cols',
        'domain',
        'source',
        'testing',
        'endpoint',
        'publisher',
        'branding',
        'font',
        'css',
        'sizer',
        'debug',
        'ampcreative',
        'gdpr',
        'gdprConsent',
        'usPrivacy',
        'gamEnabled',
      ],
    },
    evergreen: {
      required: ['widgetId', 'pubId', 'height'],
      optional: ['endpoint'],
    },
  },
};

/**
 * Helper function to get endpoint string based on how tag is configured.
 *
 * @param {!Object} data
 * @return {string}
 */
function getEndpoint(data) {
  if (typeof data.revcontent !== 'undefined') {
    if (typeof data.env === 'undefined') {
      return options.endpoints.standard;
    }
    if (data.env == 'dev') {
      return 'https://preact.revcontent.dev/delivery.js';
    }
    return `https://assets.revcontent.com/${data.env}/delivery.js`;
  }

  if (
    typeof data.placementType !== 'undefined' &&
    data.placementType === 'evergreen'
  ) {
    if (typeof data.devUrl !== 'undefined') {
      return data.devUrl;
    }

    return `${options.endpoints.evergreen}/${data.pubId}/${data.widgetId}/widget.js`;
  }

  return options.endpoints.legacy;
}

/**
 * Internal handler for calling requestResize
 * @param {!Window} global
 * @param {!Element} container
 * @param {number} height
 */
function handleResize(global, container, height) {
  global.context
    .requestResize(undefined, height, true)
    .then(() => {
      handleResizeSuccess(global);
      //handleResizeDenied(global, container, height);
    })
    .catch(() => {
      handleResizeDenied(global, container, height);
    });
}

/**
 * Helper function for handling denied resize requests. Creates an overflow element if one does not exist
 * @param {!Window} global
 * @param {!Element} container
 * @param {number} height
 */
function handleResizeDenied(global, container, height) {
  const overflowElement = global.document.getElementById('overflow');

  if (overflowElement) {
    setStyle(overflowElement, 'display', '');
  } else {
    createOverflowElement(global, container, height);
  }
}

/**
 * Helper function for handling successful resize requests
 * @param {!Window} global
 */
function handleResizeSuccess(global) {
  const overflow = global.document.getElementById('overflow');
  if (overflow) {
    setStyle(overflow, 'display', 'none');
  }
}

/**
 * Helper function to create an overflow element if one doesn't exist
 * @param {!Window} global
 * @param {!Element} container
 * @param {number} height
 */
function createOverflowElement(global, container, height) {
  const overflow = global.document.createElement('div');
  overflow.id = 'overflow';

  overflow.addEventListener('click', () => {
    handleResize(global, container, height);
  });

  setStyles(overflow, {
    position: 'absolute',
    height: `60px`,
    bottom: '0',
    left: '0',
    right: '0',
    background: 'green',
    cursor: 'pointer',
  });

  const indicator = `<svg id="indicator" fill="#ffffff" width="60" height="60" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg"><path d="M16.939 7.939 12 12.879l-4.939-4.94-2.122 2.122L12 17.121l7.061-7.06z"></path></svg>`;

  const chevron = global.document.createElement('div');
  setStyles(chevron, {
    width: '40px',
    height: '40px',
    margin: '0 auto',
    display: 'block',
  });

  chevron./*OK*/ innerHTML = indicator;
  overflow.appendChild(chevron);
  container.appendChild(overflow);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function revcontent(global, data) {
  global.revcontent = global.revcontent || {
    boundingClientRect: {},
    detectedWidth: 0,
    detectedHeight: 0,
    widgetData: {
      ...data,
    },
    requestedSize: 0,
  };

  const requiredParams = [];
  const optionalParams = [];
  const containerDiv = global.document.getElementById('c');

  if (
    typeof data.placementType !== 'undefined' &&
    data.placementType === 'evergreen'
  ) {
    // Revcontent evergreen builds do not have an explicit group of optional parameters
    // to support configuration flexibility. Add any present attributes that are not
    // part of the required ones to the optional list so tag passes validation.
    const required = options?.params?.evergreen?.required;
    const optional = Object.keys(data).filter((entry) => {
      if (!required.includes(entry)) {
        return entry;
      }
    });

    optional.push(...options?.params?.evergreen?.optional);
    requiredParams.push(...required);
    optionalParams.push(...optional);

    global.context.observeIntersection(function (changes) {
      /** @type {!Array} */ changes.forEach(function (c) {
        if (c.intersectionRect.height) {
          if (global.revcontent?.boundingClientRect !== c.boundingClientRect) {
            Object.assign(
              global.revcontent?.boundingClientRect,
              c.boundingClientRect
            );
          }

          if (c.boundingClientRect.height < global.revcontent.requestedSize) {
            handleResize(global, containerDiv, global.revcontent.requestedSize);
          }
        }
      });
    });
  } else {
    const required = options?.params?.legacy?.required;
    const optional = options?.params?.legacy?.optional;

    requiredParams.push(...required);
    optionalParams.push(...optional);
  }

  const endpoint = getEndpoint(data);
  data.endpoint = data.endpoint ? data.endpoint : 'trends.revcontent.com';

  validateData(data, requiredParams, optionalParams);

  global.data = data;
  loadScript(global, endpoint, () => {
    window.addEventListener('message', (e) => {
      if (
        e.data.source == 'revcontent' &&
        e.data.action == 'RESIZE_AMP_TAG' &&
        typeof e.data.height != 'undefined'
      ) {
        global.revcontent.requestedSize = e.data.height;
        handleResize(global, containerDiv, e.data.height);
      }
    });
  });
}
