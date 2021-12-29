import * as Preact from '#preact';
import {useCallback, useEffect, useRef, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

/**
 * Displays given component with supplied props.
 * @param {*} props
 * @param {{current: ?Element}} ref
 * @return {PreactDef.Renderable}
 */
function DisplayAsWithRef({as: Comp = 'div', ...rest}, ref) {
  return <Comp {...rest} ref={ref} />;
}

const DisplayAs = forwardRef(DisplayAsWithRef);

/**
 * @param {!BentoAdblockDetector.Props} props
 * @param {{current: ?BentoAdblockDetectorDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoAdblockDetectorWithRef(
  {
    adNetworkDomain = 'https://doubleclick.net',
    ampAd,
    fallbackDiv,
    fetchOptions = {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    },
    ...rest
  },
  ref
) {
  /** Constants */
  const STATE_LOADING = 0;
  const STATE_READY_NO_BLOCKER = 1;
  const STATE_READY_BLOKER_DETECTED = 2;

  /** States */
  const [isBlockerDetected, setIsBlockerDetected] = useState(null);

  /** References */
  const ampAdRef = useRef(null);
  const fallbackDivRef = useRef(null);
  const containerWrapperRef = useRef(ref);

  /** Callbacks */
  const blockerDetectedCallback = useCallback(() => {
    /** AdBlocker won't allow to fetch from `url`, show `fallbackDiv` */
    setIsBlockerDetected(true);
  }, []);

  useEffect(() => {
    /** Check for `adBlockExtension` in window */
    if (!window.adBlockExtension) {
      /** Initialize adBlockExtension */
      window.adBlockExtension = {};

      /** Set loading state */
      window.adBlockExtension.state = STATE_LOADING;
    } else if (window.adBlockExtension.state === STATE_LOADING) {
      /** If `adBlockExtension` exists, push this extension's `blockerDetectedCallback()` */
      window.adBlockExtension.fallbackFunctions =
        window.adBlockExtension.fallbackFunctions || [];
      window.adBlockExtension.fallbackFunctions.push(() =>
        blockerDetectedCallback()
      );

      /** Return to avoide multiple request to `https://doubleclick.net` */
      return;
    }

    if (window.adBlockExtension.state !== STATE_LOADING) {
      return;
    }

    /** Try to fetch `adNetworkDomain` with `fetchOptions` */
    fetch(adNetworkDomain, fetchOptions)
      .catch(() => {
        window.adBlockExtension.state = STATE_READY_BLOKER_DETECTED;

        /** AdBlocker won't allow to fetch from `url`, show `fallbackDiv` for the first extension */
        blockerDetectedCallback();

        /** show `fallbackDiv` for the rest of the extensions */
        window.adBlockExtension.fallbackFunctions?.forEach(
          (fallbackFunction) => {
            fallbackFunction();
          }
        );
      })
      .finally(() => {
        window.adBlockExtension.state =
          window.adBlockExtension.state === STATE_LOADING
            ? STATE_READY_NO_BLOCKER
            : window.adBlockExtension.state;

        /** Cleanup resources */
        window.adBlockExtension.state = false;
        window.adBlockExtension.fallbackFunctions = [];
      });
  }, [adNetworkDomain, blockerDetectedCallback, fetchOptions]);

  return (
    <ContainWrapper layout size paint {...rest} ref={containerWrapperRef}>
      {!isBlockerDetected && <DisplayAs as={ampAd} ref={ampAdRef} />}
      {isBlockerDetected && <DisplayAs as={fallbackDiv} ref={fallbackDivRef} />}
    </ContainWrapper>
  );
}

const BentoAdblockDetector = forwardRef(BentoAdblockDetectorWithRef);
BentoAdblockDetector.displayName = 'BentoAdblockDetector'; // Make findable for tests.
export {BentoAdblockDetector};
