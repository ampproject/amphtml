import {docService} from '#preact/services/document';
import {platformService} from '#preact/services/platform';
import {timerService} from '#preact/services/timer';
import {urlService} from '#preact/services/url';
import {viewerService} from '#preact/services/viewer';

import {user, userAssert} from '#utils/log';

import {openWindowDialog} from '../../../../src/open-window-dialog';

const OPEN_LINK_TIMEOUT = 1500;

/**
 * @return {{
 *    openOrInstall: function(): void,
 *    installAppUrl: string,
 *    openInAppUrl: string,
 * }|null}
 */
export function getIOSAppInfo() {
  const canShowBuiltinBanner =
    !viewerService.isEmbedded() && platformService.isSafari();
  if (canShowBuiltinBanner) {
    user().info(
      'BENTO-APP-BANNER',
      'Browser supports builtin banners. Not rendering amp-app-banner.'
    );
    return null;
  }

  const canNavigateTo =
    !viewerService.isEmbedded() || viewerService.hasCapability('navigateTo');
  if (!canNavigateTo) {
    return null;
  }

  const metaContent = docService.getMetaByName('apple-itunes-app');
  if (!metaContent) {
    return null;
  }
  const {installAppUrl, openInAppUrl} = parseIOSMetaContent(metaContent);
  if (!installAppUrl) {
    return null;
  }

  return {
    installAppUrl,
    openInAppUrl,
    openOrInstall: () => {
      if (viewerService.isEmbedded()) {
        user().warn(
          'BENTO-APP-BANNER',
          'Bento components should never be running in an embedded viewer'
        );
        // timerService.delay(() => {
        //   viewerService.sendMessage('navigateTo', dict({'url': installAppUrl}));
        // }, OPEN_LINK_TIMEOUT);
        // viewerService.sendMessage('navigateTo', dict({'url': openInAppUrl}));
      } else {
        timerService.delay(() => {
          openWindowDialog(window, installAppUrl, '_top');
        }, OPEN_LINK_TIMEOUT);
        openWindowDialog(window, openInAppUrl, '_top');
      }
    },
  };
}

/**
 * @param {string} metaContent
 * @return {{installAppUrl: string, openInAppUrl: string}}
 */
export function parseIOSMetaContent(metaContent) {
  const config = metaContent
    .replace(/\s/, '')
    .split(',')
    .reduce((result, part) => {
      const [key, value] = part.split('=');
      result[key] = value;
      return result;
    }, {});

  const appId = config['app-id'];
  const openUrl = config['app-argument'];

  if (openUrl) {
    userAssert(
      urlService.isProtocolValid(openUrl),
      'The url in app-argument has invalid protocol: %s',
      openUrl
    );
  } else {
    user().error(
      'BENTO-APP-BANNER',
      '<meta name="apple-itunes-app">\'s content should contain ' +
        'app-argument to allow opening an already installed application ' +
        'on iOS.'
    );
  }

  const installAppUrl = `https://itunes.apple.com/us/app/id${appId}`;
  const openInAppUrl = openUrl || installAppUrl;

  return {
    installAppUrl,
    openInAppUrl,
  };
}
