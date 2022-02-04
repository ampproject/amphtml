import {loadScript, validateData, writeScript} from '#3p/3p';

import {setStyles} from '#core/dom/style';

const APPNEXUS_AST_URL = 'https://acdn.adnxs.com/ast/ast.js';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function appnexus(global, data) {
  const args = [];
  args.push('size=' + data.width + 'x' + data.height);
  if (data.tagid) {
    validateData(data, ['tagid']);
    args.push('id=' + encodeURIComponent(data.tagid));
    writeScript(global, constructTtj(args));
    return;
  } else if (data.member && data.code) {
    validateData(data, ['member', 'code']);
    args.push('member=' + encodeURIComponent(data.member));
    args.push('inv_code=' + encodeURIComponent(data.code));
    writeScript(global, constructTtj(args));
    return;
  }

  /**
   * Construct the TTJ URL.
   * Note params should be properly encoded first (use encodeURIComponent);
   * @param  {!Array<string>} args query string params to add to the base URL.
   * @return {string}      Formated TTJ URL.
   */
  function constructTtj(args) {
    let url = 'https://ib.adnxs.com/ttj?';
    for (let i = 0; i < args.length; i++) {
      //append arg to query. Please encode arg first.
      url += args[i] + '&';
    }

    return url;
  }

  appnexusAst(global, data);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function appnexusAst(global, data) {
  validateData(data, ['adUnits']);
  let apntag;
  if (context.isMaster) {
    // in case we are in the master iframe, we load AST
    context.master.apntag = context.master.apntag || {};
    context.master.apntag.anq = context.master.apntag.anq || [];
    apntag = context.master.apntag;

    context.master.adUnitTargetIds = context.master.adUnitTargetIds || [];

    context.master.adUnitTargetIds = data.adUnits.map(
      (adUnit) => adUnit.targetId
    );

    apntag.anq.push(() => {
      if (data.pageOpts) {
        apntag.anq.push(() => {
          //output console information
          apntag.debug = data.debug || false;
          apntag.setPageOpts(data.pageOpts);
        });
      }

      /** @type {!Array} */ (data.adUnits).forEach((adUnit) => {
        apntag.defineTag(adUnit);
      });
    });
    loadScript(global, APPNEXUS_AST_URL, () => {
      apntag.anq.push(() => {
        apntag.loadTags();
      });
    });
  }

  const div = global.document.createElement('div');
  div.setAttribute('id', data.target);
  const divContainer = global.document.getElementById('c');
  if (divContainer) {
    divContainer.appendChild(div);
    setStyles(divContainer, {
      top: '50%',
      left: '50%',
      bottom: '',
      right: '',
      transform: 'translate(-50%, -50%)',
    });
  }

  if (!apntag) {
    apntag = context.master.apntag;
    //preserve a global reference
    /** @type {{showTag: function(string, Object)}} global.apntag */
    global.apntag = context.master.apntag;
  }

  if (!context.isMaster && data.adUnits) {
    const newAddUnits = data.adUnits.filter((adUnit) => {
      return context.master.adUnitTargetIds.indexOf(adUnit.targetId) === -1;
    });
    if (newAddUnits.length) {
      apntag.anq.push(() => {
        /** @type {!Array} */ (newAddUnits).forEach((adUnit) => {
          apntag.defineTag(adUnit);
          context.master.adUnitTargetIds.push(adUnit.targetId);
        });
        apntag.loadTags();
      });
    }
  }

  // check for ad responses received for a slot but before listeners are
  // registered, for example when an above-the-fold ad is scrolled into view
  apntag.anq.push(() => {
    if (typeof apntag.checkAdAvailable === 'function') {
      const getAd = apntag.checkAdAvailable(data.target);
      getAd({resolve: isAdAvailable, reject: context.noContentAvailable});
    }
  });

  apntag.anq.push(() => {
    apntag.onEvent('adAvailable', data.target, isAdAvailable);
    apntag.onEvent('adNoBid', data.target, context.noContentAvailable);
  });

  /**
   * resolve getAd with an available ad object
   *
   * @param {{targetId: string}} adObj
   */
  function isAdAvailable(adObj) {
    global.context.renderStart({width: adObj.width, height: adObj.height});
    global.apntag.showTag(adObj.targetId, global.window);
  }
}
