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

import * as CSS from './selector.css';
import * as Preact from '../../../src/preact';
import {Keys} from '../../../src/utils/key-codes';
import {forwardRef} from '../../../src/preact/compat';
import {mod} from '../../../src/utils/math';
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

const SelectorContext = Preact.createContext(
  /** @type {SelectorDef.ContextProps} */ ({selected: []})
);

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
    value,
    multiple,
    onChange,
    onKeyDown,
    role = 'listbox',
    children,
    ...rest
  },
  ref
) {
  const [selectedState, setSelectedState] = useState(
    value ? value : defaultValue
  );
  const optionsRef = useRef([]);
  const selected = value ? value : selectedState;

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
      multiple,
      optionsRef,
      selected,
      selectOption,
    }),
    [disabled, multiple, selected, selectOption]
  );

  useEffect(() => {
    if (!multiple && selected.length > 1) {
      setSelectedState([selected[0]]);
    }
  }, [multiple, selected]);

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
        setSelectedState((selected) => selected.filter((v) => v != option));
      }
    },
    [setSelectedState, selectOption, selected]
  );

  /**
   * This method modifies the selected state by at most one value of the
   * current selected state by the given delta.
   * The modification is done in FIFO order. When no values are selected,
   * the new selected state becomes the option at the given delta.
   *
   * Only meaningful if `order` is provided to `Option` children.
   *
   * ex: (1, [0, 2], [0, 1, 2, 3]) => [2, 1]
   * ex: (-1, [2, 1], [0, 1, 2, 3]) => [1]
   * ex: (2, [2, 1], [0, 1, 2, 3]) => [1, 0]
   * ex: (-1, [], [0, 1, 2, 3]) => [3]
   */
  const selectBy = useCallback(
    (delta) => {
      if (!optionsRef.current.length) {
        return;
      }
      const options = optionsRef.current.filter((v) => v != undefined);
      if (!options.length) {
        return;
      }
      const previous = options.indexOf(selected.shift());
      // If previousIndex === -1 is true, then a negative delta will be offset
      // one more than is wanted when looping back around in the options.
      // This occurs when no options are selected and "selectUp" is called.
      const selectUpWhenNoneSelected = previous === -1 && delta < 0;
      const index = selectUpWhenNoneSelected ? delta : previous + delta;
      const option = options[mod(index, options.length)];
      selectOption(option);
    },
    [selected, selectOption]
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

  return (
    <Comp
      {...rest}
      role={role}
      aria-disabled={disabled}
      aria-multiselectable={multiple}
      disabled={disabled}
      multiple={multiple}
      onKeyDown={onKeyDown}
    >
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
  onClick: customOnClick,
  onKeyDown: customOnKeyDown,
  option,
  order,
  role = 'option',
  style,
  tabIndex = 0,
  ...rest
}) {
  const {
    disabled: selectorDisabled,
    multiple: selectorMultiple,
    optionsRef,
    selected,
    selectOption,
  } = useContext(SelectorContext);

  useLayoutEffect(() => {
    if (order != undefined) {
      optionsRef.current[order] = option;
    }
    return () => delete optionsRef[order];
  }, [order, option, optionsRef]);

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

  const isSelected =
    /** @type {!Array} */ (selected).includes(option) && !disabled;
  const statusStyle =
    disabled || selectorDisabled
      ? CSS.DISABLED
      : isSelected
      ? selectorMultiple
        ? CSS.MULTI_SELECTED
        : CSS.SELECTED
      : CSS.OPTION;
  const optionProps = {
    ...rest,
    disabled,
    'aria-disabled': String(disabled),
    onClick,
    onKeyDown,
    option,
    role,
    selected: isSelected,
    'aria-selected': String(isSelected),
    style: {...statusStyle, ...style},
    tabIndex,
  };
  return <Comp {...optionProps} />;
}
