import objstr from 'obj-str';

import {Keys_Enum} from '#core/constants/key-codes';
import {tryFocus} from '#core/dom';
import {mod} from '#core/math';

import * as Preact from '#preact';
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {propName, tabindexFromProps} from '#preact/utils';

import {useStyles} from './component.jss';

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
 * @param {!BentoSelectorDef.Props} props
 * @param {{current: ?SelectorDef.SelectorApi}} ref
 * @return {PreactDef.Renderable}
 */
function SelectorWithRef(
  {
    as: Comp = 'div',
    children,
    defaultValue = [],
    disabled,
    form,
    keyboardSelectMode = KEYBOARD_SELECT_MODE.NONE,
    multiple,
    name,
    onChange,
    role = 'listbox',
    value,
    ...rest
  },
  ref
) {
  const tabindex = tabindexFromProps(
    rest,
    keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT ? 0 : -1
  );
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

  const clear = useCallback(() => {
    setSelectedState([]);
    if (onChange) {
      onChange({value: [], option: value});
    }
  }, [setSelectedState, onChange, value]);

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
      const {key} = e;
      let dir;
      switch (key) {
        case Keys_Enum.LEFT_ARROW: // Fallthrough.
        case Keys_Enum.UP_ARROW:
          dir = -1;
          break;
        case Keys_Enum.RIGHT_ARROW: // Fallthrough.
        case Keys_Enum.DOWN_ARROW:
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
    [keyboardSelectMode, focusBy, selectBy]
  );

  return (
    <Comp
      {...rest}
      role={role}
      aria-disabled={disabled}
      aria-multiselectable={multiple}
      disabled={disabled}
      form={form}
      multiple={multiple}
      name={name}
      onKeyDown={onKeyDown}
      tabindex={tabindex}
      value={selected}
    >
      <input hidden defaultValue={selected} name={name} form={form} />
      <SelectorContext.Provider value={context}>
        {children}
      </SelectorContext.Provider>
    </Comp>
  );
}

const BentoSelector = forwardRef(SelectorWithRef);
BentoSelector.displayName = 'BentoSelector'; // Make findable for tests.
export {BentoSelector};

/**
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
export function BentoSelectorOption({
  as: Comp = 'div',
  disabled = false,
  focus: customFocus,
  index,
  option,
  role = 'option',
  [propName('class')]: className = '',
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
    selectOption,
    selected,
  } = useContext(SelectorContext);

  const tabindex = tabindexFromProps(
    rest,
    keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT ? -1 : 0
  );

  const focus = useCallback(() => {
    customFocus?.();
    if (ref.current) {
      tryFocus(ref.current);
    }
  }, [customFocus]);

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

  const onClick = useCallback(() => {
    trySelect();
  }, [trySelect]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === Keys_Enum.ENTER || e.key === Keys_Enum.SPACE) {
        trySelect();
      }
    },
    [trySelect]
  );

  const isSelected = /** @type {!Array} */ (selected).includes(option);
  return (
    <Comp
      {...rest}
      aria-disabled={String(disabled)}
      aria-selected={String(isSelected)}
      class={objstr({
        [className]: !!className,
        [classes.option]: true,
        [classes.selected]: isSelected && !selectorMultiple,
        [classes.multiselected]: isSelected && selectorMultiple,
        [classes.disabled]: disabled || selectorDisabled,
      })}
      disabled={disabled}
      onClick={onClick}
      onFocus={() => (focusRef.current.active = option)}
      onKeyDown={onKeyDown}
      ref={ref}
      role={role}
      selected={isSelected}
      tabindex={tabindex}
      value={option}
    />
  );
}
