import {dispatchCustomEvent} from '#core/dom';

import {PreactBaseElement} from '#preact/base-element';

import {Component, detached, elementInit, props} from './element';

/** @extends {PreactBaseElement<BentoAccordionDef.BentoAccordionApi>} */
export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    return elementInit(
      this.element,
      this.mutateProps.bind(this), // eslint-disable-line local/restrict-this-access
      dispatchCustomEvent
    );
  }
}

BaseElement['Component'] = Component;

BaseElement['props'] = props;

BaseElement['detached'] = detached;
