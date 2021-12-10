import {dict} from '#core/types/object';

import {PreactBaseElement} from '#preact/base-element';

import {Component, detached, elementInit, getOptions, props} from './element';
export class BaseElement extends PreactBaseElement {
  /** @override */
  constructor(element) {
    super(element);

    /** @protected */
    this.optionState = [];

    /** @protected */
    this.isExpectedMutation = false;
  }

  /** @override */
  init() {
    return this.selectorInit();
  }

  /**
   * @protected
   * @return {JsonObject}
   */
  selectorInit() {
    const props = elementInit(
      this.element,
      (mu) => {
        if (this.isExpectedMutation) {
          this.isExpectedMutation = false;
          return;
        }
        const {children, options} = getOptions(this.element, mu);
        this.optionState = options;
        this.mutateProps({children, options});
      },

      // TODO(wg-bento): This hack is in place to prevent doubly rendering.
      // See https://github.com/ampproject/amp-react-prototype/issues/40.
      (event) => {
        const {option, value} = event;
        this.triggerEvent(
          this.element,
          'select',
          dict({
            'targetOption': option,
            'selectedOptions': value,
          })
        );

        this.isExpectedMutation = true;
        this.mutateProps(dict({'value': value}));
      }
    );

    this.optionState = props.options;
    return props;
  }
}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['detached'] = detached;

/** @override */
BaseElement['props'] = props;
