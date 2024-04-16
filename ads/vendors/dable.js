import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function dable(global, data) {
  // check required props
  validateData(data, ['widgetId']);

  global.dable =
    global.dable ||
    function () {
      (global.dable.q = global.dable.q || []).push(arguments);
    };
  global.dable(
    'setService',
    data['serviceName'] || global.window.context.location.hostname
  );
  global.dable(
    'setURL',
    global.window.context.canonicalUrl || global.window.context.sourceUrl
  );
  global.dable('setRef', global.window.context.referrer);

  const slot = global.document.createElement('div');
  slot.id = '_dbl_' + Math.floor(Math.random() * 100000);
  slot.setAttribute('data-widget_id', data['widgetId']);

  const divContainer = global.document.getElementById('c');
  if (divContainer) {
    divContainer.appendChild(slot);
  }

  const itemId = data['itemId'] || '';
  const channel = data['channel'] || '';
  const articleSection = data['articleSection'] || '';
  const articleSection2 = data['articleSection2'] || '';
  const articleSection3 = data['articleSection3'] || '';
  const orgServiceId = data['orgServiceId'] || '';
  const widgetOpts = {};
  const logOpts = {};

  if (channel) {
    widgetOpts.channel = channel;
  }
  if (articleSection) {
    widgetOpts.category1 = articleSection;
    logOpts.category1 = articleSection;
  }
  if (articleSection2) {
    widgetOpts.category2 = articleSection2;
    logOpts.category2 = articleSection2;
  }
  if (articleSection3) {
    widgetOpts.category3 = articleSection3;
    logOpts.category3 = articleSection3;
  }
  if (orgServiceId) {
    widgetOpts.orgServiceId = orgServiceId;
    logOpts.orgServiceId = orgServiceId;
  }

  if (itemId) {
    logOpts.id = itemId;
    global.dable('sendLog', 'view', logOpts);
  } else {
    widgetOpts.ignoreItems = true;
  }

  // call render widget
  global.dable('renderWidget', slot.id, itemId, widgetOpts, function (hasAd) {
    if (hasAd) {
      global.context.renderStart();
    } else {
      global.context.noContentAvailable();
    }
  });

  // load the Dable script asynchronously
  loadScript(global, 'https://static.dable.io/dist/plugin.min.js');
}
