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
import {Keys} from '../../../src/utils/key-codes';
import {forwardRef} from '../../../src/preact/compat';
import {mod} from '../../../src/utils/math';
import {tryFocus} from '../../../src/dom';
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './component.jss';
import objstr from 'obj-str';

const SelectorContext = Preact.createContext(
  /** @type {SelectorDef.ContextProps} */ ({selected: []})
);

/**
 * Set of namespaces that can be set for lifecycle reporters.
 *
 * @enum {string}
 */
export const KEYBOARD_SELECT_MODE = {
  NONE: 'none',
  FOCUS: 'focus',
  SELECT: 'select',
};

/**
 * @param {!SelectorDef.Props} props
 * @param {{current: (!SelectorDef.SelectorApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function SelectorWithRef(
  {
    as: Comp = 'div',
    disabled,
    defaultValue = [],
    form,
    keyboardSelectMode = KEYBOARD_SELECT_MODE.NONE,
    value,
    multiple,
    name,
    onChange,
    onKeyDown: customOnKeyDown,
    role = 'listbox',
    tabIndex,
    children,
    ...rest
  },
  ref
) {
  const [selectedState, setSelectedState] = useState(value ?? defaultValue);
  const optionsRef = useRef([]);
  const focusRef = useRef({active: null, focusMap: {}});

  const selected = value ?? selectedState;
  const selectOption = useCallback(
    (option) => {
      if (!option) {
        return;
      }
      let newValue = null;
      if (multiple) {
        newValue = selected.includes(option)
          ? selected.filter((v) => v != option)
          : selected.concat(option);
      } else {
        newValue = [option];
      }
      if (newValue) {
        setSelectedState(newValue);
        if (onChange) {
          onChange({value: newValue, option});
        }
      }
    },
    [multiple, onChange, selected]
  );

  const context = useMemo(
    () => ({
      disabled,
      focusRef,
      keyboardSelectMode,
      multiple,
      optionsRef,
      selected,
      selectOption,
    }),
    [disabled, focusRef, keyboardSelectMode, multiple, selected, selectOption]
  );

  useEffect(() => {
    if (!multiple && selected.length > 1) {
      const newOption = selected.pop();
      setSelectedState([newOption]);
      if (onChange) {
        onChange({value: [newOption], option: newOption});
      }
    }
  }, [onChange, multiple, selected]);

  const clear = useCallback(() => setSelectedState([]), []);

  const toggle = useCallback(
    (option, select) => {
      const isSelected = selected.includes(option);
      if (select && isSelected) {
        return;
      }
      const shouldSelect = select ?? !isSelected;
      if (shouldSelect) {
        selectOption(option);
      } else {
        setSelectedState((selected) => {
          const newSelected = selected.filter((v) => v != option);
          if (onChange) {
            onChange({value: newSelected, option});
          }
          return newSelected;
        });
      }
    },
    [onChange, setSelectedState, selectOption, selected]
  );

  /**
   * This method uses the given callback on the target index found by
   * modifying the given value state by the given delta.
   *
   * Only meaningful if `index` is provided to `Option` children.
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
  const callbackByDelta = useCallback((delta, value, cb) => {
    if (!optionsRef.current.length) {
      return;
    }
    const options = optionsRef.current.filter((v) => v != undefined);
    if (!options.length) {
      return;
    }
    const previous = options.indexOf(value);
    // If previousIndex === -1 is true, then a negative delta will be offset
    // one more than is wanted when looping back around in the options.
    // This occurs when the given value is undefined.
    const selectUpWhenNoneSelected = previous === -1 && delta < 0;
    const index = selectUpWhenNoneSelected ? delta : previous + delta;
    const option = options[mod(index, options.length)];
    cb(option);
  }, []);

  /**
   * This method modifies the selected state by at most one value of the
   * current selected state by the given delta.
   * The modification is done in FIFO order. When no values are selected,
   * the new selected state becomes the option at the given delta.
   *
   * Only meaningful if `index` is provided to `Option` children.
   *
   * ex: (1, [0, 2], [0, 1, 2, 3]) => [2, 1]
   * ex: (-1, [2, 1], [0, 1, 2, 3]) => [1]
   * ex: (2, [2, 1], [0, 1, 2, 3]) => [1, 0]
   * ex: (-1, [], [0, 1, 2, 3]) => [3]
   */
  const selectBy = useCallback(
    (delta) => callbackByDelta(delta, selected.shift(), selectOption),
    [callbackByDelta, selected, selectOption]
  );

  const focusBy = useCallback(
    (delta) =>
      callbackByDelta(delta, focusRef.current.active, (option) => {
        const focus = focusRef.current.focusMap[option];
        if (focus) {
          focus();
        }
      }),
    [callbackByDelta]
  );

  useImperativeHandle(
    ref,
    () =>
      /** @type {!SelectorDef.SelectorApi} */ ({
        clear,
        selectBy,
        toggle,
      }),
    [clear, selectBy, toggle]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (customOnKeyDown) {
        customOnKeyDown(e);
      }
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
          selectBy(dir);
        } else if (keyboardSelectMode === KEYBOARD_SELECT_MODE.FOCUS) {
          focusBy(dir);
        }
      }
    },
    [customOnKeyDown, keyboardSelectMode, focusBy, selectBy]
  );

  return (
    <Comp
      {...rest}
      role={role}
      aria-disabled={disabled}
      aria-multiselectable={multiple}
      disabled={disabled}
      form={form}
      keyboardSelectMode={keyboardSelectMode}
      multiple={multiple}
      name={name}
      onKeyDown={onKeyDown}
      tabIndex={
        tabIndex ?? keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT ? 0 : -1
      }
      value={selected}
    >
      <input hidden defaultValue={selected} name={name} form={form} />
      <SelectorContext.Provider value={context}>
        {children}
      </SelectorContext.Provider>
    </Comp>
  );
}

