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

/**
 * @param {!BentoGptAd.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoGptAd({exampleTagNameProp, ...rest}) {
  const div1Ref = useRef(null);
  //const div2Ref = useRef(null);
  //const x = Date.now();

  const fnx = useCallback((g) => {
    g.googletag = g.googletag || {cmd: []};
    g.googletag.cmd.push(function () {
      g.googletag
        .defineSlot('/21730346048/test-skyscraper', [120, 600], 'div1')
        .addService(g.googletag.pubads());
      // g.googletag
      //   .defineSlot('/21730346048/test-skyscraper', [120, 600], 'div2')
      //   .addService(g.googletag.pubads());
      g.googletag.enableServices();
      g.googletag.display(div1Ref.current);
      //g.googletag.display(div2Ref.current);
    });
  }, []);

  useEffect(() => {
    loadScript(
      global,
      'https://www.googletagservices.com/tag/js/gpt.js',
      () => {
        fnx(global);
      }
    );
  }, [fnx]);

  return (
    <ContainWrapper layout size paint {...rest}>
      <div
        id="div1"
        ref={div1Ref}
        style="width: 120px; height: 600px;; margin: 10px"
      ></div>
    </ContainWrapper>
  );
}
