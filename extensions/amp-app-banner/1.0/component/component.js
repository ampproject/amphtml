import * as Preact from '#preact';
import {useEffect, useMemo, useRef} from '#preact';
import {ContainWrapper} from '#preact/component';
import {useLocalStorage} from '#preact/hooks/useLocalStorage';
import {platformService} from '#preact/services/platform';

import {userAssert} from '#utils/log';

import {getAndroidAppInfo} from './android';
import {useStyles} from './component.jss';
import {getIOSAppInfo} from './ios';

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
    const button = bannerRef.current.querySelector('button[open-button]');
    userAssert(
      button,
      '<button open-button> is required inside %s: %s',
      'BentoAppBanner'
    );

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

const AppBannerForCurrentPlatform = platformService.isIos()
  ? AppBannerIOS
  : platformService.isAndroid()
  ? AppBannerAndroid
  : null;

/**
 * @param {!BentoAppBanner.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoAppBanner(props) {
  const [isDismissed, setDismissed] = useLocalStorage(
    getStorageKey(props.id),
    false
  );
  if (isDismissed) {
    return null;
  }

  if (!AppBannerForCurrentPlatform) {
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
  userAssert(id, 'bento-app-banner should have an id.');
  return 'bento-app-banner:' + id;
}
