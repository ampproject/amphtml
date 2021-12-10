import {ActionTrust_Enum} from '#core/constants/action-constants';
import {dict} from '#core/types/object';
import {getWin} from '#core/window';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement} from '#preact/amp-base-element';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {Component, detached, elementInit, getOptions, props} from './element';

import {CSS} from '../../../build/amp-selector-1.0.css';

/** @const {string} */
const TAG = 'amp-selector';

class AmpSelector extends AmpPreactBaseElement {
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
    // Set up API
    this.registerApiAction('clear', (api) => {
      api./*OK*/ clear();
      this.mutateProps(dict({'value': []}));
    });

    this.registerApiAction('selectUp', (api, invocation) => {
      const {args} = invocation;
      const delta = args && args['delta'] !== undefined ? -args['delta'] : -1;
      api./*OK*/ selectBy(delta);
    });
    this.registerApiAction('selectDown', (api, invocation) => {
      const {args} = invocation;
      const delta = args && args['delta'] !== undefined ? args['delta'] : 1;
      api./*OK*/ selectBy(delta);
    });

    this.registerApiAction('toggle', (api, invocation) => {
      const {args} = invocation;
      const {'index': index, 'value': opt_select} = args;
      userAssert(typeof index === 'number', "'index' must be specified");
      const option = this.optionState[index];
      if (option) {
        api./*OK */ toggle(option, opt_select);
      }
    });

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

  /** @override */
  triggerEvent(element, eventName, detail) {
    const event = createCustomEvent(
      getWin(element),
      `amp-selector.${eventName}`,
      detail
    );
    Services.actionServiceForDoc(element).trigger(
      element,
      eventName,
      event,
      ActionTrust_Enum.HIGH
    );

    super.triggerEvent(element, eventName, detail);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-selector'),
      'expected global "bento" or specific "bento-selector" experiment to be enabled'
    );
    return true;
  }
}

/** @override */
AmpSelector['Component'] = Component;

/** @override */
AmpSelector['detached'] = detached;

/** @override */
AmpSelector['props'] = props;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
