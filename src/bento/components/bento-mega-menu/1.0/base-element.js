import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';

import {BentoMegaMenu} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';
import {BentoItem} from './component/BentoItem';

export class BaseElement extends PreactBaseElement {
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