const Selector = forwardRef(SelectorWithRef);
Selector.displayName = 'Selector'; // Make findable for tests.
export {Selector};

/**
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
export function Option({
  as: Comp = 'div',
  disabled = false,
  index,
  onClick: customOnClick,
  onFocus: customOnFocus,
  onKeyDown: customOnKeyDown,
  option,
  role = 'option',
  tabIndex,
  ...rest
}) {
  const classes = useStyles();
  const ref = useRef(null);
  const {
    disabled: selectorDisabled,
    focusRef,
    keyboardSelectMode,
    multiple: selectorMultiple,
    optionsRef,
    selected,
    selectOption,
  } = useContext(SelectorContext);

  const focus = useCallback(
    (e) => {
      if (customOnFocus) {
        customOnFocus(e);
      }
      if (ref.current) {
        tryFocus(ref.current);
      }
    },
    [customOnFocus]
  );

  // Element should be "registered" before it is visible.
  useLayoutEffect(() => {
    const refFromContext = optionsRef;
    if (!refFromContext || !refFromContext.current) {
      return;
    }
    if (index != undefined && !disabled) {
      refFromContext.current[index] = option;
    }
    return () => delete refFromContext.current[index];
  }, [disabled, index, option, optionsRef]);

  // Element should be focusable before it is visible.
  useLayoutEffect(() => {
    if (!focusRef) {
      return;
    }
    const refFromContext = focusRef.current;
    if (!refFromContext || !refFromContext.focusMap) {
      return;
    }
    refFromContext.focusMap[option] = focus;
    return () => delete refFromContext.focusMap[option];
  }, [focus, focusRef, option]);

  const trySelect = useCallback(() => {
    if (selectorDisabled || disabled) {
      return;
    }
    selectOption(option);
  }, [disabled, option, selectOption, selectorDisabled]);

  const onClick = useCallback(
    (e) => {
      trySelect();
      if (customOnClick) {
        customOnClick(e);
      }
    },
    [customOnClick, trySelect]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === Keys.ENTER || e.key === Keys.SPACE) {
        trySelect();
      }
      if (customOnKeyDown) {
        customOnKeyDown(e);
      }
    },
    [customOnKeyDown, trySelect]
  );

  const isSelected = /** @type {!Array} */ (selected).includes(option);
  const optionProps = {
    ...rest,
    className: objstr({
      [classes.option]: true,
      [classes.selected]: isSelected && !selectorMultiple,
      [classes.multiselected]: isSelected && selectorMultiple,
      [classes.disabled]: disabled || selectorDisabled,
    }),
    disabled,
    'aria-disabled': String(disabled),
    onClick,
    onFocus: () => (focusRef.current.active = option),
    onKeyDown,
    option,
    ref,
    role,
    selected: isSelected,
    'aria-selected': String(isSelected),
    tabIndex:
      tabIndex ?? keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT ? -1 : 0,
  };
  return <Comp {...optionProps} />;
}
