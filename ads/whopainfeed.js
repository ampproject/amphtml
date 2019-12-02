import {loadScript, validateData} from '../3p/3p';

export function whopainfeed(global, data) {
  validateData(data, ['siteid']);

  global._whopainfeed = global._whopainfeed || {
    viewId: global.context.pageViewId,
    siteId: data['siteid'],
    testMode: data['testmode'] || 'false',
    template: data['template'] || 'default',
  };

  loadScript(global, 'https://widget.infeed.com.ar/widget/widget-amp.js');
}
