import * as Preact from '#preact';
import {ContainWrapper} from '#preact/component';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import { getAndroidAppInfo } from "./android";
import {useStyles} from './component.jss';
import { getIOSAppInfo } from "./ios";

/**
 * @param {!BentoAppBanner.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoAppBanner({
  children,
  onInstall,
  dismissButtonAriaLabel = "Dismiss",
  ...rest
}) {
  const styles = useStyles();

  return (
    <ContainWrapper {...rest}>
      <div className={styles.banner}>
        <div className={styles.bannerPadding} />
        <button className={styles.dismiss} aria-label={dismissButtonAriaLabel} />
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

  return <BentoAppBanner {...props} onInstall={appInfo.openOrInstall} />;
}

function AppBannerAndroid(props) {
  const appInfo = useMemo(getAndroidAppInfo);
  if (!appInfo) {
    return null;
  }

  return <BentoAppBanner {...props} onInstall={appInfo.openOrInstall} />;
}
