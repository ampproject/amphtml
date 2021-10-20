import objStr from 'obj-str';

import {loadScript} from '#3p/3p';

import {adreactor} from '#ads/vendors/adreactor';

import * as Preact from '#preact';
import {useCallback, useEffect, useRef, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {useStyles} from './component.jss';

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
 * @param {!BentoAdbDetector.Props} props
 * @param {{current: ?BentoAdbDetectorDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoAdbDetectorWithRef({ampAd, onB, onBlock, ...rest}, ref) {
  /** States */
  const [isBlockerDetected, setIsBlockerDetected] = useState(false);
  const [detectionStatusString, setdetectionStatusString] = useState(
    'Checking for Ad Blocker'
  );
  const adRef = useRef(null);
  const myRef = useRef(ref);

  /** Style Classes */
  const classes = useStyles();

  const xf = useCallback(() => {
    console.error(adRef.current);
    console.error(myRef.current);
    myRef.current./*OK*/ offsetParent.children[0].togglePlaceholder(false);
    myRef.current./*OK*/ offsetParent.children[0].toggleLoading(false, true);
    myRef.current./*OK*/ offsetParent.children[0].classList.remove(
      'i-amphtml-notbuilt'
    );
    myRef.current./*OK*/ offsetParent.children[0].classList.remove(
      'amp-notbuilt'
    );
    myRef.current./*OK*/ offsetParent.children[0].classList.add(
      'amp-notsupported'
    );

    myRef.current./*OK*/ offsetParent.children[0].toggleFallback(true);

    debugger;
    // this.togglePlaceholder(true);
    //     const forceLoadingIndicator =
    //       this.element.hasAttribute('reset-on-refresh');
    //     this.toggleLoading(true, forceLoadingIndicator);
    //     this.toggleFallback_(false);
  }, [adRef, myRef]);

  useEffect(() => {
    // Tru to load `adsbygoogle.js` and check whether it is blocked or not.
    loadScript(
      global,
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      (e) => {
        console /*OK*/
          .log('------> No ad-blocker detected :)');
        console /*OK*/
          .log(e);
        setIsBlockerDetected(false);
        setdetectionStatusString('No Ad Blocker Detected :)');
      },
      (e) => {
        console /*OK*/
          .log('------> Ad-blocker detected :(');
        console /*OK*/
          .log(e);
        setIsBlockerDetected(true);
        setdetectionStatusString('This is a fallback ad');
        //onBlock();
        xf();
        //eval(onB);
      }
    );
  }, [onBlock, onB, xf]);

  return (
    <ContainWrapper layout size paint {...rest} ref={myRef}>
      <DisplayAs as={ampAd} ref={adRef} />
      {/* <ContainWrapper layout size paint {...rest}>
        <div
          class={objStr({
            [classes.blockerDetected]: isBlockerDetected,
            [classes.blockerNotDetected]: !isBlockerDetected,
          })}
        ></div>
      </ContainWrapper> */}
    </ContainWrapper>
  );
}

const BentoAdbDetector = forwardRef(BentoAdbDetectorWithRef);
BentoAdbDetector.displayName = 'BentoAdbDetector'; // Make findable for tests.
export {BentoAdbDetector};
