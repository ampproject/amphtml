import * as Preact from './';

import {MediaQueryProps} from '#core/dom/media-query-props';
import {collectProps} from './parse-props';

/**
 * @param Ctor
 * @return {() => void}
 */
export function getBuildDom(Ctor) {
  const fakeWindow = {matchMedia: () => null};
  const mediaQueryProps = new MediaQueryProps(fakeWindow, () => {});

  return function buildDom(element) {
    const props = collectProps(
      Ctor,
      element,
      /* ref */ {current: null},
      /* default props */ {},
      mediaQueryProps
    );

    const vdom = Preact.createElement(Ctor['Component'], props);
    Preact.render(vdom, element);
  };
}
