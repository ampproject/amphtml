import {parseUrlDeprecated} from '../../src/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function clever(global, data) {
  if (!data || !data.id || !data.hash) {
    global.context.noContentAvailable();
    return;
  }

  const domain = parseUrlDeprecated(global.context.sourceUrl).origin;
  const c = document.createElement('script');

  c.id = 'CleverCoreLoader' + data.id;
  c.src = '//scripts.cleverwebserver.com/' + data.hash + '.js';
  c.type = 'text/javascript';
  c.setAttribute('data-target', global.window.name);
  c.setAttribute('data-origin', domain);

  global.document.getElementsByTagName('body')[0].append(c);
}
