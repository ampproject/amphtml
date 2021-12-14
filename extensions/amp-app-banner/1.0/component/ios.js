import {docInfo} from '#preact/utils/docInfo';
import {platformUtils} from '#preact/utils/platform';
import {urlUtils} from '#preact/utils/url';

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
  const canShowBuiltinBanner = platformUtils.isSafari();
  if (canShowBuiltinBanner) {
    user().info(
      'BENTO-APP-BANNER',
      'Browser supports builtin banners. Not rendering amp-app-banner.'
    );
    return null;
  }

  const metaContent = docInfo.getMetaByName('apple-itunes-app');
  if (!metaContent) {
    return null;
  }
  const {installAppUrl, openInAppUrl} = parseIOSMetaContent(metaContent);

  return {
    installAppUrl,
    openInAppUrl,
    openOrInstall: () => {
      setTimeout(() => {
        openWindowDialog(window, installAppUrl, '_top');
      }, OPEN_LINK_TIMEOUT);
      openWindowDialog(window, openInAppUrl, '_top');
    },
  };
}

/**
 * @param {string} metaContent
 * @return {{installAppUrl: string, openInAppUrl: string}}
 */
export function parseIOSMetaContent(metaContent) {
  const config = parseKeyValues(metaContent);

  const appId = config['app-id'];
  const openUrl = config['app-argument'];

  if (openUrl) {
    userAssert(
      urlUtils.isProtocolValid(openUrl),
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

/**
 * Parses a string like "key1=value1,key2=value2" into { key1: "value1", key2: "value2" }
 * @param {string} metaContent
 * @return {*}
 */
function parseKeyValues(metaContent) {
  return metaContent
    .replace(/\s/, '')
    .split(',')
    .reduce((result, keyValue) => {
      const [key, value] = keyValue.split('=');
      result[key] = value;
      return result;
    }, {});
}
