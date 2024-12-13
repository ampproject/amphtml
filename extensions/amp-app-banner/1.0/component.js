import {querySelectorInSlot} from '#core/dom/query';

import * as Preact from '#preact';
import {useEffect, useMemo, useRef} from '#preact';
import {ContainWrapper} from '#preact/component';
import {useLocalStorage} from '#preact/hooks/useLocalStorage';
import {logger} from '#preact/logger';
import {platformUtils} from '#preact/utils/platform';

import {useStyles} from './component.jss';
import {getAndroidAppInfo} from './utils/android';
import {getIOSAppInfo} from './utils/ios';

/**
 * The raw App Banner component; no platform-specific logic
 * @param {BentoAppBannerDef.RawProps} props
 * @return {JSX.Element}
 * @constructor
 */
export function AppBanner({
  children,
  dismissButtonAriaLabel = 'Dismiss',
  onDismiss,
  onInstall,
  ...rest
}) {
  const styles = useStyles();

  const bannerRef = useRef(null);

  useEffect(() => {
    // We expect the children to include an open-button, like: <button open-button>Install App</button>
    let button = bannerRef.current.querySelector('button[open-button]');

    // When used as a web-component, we must search the slot for the open-button:
    if (!button) {
      const slot = bannerRef.current.querySelector('slot');
      if (slot) {
        button = querySelectorInSlot(slot, 'button[open-button]');
      }
    }

    if (!button) {
      logger.error(
        'BENTO-APP-BANNER',
        'Component children should contain a <button open-button>'
      );
      return;
    }

    button.addEventListener('click', onInstall);
    return () => button.removeEventListener('click', onInstall);
  }, [onInstall]);

  return (
    <ContainWrapper {...rest}>
      <div class={styles.banner} ref={bannerRef}>
        <div class={styles.bannerPadding} />
        <button
          class={styles.dismiss}
          aria-label={dismissButtonAriaLabel}
          onClick={onDismiss}
        />
        {children}
      </div>
    </ContainWrapper>
  );
}

/**
 * @param {BentoAppBannerDef.Props} props
 * @return {JSX.Element|null}
 * @constructor
 */
function AppBannerIOS(props) {
  const appInfo = useMemo(getIOSAppInfo, []);
  if (!appInfo) {
    return null;
  }

  return <AppBanner {...props} onInstall={appInfo.openOrInstall} />;
}

/**
 * @param {BentoAppBannerDef.Props} props
 * @return {JSX.Element|null}
 * @constructor
 */
function AppBannerAndroid(props) {
  const appInfo = useMemo(getAndroidAppInfo, []);
  if (!appInfo) {
    return null;
  }

  return <AppBanner {...props} onInstall={appInfo.openOrInstall} />;
}

/**
 * @param {!BentoAppBanner.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoAppBanner(props) {
  if (!props.id) {
    logger.warn('BENTO-APP-BANNER', 'component should have an id');
  }
  const [isDismissed, setDismissed] = useLocalStorage(
    getStorageKey(props.id),
    false
  );
  if (isDismissed) {
    return null;
  }

  const AppBannerForCurrentPlatform = platformUtils.isIos()
    ? AppBannerIOS
    : platformUtils.isAndroid()
      ? AppBannerAndroid
      : null;

  if (!AppBannerForCurrentPlatform) {
    logger.info(
      'BENTO-APP-BANNER',
      'Component not rendered:',
      'OS not supported'
    );
    return null;
  }

  return (
    <AppBannerForCurrentPlatform
      {...props}
      onDismiss={() => setDismissed(true)}
    />
  );
}

/**
 * @param {string} id
 * @return {string}
 */
function getStorageKey(id) {
  return 'bento-app-banner:' + id;
}
