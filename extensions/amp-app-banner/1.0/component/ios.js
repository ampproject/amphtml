import {logger} from '#preact/logger';
import {DocumentInfo} from '#preact/utils/documentInfo';
import {DocumentScopeBase} from '#preact/utils/documentScopeBase';
import {platformUtils} from '#preact/utils/platform';
import {UrlUtils} from '#preact/utils/url';

import {openWindowDialog} from '../../../../src/open-window-dialog';

const OPEN_LINK_TIMEOUT = 1500;

export class IosAppInfo extends DocumentScopeBase {
  static forDoc = DocumentScopeBase.forDoc;

  /**
   * @return {{
   *    openOrInstall: function(): void,
   *    installAppUrl: string,
   *    openInAppUrl: string,
   * }|null}
   */
  getIOSAppInfo() {
    const canShowBuiltinBanner = platformUtils.isSafari();
    if (canShowBuiltinBanner) {
      logger.info(
        'BENTO-APP-BANNER',
        'Not rendering bento-app-banner:',
        'Browser supports builtin banners.'
      );
      return null;
    }

    const metaContent = DocumentInfo.forDoc(this.ownerDocument).getMetaByName(
      'apple-itunes-app'
    );
    if (!metaContent) {
      logger.error(
        'BENTO-APP-BANNER',
        'Not rendering bento-app-banner:',
        'could not find a <meta name="apple-itunes-app" /> tag'
      );
      return null;
    }
    const {installAppUrl, openInAppUrl} = this.parseIOSMetaContent(metaContent);

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
  parseIOSMetaContent(metaContent) {
    const config = parseKeyValues(metaContent);

    const appId = config['app-id'];
    let openUrl = config['app-argument'];

    if (!openUrl) {
      logger.warn(
        'BENTO-APP-BANNER',
        '<meta name="apple-itunes-app">\'s content should contain ' +
          'app-argument to allow opening an already installed application ' +
          'on iOS.'
      );
    } else if (!UrlUtils.forDoc(this.ownerDocument).isProtocolValid(openUrl)) {
      logger.warn(
        'BENTO-APP-BANNER',
        `The url in app-argument has invalid protocol: ${openUrl}`
      );
      openUrl = '';
    }

    const installAppUrl = `https://itunes.apple.com/us/app/id${appId}`;
    const openInAppUrl = openUrl || installAppUrl;

    return {
      installAppUrl,
      openInAppUrl,
    };
  }
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
