import {loadScript, validateData} from '#3p/3p';

import {setStyle} from '#core/dom/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function relap(global, data) {
  validateData(data, [], ['token', 'url', 'anchorid', 'version']);

  const urlParam = data['url'] || window.context.canonicalUrl;

  if (data['version'] === 'v7') {
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
            relapAPI['destroy']();
            window.context.noContentAvailable();
          },
        },
      });
    };

    const iframeEl = document.createElement('iframe');
    setStyle(iframeEl, 'position', 'absolute');
    setStyle(iframeEl, 'visibility', 'hidden');
    setStyle(iframeEl, 'left', '-9999px');
    setStyle(iframeEl, 'top', '-9999px');
    iframeEl.className = 'relap-runtime-iframe';
    iframeEl.srcdoc = `<script src="https://relap.io/v7/relap.js" data-relap-token="${data['token']}" data-relap-url="${urlParam}"></script>`;
    global.document.body.appendChild(iframeEl);
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
