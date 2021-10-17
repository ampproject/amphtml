import {loadScript} from '#3p/3p';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {ContainWrapper} from '#preact/component';

import {useStyles} from './component.jss';

/**
 * @param {!BentoAdbDetector.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoAdbDetector({exampleTagNameProp, ...rest}) {
  // Examples of state and hooks
  // DO NOT SUBMIT: This is example code only.
  const [exampleValue, setExampleValue] = useState('Checking for Ad Blocker');
  const exampleRef = useRef(null);
  const styles = useStyles();

  useCallback(() => {
    /* Do things */
  }, []);
  useEffect(() => {
    loadScript(
      global,
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      (e) => {
        console /*OK*/
          .log('------> OK');
        console /*OK*/
          .log(e);
        setExampleValue('No Ad Blocker Detected :)');
      },
      (e) => {
        console /*OK*/
          .log('------> ERROR');
        console /*OK*/
          .log(e);
        setExampleValue('Ad Blocker Detected :(');
      }
    );
  }, []);
  useLayoutEffect(() => {
    /* Do things */
  }, []);
  useMemo(() => {
    /* Do things */
  }, []);

  return (
    <ContainWrapper layout size paint {...rest}>
      <div>{exampleValue}</div>
    </ContainWrapper>
  );
}
