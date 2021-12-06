import * as Preact from "#preact"
import { useEffect, useMemo, useRef } from "#preact";
import { ContainWrapper } from "#preact/component";
import { useLocalStorage } from "#preact/hooks/useLocalStorage";
import { platformService } from "#preact/services/platform";
import { user } from "#utils/log";
import { getAndroidAppInfo } from "./android";
import { useStyles } from "./component.jss";
import { getIOSAppInfo } from "./ios";

/**
 * @param {!BentoAppBanner.Props} props
 * @return {PreactDef.Renderable}
 */
export function AppBanner({
                            children,
                            onInstall,
                            onDismiss,
                            dismissButtonAriaLabel = "Dismiss",
                            ...rest
                          }) {
  const styles = useStyles();

  const bannerRef = useRef(null);
  useEffect(() => {
    // We expect the children to include an open-button, like: <button open-button>Install App</button>
    const button = bannerRef.current.querySelector("button[open-button]");
    user().assert(
      button,
      "<button open-button> is required inside %s: %s",
      "BentoAppBanner"
    );

    button.addEventListener("click", onInstall);
    return () => button.removeEventListener("click", onInstall);
  }, []);

  return (
    <ContainWrapper {...rest}>
      <div className={styles.banner} ref={bannerRef}>
        <div className={styles.bannerPadding} />
        <button className={styles.dismiss} aria-label={dismissButtonAriaLabel} onClick={onDismiss} />
        {children}
      </div>
    </ContainWrapper>
  );
}

function AppBannerIOS(props) {
  const appInfo = useMemo(getIOSAppInfo);
  if (!appInfo) {
    return null;
  }

  return <AppBanner {...props} onInstall={appInfo.openOrInstall} />;
}

function AppBannerAndroid(props) {
  const appInfo = useMemo(getAndroidAppInfo);
  if (!appInfo) {
    return null;
  }

  return <AppBanner {...props} onInstall={appInfo.openOrInstall} />;
}

const AppBannerForCurrentPlatform = (
  platformService.isIos() ? AppBannerIOS :
    platformService.isAndroid() ? AppBannerAndroid :
      null
);

export function BentoAppBanner(props) {
  const [ isDismissed, setDismissed ] = useLocalStorage(getStorageKey(props.id), false);
  if (isDismissed) {
    return null;
  }

  if (!AppBannerForCurrentPlatform) {
    return null;
  }

  return <AppBannerForCurrentPlatform {...props} onDismiss={() => setDismissed(true)} />;
}

function getStorageKey(id) {
  user().assert(
    id,
    "bento-app-banner should have an id."
  );
  return "bento-app-banner:" + id;
}
