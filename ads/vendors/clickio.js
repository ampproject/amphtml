import {loadScript, validateData} from '#3p/3p';

import {setStyles} from '#core/dom/style';

import {dev, user} from '#utils/log';

const CLICKIO_LOG_TAG = 'Clickio';
const CLICKIO_GLOBAL_NAME = '__lxG__';
const CLICKIO_GLOBAL_COMMON_NAME = '__lxGc__';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function clickio(global, data) {
  if (data.siteId && data.unitId) {
    validateData(data, ['siteId', 'unitId']);

    const divContainer = global.document.getElementById('c');
    const div = global.document.createElement('div');

    div.setAttribute('id', Math.round(Math.random() * 1e8).toString(36));

    if (divContainer) {
      // clickio global
      global[CLICKIO_GLOBAL_NAME] = global[CLICKIO_GLOBAL_NAME] || {};

      const clickioGlobal = global[CLICKIO_GLOBAL_NAME];

      // base config
      clickioGlobal.ampMode = context.isMaster ? 1 : 2;
      clickioGlobal.pageUrl = global.context.location.href;
      clickioGlobal.sendPageUrl = true;

      // ad container
      divContainer.appendChild(div);
      setStyles(divContainer, {
        top: '50%',
        left: '50%',
        bottom: '',
        right: '',
        transform: 'translate(-50%, -50%)',
      });

      // ad code
      (global[CLICKIO_GLOBAL_COMMON_NAME] = global[
        CLICKIO_GLOBAL_COMMON_NAME
      ] || {'s': {}, 'b': 0}).cmd =
        global[CLICKIO_GLOBAL_COMMON_NAME].cmd || [];
      global[CLICKIO_GLOBAL_COMMON_NAME].cmd.push(function () {
        global[CLICKIO_GLOBAL_COMMON_NAME].display(
          div.id,
          '_' + data.siteId,
          '_' + data.unitId,
          data
        );
      });

      // load clickio script
      loadScript(
        global,
        'https://s.clickiocdn.com/t/' + data.siteId + '/360_amp.js'
      );

      // load consent module for master
      if (context.isMaster) {
        // consent module
        if (
          context.initialConsentMetadata !== null &&
          typeof context.initialConsentMetadata === 'object' &&
          context.initialConsentMetadata.gdprApplies &&
          context.initialConsentValue !== ''
        ) {
          clickioGlobal.consent = {
            gdpr: context.initialConsentMetadata.gdprApplies,
            consentString: context.initialConsentValue,
            additionalConsent: context.initialConsentMetadata.additionalConsent,
          };

          // load consent script
          loadScript(
            global,
            'https://s.clickiocdn.com/t/static/amp/consent_amp.js'
          );
        }
      }

      dev().info(
        CLICKIO_LOG_TAG,
        'clickio: running (' + (context.isMaster ? 'master' : 'slave') + ')'
      );
    }
  } else {
    user().error(CLICKIO_LOG_TAG, 'clickio: siteId and unitId are required');
    return;
  }
}
