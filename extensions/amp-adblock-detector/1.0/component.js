import {loadScript} from '#3p/3p';

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
  {ampAd, fallbackDiv, ...rest},
  ref
) {
  /** States */
  const [isBlockerDetected, setIsBlockerDetected] = useState(null);

  /** References */
  const ampAdRef = useRef(null);
  const fallbackDivRef = useRef(null);
  const containerWrapperRef = useRef(ref);

  const adBlockerDetectedCallback = useCallback(() => {
    containerWrapperRef.current./*OK*/ offsetParent.removeChild(
      containerWrapperRef.current./*OK*/ offsetParent.children[0]
    );
  }, []);

  useEffect(() => {
    /**
     * Try to load `adsbygoogle.js` and check whether it is blocked or not.
     * TODO(@anuragvasanwala): This block needs to be improved.
     */
    loadScript(
      global,
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      (e) => {
        setIsBlockerDetected(false);
      },
      (e) => {
        adBlockerDetectedCallback();
        setIsBlockerDetected(true);
      }
    );
  }, [adBlockerDetectedCallback]);

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
