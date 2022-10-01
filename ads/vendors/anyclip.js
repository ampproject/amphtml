import {loadScript, validateData} from '#3p/3p';

const requiredParams = ['pubname', 'widgetname'];

const scriptHost = 'player.anyclip.com';
const scriptPath = 'anyclip-widget/lre-widget/prod/v1/src';
const scriptName = 'aclre-amp-loader.js';
const scriptUrl = `https://${scriptHost}/${scriptPath}/${scriptName}`;

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function anyclip(global, data) {
  validateData(data, requiredParams);

  global.addEventListener('message', () => {
    global.context.renderStart();
  });

  loadScript(global, scriptUrl, () => {
    global.anyclip = global.anyclip || {};
    global.anyclip.getWidget = global.anyclip.getWidget || function () {};
  });
}
