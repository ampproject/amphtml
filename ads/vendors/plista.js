import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function plista(global, data) {
  // TODO: check mandatory fields
  validateData(
    data,
    [],
    [
      'publickey',
      'widgetname',
      'urlprefix',
      'item',
      'geo',
      'categories',
      'countrycode',
    ]
  );
  const div = global.document.createElement('div');
  div.setAttribute('data-display', 'plista_widget_' + data.widgetname);
  // container with id "c" is provided by amphtml
  global.document.getElementById('c').appendChild(div);
  window.PLISTA = {
    publickey: data.publickey,
    widgets: [
      {
        name: data.widgetname,
        pre: data.urlprefix,
      },
    ],
    item: data.item,
    geo: data.geo,
    categories: data.categories,
    noCache: true,
    useDocumentReady: false,
    dataMode: 'data-display',
  };

  // load the plista modules asynchronously
  loadScript(
    global,
    'https://static' +
      (data.countrycode ? '-' + encodeURIComponent(data.countrycode) : '') +
      '.plista.com/async.js'
  );
}
