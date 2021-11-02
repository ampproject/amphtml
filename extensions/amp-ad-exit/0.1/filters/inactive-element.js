import {matches} from '#core/dom/query';

import {dev, userAssert} from '#utils/log';

import {FILTER_TYPE_ENUM, Filter} from './filter';

/**
 * A Filter that ignores events originating from elements that match a specified
 * element selector.
 */
export class InactiveElementFilter extends Filter {
  /**
   * @param {string} name The user-defined name of the filter.
   * @param {!../config.InactiveElementConfig} spec
   */
  constructor(name, spec) {
    super(name, spec.type);
    userAssert(isValidInactiveElementSpec(spec), 'Invalid InactiveElementspec');

    /** @private {string} */
    this.selector_ = spec.selector;
  }

  /** @override */
  filter(event) {
    const element = dev().assertElement(event.target);
    return !matches(element, this.selector_);
  }
}

/**
 * @param {!../config.InactiveElementConfig} spec
 * @return {boolean} Whether the config defines a InactiveElement filter.
 */
function isValidInactiveElementSpec(spec) {
  return (
    spec.type == FILTER_TYPE_ENUM.INACTIVE_ELEMENT &&
    typeof spec.selector == 'string'
  );
}

/**
 * @param {string} selector A CSS selector matching elements to ignore.
 * @return {!../config.ClickLocationConfig}
 */
export function makeInactiveElementSpec(selector) {
  return {type: FILTER_TYPE_ENUM.INACTIVE_ELEMENT, selector};
}
