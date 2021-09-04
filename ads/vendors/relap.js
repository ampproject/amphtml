import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function relap(global, data) {
  validateData(data, [], ['token', 'url', 'anchorid', 'version']);

  const urlParam = data['url'] || window.context.canonicalUrl;

  if (data['version'] === 'v7') {
    window.onRelapAPIReady = function (relapAPI) {
      relapAPI['init']({
        token: data['token'],
        url: urlParam,
      });
    };

    window.onRelapAPIInit = function (relapAPI) {
      relapAPI['addWidget']({
        cfgId: data['anchorid'],
        anchorEl: global.document.getElementById('c'),
        position: 'append',
        events: {
          onReady: function () {
            window.context.renderStart();
          },
          onNoContent: function () {
            window.context.noContentAvailable();
          },
        },
      });
    };

    loadScript(global, 'https://relap.io/v7/relap.js');
  } else {
    window.relapV6WidgetReady = function () {
      window.context.renderStart();
    };

    window.relapV6WidgetNoSimilarPages = function () {
      window.context.noContentAvailable();
    };

    const anchorEl = global.document.createElement('div');
    anchorEl.id = data['anchorid'];
    global.document.getElementById('c').appendChild(anchorEl);

    const url = `https://relap.io/api/v6/head.js?token=${encodeURIComponent(
      data['token']
    )}&url=${encodeURIComponent(urlParam)}`;
    loadScript(global, url);
  }
}
