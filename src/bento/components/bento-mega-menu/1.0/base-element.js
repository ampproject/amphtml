import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';

import {BentoMegaMenu} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {}

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
