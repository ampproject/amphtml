import {toggleAttribute} from '#core/dom';
import {childElementsByTag} from '#core/dom/query';
import {toArray} from '#core/types/array';

import {PreactBaseElement} from '#preact/base-element';

import {BentoMegaMenu} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    return;
    // const getExpandStateTrigger = (section) => (expanded) => {
    //   toggleAttribute(section, 'expanded', expanded);
    // section[SECTION_POST_RENDER]?.();
    // this.triggerEvent(section, expanded ? 'expand' : 'collapse');
    // };

    const {element} = this;
    const mu = new MutationObserver(() => {
      this.mutateProps({children: mapChildrenFromDom(element, mu)});
    });
    mu.observe(element, {
      attributeFilter: ['expanded', 'id'],
      subtree: true,
      childList: true,
    });

    return {children: mapChildrenFromDom(element, mu)};
  }
}

function mapChildrenFromDom(element, mu) {
  const sections = toArray(childElementsByTag(element, 'section'));
}

/** @override */
BaseElement['Component'] = BentoMegaMenu;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
