/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '../../../src/preact';
import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-selector-1.0.css';
import {Keys} from '../../../src/utils/key-codes';
import {Option, Selector} from './selector';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  toggleAttribute,
  tryFocus,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {forwardRef} from '../../../src/preact/compat';
import {isExperimentOn} from '../../../src/experiments';
import {mod} from '../../../src/utils/math';
import {toArray} from '../../../src/types';
import {useCallback, useLayoutEffect, useRef} from '../../../src/preact';

/** @const {string} */
const TAG = 'amp-selector';

/**
 * Set of namespaces that can be set for lifecycle reporters.
 *
 * @enum {string}
 */
const KEYBOARD_SELECT_MODE = {
  NONE: 'none',
  FOCUS: 'focus',
  SELECT: 'select',
};

class AmpSelector extends PreactBaseElement {
  /** @override */
  init() {
    const {element} = this;
    const action = Services.actionServiceForDoc(this.element);
    this.optionState = [];

    // TODO(wg-bento): This hack is in place to prevent doubly rendering.
    // See https://github.com/ampproject/amp-react-prototype/issues/40.
    let isExpectedMutation = false;
    const handleSelect = (value, option, trust) => {
      fireSelectEvent(this.win, action, element, option, value, trust);
      isExpectedMutation = true;
      this.mutateProps(dict({'value': value}));
    };

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

    const mu = new MutationObserver(() => {
      if (isExpectedMutation) {
        isExpectedMutation = false;
        return;
      }
      const {children, options} = getOptions(element, mu);
      this.optionState = options;
      this.mutateProps({children, options});
    });
    mu.observe(element, {
      attributeFilter: [
        'option',
        'selected',
        'disabled',
        'keyboard-select-mode',
      ],
      childList: true,
      subtree: true,
    });

    const {children, value, options} = getOptions(element, mu);
    this.optionState = options;
    return dict({
      'shimDomElement': element,
      'children': children,
      'value': value,
      'onChange': (e) => {
        handleSelect(e['value'], e['option'], ActionTrust.HIGH);
      },
      'options': options,
    });
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'amp-selector-bento'),
      'expected amp-selector-bento experiment to be enabled'
    );
    return true;
  }
}

/**
 * @param {!Element} element
 * @param {MutationObserver} mu
 * @return {!JsonObject}
 */
function getOptions(element, mu) {
  const children = [];
  const options = [];
  const value = [];
  const optionChildren = toArray(element.querySelectorAll('[option]'));
  const kbs =
    element.getAttribute('keyboard-select-mode') || KEYBOARD_SELECT_MODE.NONE;
  optionChildren
    // Skip options that are themselves within an option
    .filter(
      (el) =>
        !closestAncestorElementBySelector(
          dev().assertElement(el.parentElement),
          '[option]'
        )
    )
    .forEach((child, index) => {
      const option = child.getAttribute('option') || index.toString();
      const selected = child.hasAttribute('selected');
      const disabled = child.hasAttribute('disabled');
      const tabIndex =
        child.getAttribute('tabindex') ?? kbs === KEYBOARD_SELECT_MODE.SELECT
          ? -1
          : 0;
      const props = {
        as: OptionShim,
        option,
        disabled,
        order: index,
        role: child.getAttribute('role') || 'option',
        shimDomElement: child,
        // TODO(wg-bento): This implementation causes infinite loops on DOM mutation.
        // See https://github.com/ampproject/amp-react-prototype/issues/40.
        postRender: () => {
          // Skip mutations to avoid cycles.
          mu.takeRecords();
        },
        selected,
        tabIndex,
      };
      if (selected) {
        value.push(option);
      }
      const optionChild = <Option {...props} />;
      options.push(option);
      children.push(optionChild);
    });
  return {value, children, options};
}

/**
 * Triggers a 'select' event with two data params:
 * 'targetOption' - option value of the selected or deselected element.
 * 'selectedOptions' - array of option values of selected elements.
 *
 * @param {!Window} win
 * @param {!../../../src/service/action-impl.ActionService} action
 * @param {!Element} el The element that was selected or deslected.
 * @param {string} option
 * @param {Array<string>} value
 * @param {!ActionTrust} trust
 * @private
 */
function fireSelectEvent(win, action, el, option, value, trust) {
  const name = 'select';
  const selectEvent = createCustomEvent(
    win,
    `amp-selector.${name}`,
    dict({'targetOption': option, 'selectedOptions': value})
  );
  action.trigger(el, name, selectEvent, trust);
}

/**
 * This method uses the given callback on the target index found by
 * modifying the given value state by the given delta.
 *
 * ex: (1, "a", ["a", "b", "c", "d"]) => cb(1)
 * ex: (-1, "c", ["a", "b", "c", "d"]) => cb(1)
 * ex: (2, "c", ["a", "b", "c", "d"]) => cb(1)
 * ex: (-1, undefined, ["a", "b", "c", "d"]) => cb(2)
 * @param {number} delta
 * @param {!Array<string>} value
 * @param {Array<string>} options
 * @param {Function} cb
 * @return {{value: Array<string>, option: string}|undefined}
 */
