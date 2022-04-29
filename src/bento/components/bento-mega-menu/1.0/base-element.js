import {toggleAttribute} from '#core/dom';
import {childElementsByTag} from '#core/dom/query';
import {toArray} from '#core/types/array';

import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';

import {BentoMegaMenu} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
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
  const children = sections.map((section) => {
    const {firstElementChild: title, lastElementChild: contents} = section;

    const item = (
      <BentoMegaMenu.Item>
        <BentoMegaMenu.Title>{title.innerText}</BentoMegaMenu.Title>
        <BentoMegaMenu.Content>{contents.innerText}</BentoMegaMenu.Content>
      </BentoMegaMenu.Item>
    );
    return item;
  });
  return children;
}

/** @override */
BaseElement['Component'] = BentoMegaMenu;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

// TODO: Should shadowDom be disabled, like bento-accordion?
/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
