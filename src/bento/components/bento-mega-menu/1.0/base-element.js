import {PreactBaseElement} from '#preact/base-element';

import {BentoMegaMenu} from './component';
import {BentoItem} from './component/BentoItem';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    super.init();
    return {ItemWrapper: BentoItem};
  }
}

/** @override */
BaseElement['Component'] = BentoMegaMenu;

/** @override */
BaseElement['props'] = {
  'children': {
    selector: '*',
    single: false,
  },
};

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