function callbackByDelta(delta, value, options, cb) {
  const previous = options.indexOf(value);
  // If previousIndex === -1 is true, then a negative delta will be offset
  // one more than is wanted when looping back around in the options.
  // This occurs when the given value is undefined.
  const selectUpWhenNoneSelected = previous === -1 && delta < 0;
  const index = selectUpWhenNoneSelected ? delta : previous + delta;
  cb(mod(index, options.length));
}

/**
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
function OptionShim({
  shimDomElement,
  onClick,
  onKeyDown,
  selected,
  disabled,
  role = 'option',
  tabIndex,
}) {
  const syncEvent = useCallback(
    (type, handler) => {
      if (!handler) {
        return;
      }
      shimDomElement.addEventListener(type, handler);
      return () => shimDomElement.removeEventListener(name, devAssert(handler));
    },
    [shimDomElement]
  );

  useLayoutEffect(() => syncEvent('click', onClick), [onClick, syncEvent]);
  useLayoutEffect(() => syncEvent('keydown', onKeyDown), [
    onKeyDown,
    syncEvent,
  ]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'selected', !!selected);
  }, [shimDomElement, selected]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'disabled', !!disabled);
    shimDomElement.setAttribute('aria-disabled', !!disabled);
  }, [shimDomElement, disabled]);

  useLayoutEffect(() => {
    shimDomElement.setAttribute('role', role);
  }, [shimDomElement, role]);

  useLayoutEffect(() => {
    if (tabIndex != undefined) {
      shimDomElement.tabIndex = tabIndex;
    }
  }, [shimDomElement, tabIndex]);

  return <div></div>;
}

/**
 * @param {!SelectorDef.Props} props
 * @param {{current: (!SelectorDef.SelectorApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function SelectorShimWithRef(
  {
    shimDomElement,
    children,
    multiple,
    disabled,
    keyboardSelectMode = KEYBOARD_SELECT_MODE.NONE,
    role = 'listbox',
    tabIndex,
    value,
    options,
    ...rest
  },
  ref
) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const focusRef = useRef(options[0]);
  const focus = useCallback(
    (index) => {
      focusRef.current = options[index];
      const option = children[index];
      if (option && option.props && option.props.shimDomElement) {
        tryFocus(option.props.shimDomElement);
      }
    },
    [options, children]
  );

  const onKeyDown = useCallback(
    (e) => {
      const {key} = e;
      let dir;
      switch (key) {
        case Keys.LEFT_ARROW: // Fallthrough.
        case Keys.UP_ARROW:
          dir = -1;
          break;
        case Keys.RIGHT_ARROW: // Fallthrough.
        case Keys.DOWN_ARROW:
          dir = 1;
          break;
        default:
          break;
      }
      if (dir) {
        if (keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT) {
          selectByDelta(dir, valueRef.current, options, ref.current);
        } else if (keyboardSelectMode === KEYBOARD_SELECT_MODE.FOCUS) {
          callbackByDelta(dir, focusRef.current, options, focus);
        }
      }
    },
    [focus, keyboardSelectMode, options, ref]
  );

  useLayoutEffect(() => {
    shimDomElement.addEventListener('keydown', onKeyDown);
    return () =>
      shimDomElement.removeEventListener('keydown', devAssert(onKeyDown));
  }, [shimDomElement, onKeyDown]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'multiple', !!multiple);
    shimDomElement.setAttribute('aria-multiselectable', !!multiple);
  }, [shimDomElement, multiple]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'disabled', !!disabled);
    shimDomElement.setAttribute('aria-disabled', !!disabled);
  }, [shimDomElement, disabled]);

  useLayoutEffect(() => {
    shimDomElement.setAttribute('role', role);
  }, [shimDomElement, role]);

  useLayoutEffect(() => {
    shimDomElement.tabIndex =
      tabIndex ?? keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT ? 0 : -1;
  }, [shimDomElement, keyboardSelectMode, tabIndex]);

  return (
    <Selector
      role={role}
      children={children}
      multiple={multiple}
      disabled={disabled}
      tabIndex={
        tabIndex ?? keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT ? 0 : -1
      }
      ref={ref}
      value={value}
      {...rest}
    />
  );
}

const SelectorShim = forwardRef(SelectorShimWithRef);
Selector.displayName = 'SelectorShim'; // Make findable for tests.

/** @override */
AmpSelector['Component'] = SelectorShim;

/** @override */
AmpSelector['detached'] = true;

/** @override */
AmpSelector['props'] = {
  'disabled': {attr: 'disabled', type: 'boolean'},
  'multiple': {attr: 'multiple', type: 'boolean'},
  'name': {attr: 'name'},
  'role': {attr: 'role'},
  'tabindex': {attr: 'tabindex'},
  'keyboardSelectMode': {attr: 'keyboard-select-mode'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
