import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adhese(global, data) {
  validateData(data, ['location', 'format', 'account', 'requestType']);
  let targetParam = '';
  const gctx = global.context;

  if (data['targeting']) {
    const targetList = data['targeting'];
    for (const category in targetList) {
      targetParam += encodeURIComponent(category);
      const targets = targetList[category];
      for (let x = 0; x < targets.length; x++) {
        targetParam +=
          encodeURIComponent(targets[x]) + (targets.length - 1 > x ? ';' : '');
      }
      targetParam += '/';
    }
  }

  if (gctx.consentSharedData) {
    if (
      gctx.consentSharedData.consentStateValue &&
      gctx.consentSharedData.consentStateValue == 'accepted'
    ) {
      targetParam += 'tlall/';
    }
    if (
      gctx.consentSharedData.consentString &&
      gctx.consentSharedData.consentString !== ''
    ) {
      targetParam += 'xt' + gctx.consentSharedData.consentString + '/';
    }
  }

  targetParam += '?t=' + Date.now();
  writeScript(
    window,
    'https://ads-' +
      encodeURIComponent(data['account']) +
      '.adhese.com/' +
      encodeURIComponent(data['requestType']) +
      '/sl' +
      encodeURIComponent(data['location']) +
      encodeURIComponent(data['position']) +
      '-' +
      encodeURIComponent(data['format']) +
      '/' +
      targetParam
  );

  const co = global.document.querySelector('#c');
  co.width = data['width'];
  co.height = data['height'];
  co.addEventListener('adhLoaded', getAdInfo.bind(null, global), false);
}

/**
 * @param {!Window} global
 * @param {!Object} e
 */
function getAdInfo(global, e) {
  if (
    e.detail.isReady &&
    e.detail.width == e.target.width &&
    e.detail.height == e.target.height
  ) {
    global.context.renderStart();
  } else if (
    e.detail.isReady &&
    (e.detail.width != e.target.width || e.detail.height != e.target.height)
  ) {
    global.context.renderStart({
      width: e.detail.width,
      height: e.detail.height,
    });
  } else {
    global.context.noContentAvailable();
  }
}
