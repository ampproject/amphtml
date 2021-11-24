import * as Preact from '#preact';
import {useEffect, useRef, useState} from '#preact';
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

  useEffect(() => {
    /** Try to fetch `https://www3.doubleclick.net` */
    const url = 'https://www3.doubleclick.net';
    fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    }).catch(() => {
      /** AdBlocker won't allow to fetch from `url`, show `fallbackDiv` */
      setIsBlockerDetected(true);
      console /*OK*/
        .error('AdBlocker Detected!');
    });
  }, []);

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
