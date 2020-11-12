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
import {forwardRef} from '../../../src/preact/compat';
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
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
    role = 'listbox',
    children,
    ...rest
  },
  ref
) {
  const [selectedState, setSelectedState] = useState(
    value ? value : defaultValue
  );
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
      selected,
      selectOption,
      disabled,
      multiple,
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

  useImperativeHandle(
    ref,
    () =>
      /** @type {!SelectorDef.SelectorApi} */ ({
        clear,
        toggle,
      }),
    [clear, toggle]
  );

  return (
    <Comp
      {...rest}
      role={role}
      aria-disabled={disabled}
      aria-multiselectable={multiple}
      disabled={disabled}
      multiple={multiple}
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
  onClick,
  option,
  role = 'option',
  style,
  tabIndex = '0',
  ...rest
}) {
  const {
    selected,
    selectOption,
    disabled: selectorDisabled,
    multiple: selectorMultiple,
  } = useContext(SelectorContext);
  const clickHandler = (e) => {
    if (selectorDisabled || disabled) {
      return;
    }
    if (onClick) {
      onClick(e);
    }
    selectOption(option);
  };

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
    onClick: clickHandler,
    option,
    role,
    selected: isSelected,
    'aria-selected': String(isSelected),
    style: {...statusStyle, ...style},
    tabIndex,
  };
  return <Comp {...optionProps}></Comp>;
}
