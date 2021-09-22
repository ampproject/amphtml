import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function myua(global, data) {
  validateData(data, ['sid', 'iid'], ['demo', 'options']);

  const informerTag = global.document.createElement('div');
  informerTag.setAttribute('data-top-iid', data.iid);
  global.document.body.appendChild(informerTag);

  const demoSuffix = data.demo ? 'dev.' : '';
  const scriptTag = global.document.createElement('script');
  scriptTag.src = `https://amp.top-js-metrics.top.${demoSuffix}my.ua/script.js`;
  scriptTag.setAttribute('async', 'true');
  scriptTag.setAttribute('data-top-sid', data.sid);

  global.document.body.appendChild(scriptTag);
}
