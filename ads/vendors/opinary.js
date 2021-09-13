import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @description Make canonicalUrl available from iframe
 */
function addCanonicalLinkTag(global) {
  if (global.context.canonicalUrl) {
    const link = global.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', global.context.canonicalUrl);
    global.document.head.appendChild(link);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 * @return {?Node}
 */
function createContainer(global, data) {
  // create div
  const div = global.document.createElement('div');
  if (data.poll) {
    div.className = 'opinary-widget-embed';
    div.dataset.customer = data.client;
    div.dataset.poll = data.poll;
  } else {
    div.setAttribute('id', 'opinary-automation-placeholder');
  }

  return div;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function opinary(global, data) {
  validateData(data, ['client']);

  addCanonicalLinkTag(global);

  // c element is created by AMP
  const c = global.document.getElementById('c');

  // create div to detect if we are in AMP context
  const isAmp = global.document.createElement('div');
  isAmp.setAttribute('id', 'opinaryAMP');
  c.appendChild(isAmp);

  // create div where poll should be shown
  c.appendChild(createContainer(global, data));

  // load script
  if (data.poll) {
    loadScript(global, `https://widgets.opinary.com/embed.js`);
  } else {
    loadScript(global, `https://widgets.opinary.com/a/${data.client}.js`);
  }
}
