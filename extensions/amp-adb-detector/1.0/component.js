import objStr from 'obj-str';

import {loadScript} from '#3p/3p';

import * as Preact from '#preact';
import {useEffect, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

import {useStyles} from './component.jss';

/**
 * @param {!BentoAdbDetector.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoAdbDetector({...rest}) {
  /** States */
  const [isBlockerDetected, setIsBlockerDetected] = useState(false);
  const [detectionStatusString, setdetectionStatusString] = useState(
    'Checking for Ad Blocker'
  );

  /** Style Classes */
  const classes = useStyles();

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
        setdetectionStatusString('Ad Blocker Detected :(');
      }
    );
  }, []);

  return (
    <ContainWrapper layout size paint {...rest}>
      <div
        class={objStr({
          [classes.blockerDetected]: isBlockerDetected,
          [classes.blockerNotDetected]: !isBlockerDetected,
        })}
      >
        {detectionStatusString}
      </div>
    </ContainWrapper>
  );
}
