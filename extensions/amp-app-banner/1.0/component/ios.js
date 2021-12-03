import { dict } from "#core/types/object";
import { user, userAssert } from "#utils/log";
import { openWindowDialog } from "../../../../src/open-window-dialog";
import { docService } from "../services/document";
import { platformService } from "../services/platform";
import { timerService } from "../services/timer";
import { urlService } from "../services/url";
import { viewerService } from "../services/viewer";

const OPEN_LINK_TIMEOUT = 1500;

export function getIOSAppInfo() {
  const canShowBuiltinBanner = !viewerService.isEmbedded() && platformService.isSafari();
  if (canShowBuiltinBanner) {
    user().info(
      'bento-app-banner',
      'Browser supports builtin banners. Not rendering amp-app-banner.'
    );
    return null;
  }

  const canNavigateTo = !viewerService.isEmbedded() || viewerService.hasCapability('navigateTo')
  if (!canNavigateTo) return null;

  const metaContent = docService.getMetaByName('apple-itunes-app');
  if (!metaContent) return null;
  const { installAppUrl, openInAppUrl } = parseIOSMetaContent(metaContent);
  if (!installAppUrl) return null;

  return {
    installAppUrl,
    openInAppUrl,
    openOrInstall: () => {
      if (!viewerService.isEmbedded()) {
        timerService.delay(() => {
          openWindowDialog(window, installAppUrl, '_top');
        }, OPEN_LINK_TIMEOUT);
        openWindowDialog(window, openInAppUrl, '_top');
      } else {
        timerService.delay(() => {
          viewerService.sendMessage('navigateTo', dict({ 'url': installAppUrl }));
        }, OPEN_LINK_TIMEOUT);
        viewerService.sendMessage('navigateTo', dict({ 'url': openInAppUrl }));
      }
    },
  };
}

export function parseIOSMetaContent(metaContent) {
  const parts = metaContent.replace(/\s/, '').split(',');
  const config = {};
  parts.forEach((part) => {
    const keyValuePair = part.split('=');
    config[keyValuePair[0]] = keyValuePair[1];
  });

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
      'bento-app-banner',
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
