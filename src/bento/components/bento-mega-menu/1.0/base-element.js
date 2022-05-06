import {toggleAttribute} from '#core/dom';
import {childElementsByTag} from '#core/dom/query';
import {toArray} from '#core/types/array';

import * as Preact from '#preact';
import {useLayoutEffect} from '#preact';
import {PreactBaseElement} from '#preact/base-element';

import {BentoMegaMenu} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    const {element} = this;
    const mu = new MutationObserver(() => {
      // this.mutateProps({children: mapChildrenFromDom(element, mu)});
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

    const TitleShim = getTitleShim(title);
    const ContentShim = getContentShim(contents);

    const item = (
      <BentoMegaMenu.Item>
        <BentoMegaMenu.Title as={TitleShim} />
        <BentoMegaMenu.Content as={ContentShim} />
      </BentoMegaMenu.Item>
    );
    return item;
  });
  return children;
}

function getTitleShim(element) {
  return function TitleShim(props) {
    useLayoutEffect(() => {
      setAttributes(element, props);
      return () => unsetAttributes(element, props);
    }, [props]);

    return null;
  };
}
function getContentShim(element) {
  return function ContentShim(props) {
    useLayoutEffect(() => {
      setAttributes(element, props);
      return () => unsetAttributes(element, props);
    }, [props]);

    return null;
  };
}

/** @override */
BaseElement['Component'] = BentoMegaMenu;

/** @override */
BaseElement['props'] = {
  // 'children': {passthrough: true},
};

// Prevent the Preact component from showing:
/** @override */
// BaseElement['detached'] = true;

function setAttributes(element, props) {
  updateAttributes(element, props, false);
}
function unsetAttributes(element, props) {
  updateAttributes(element, props, true);
}
function updateAttributes(element, props, unset) {
  Object.keys(props).forEach((prop) => {
    const value = props[prop];
    if (value === undefined || value === false) {
      return;
    }

    if (prop === 'onClick') {
      if (!unset) {
        console.log('addEventListener', value);
        element.addEventListener('click', value);
      } else {
        element.removeEventListener('click', value);
      }
    } else if (prop === 'class' || prop === 'className') {
      const classes = value.split(' ');
      if (!unset) {
        element.classList.add(...classes);
      } else {
        element.classList.remove(...classes);
      }
    } else {
      if (!unset) {
        element.setAttribute(prop, value);
      } else {
        element.removeAttribute(prop);
      }
    }
  });
}
