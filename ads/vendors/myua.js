import {validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function myua(global, data) {
  validateData(data, ['sid', 'iid'], ['env', 'options']);

  const informerTag = global.document.createElement('div');
  informerTag.setAttribute('data-top-iid', data.iid);
  global.document.body.appendChild(informerTag);

  const env = data.env ? `${data.env}.` : '';
  const scriptTag = global.document.createElement('script');
  scriptTag.src = `https://amp.top-js-metrics.top.${env}my.ua/script.js`;
  scriptTag.setAttribute('async', 'true');
  scriptTag.setAttribute('data-top-sid', data.sid);

  global.document.body.appendChild(scriptTag);
}
