import { $disabled as _$disabled } from "./component.jss";import { $multiselected as _$multiselected } from "./component.jss";import { $selected as _$selected } from "./component.jss";import { $option as _$option } from "./component.jss";var _excluded = ["as", "disabled", "defaultValue", "form", "keyboardSelectMode", "value", "multiple", "name", "onChange", "onKeyDown", "role", "tabIndex", "children"],_excluded2 = ["as", "disabled", "index", "onClick", "onFocus", "onKeyDown", "option", "role", "tabIndex"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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

import * as Preact from "../../../src/preact";
import { Keys } from "../../../src/core/constants/key-codes";
import { forwardRef } from "../../../src/preact/compat";
import { mod } from "../../../src/core/math";
import { tryFocus } from "../../../src/core/dom";
import {
useCallback,
useContext,
useEffect,
useImperativeHandle,
useLayoutEffect,
useMemo,
useRef,
useState } from "../../../src/preact";

import { useStyles } from "./component.jss";
import objstr from 'obj-str';

var SelectorContext = Preact.createContext(
/** @type {SelectorDef.ContextProps} */({ selected: [] }));


/**
 * Set of namespaces that can be set for lifecycle reporters.
 *
 * @enum {string}
 */
export var KEYBOARD_SELECT_MODE = {
  NONE: 'none',
  FOCUS: 'focus',
  SELECT: 'select' };


/**
 * @param {!SelectorDef.Props} props
 * @param {{current: ?SelectorDef.SelectorApi}} ref
 * @return {PreactDef.Renderable}
 */
function SelectorWithRef(_ref,
















ref)
{var _ref$as = _ref.as,Comp = _ref$as === void 0 ? 'div' : _ref$as,disabled = _ref.disabled,_ref$defaultValue = _ref.defaultValue,defaultValue = _ref$defaultValue === void 0 ? [] : _ref$defaultValue,form = _ref.form,_ref$keyboardSelectMo = _ref.keyboardSelectMode,keyboardSelectMode = _ref$keyboardSelectMo === void 0 ? KEYBOARD_SELECT_MODE.NONE : _ref$keyboardSelectMo,value = _ref.value,multiple = _ref.multiple,name = _ref.name,onChange = _ref.onChange,customOnKeyDown = _ref.onKeyDown,_ref$role = _ref.role,role = _ref$role === void 0 ? 'listbox' : _ref$role,tabIndex = _ref.tabIndex,children = _ref.children,rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(value !== null && value !== void 0 ? value : defaultValue),_useState2 = _slicedToArray(_useState, 2),selectedState = _useState2[0],setSelectedState = _useState2[1];
  var optionsRef = useRef([]);
  var focusRef = useRef({ active: null, focusMap: {} });

  var selected = value !== null && value !== void 0 ? value : selectedState;
  var selectOption = useCallback(
  function (option) {
    if (!option) {
      return;
    }
    var newValue = null;
    if (multiple) {
      newValue = selected.includes(option) ?
      selected.filter(function (v) {return v != option;}) :
      selected.concat(option);
    } else {
      newValue = [option];
    }
    if (newValue) {
      setSelectedState(newValue);
      if (onChange) {
        onChange({ value: newValue, option: option });
      }
    }
  },
  [multiple, onChange, selected]);


  var context = useMemo(
  function () {return ({
      disabled: disabled,
      focusRef: focusRef,
      keyboardSelectMode: keyboardSelectMode,
      multiple: multiple,
      optionsRef: optionsRef,
      selected: selected,
      selectOption: selectOption });},

  [disabled, focusRef, keyboardSelectMode, multiple, selected, selectOption]);


  useEffect(function () {
    if (!multiple && selected.length > 1) {
      var newOption = selected.pop();
      setSelectedState([newOption]);
      if (onChange) {
        onChange({ value: [newOption], option: newOption });
      }
    }
  }, [onChange, multiple, selected]);

  var clear = useCallback(function () {return setSelectedState([]);}, []);

  var toggle = useCallback(
  function (option, select) {
    var isSelected = selected.includes(option);
    if (select && isSelected) {
      return;
    }
    var shouldSelect = select !== null && select !== void 0 ? select : !isSelected;
    if (shouldSelect) {
      selectOption(option);
    } else {
      setSelectedState(function (selected) {
        var newSelected = selected.filter(function (v) {return v != option;});
        if (onChange) {
          onChange({ value: newSelected, option: option });
        }
        return newSelected;
      });
    }
  },
  [onChange, setSelectedState, selectOption, selected]);


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
  var callbackByDelta = useCallback(function (delta, value, cb) {
    if (!optionsRef.current.length) {
      return;
    }
    var options = optionsRef.current.filter(function (v) {return v != undefined;});
    if (!options.length) {
      return;
    }
    var previous = options.indexOf(value);
    // If previousIndex === -1 is true, then a negative delta will be offset
    // one more than is wanted when looping back around in the options.
    // This occurs when the given value is undefined.
    var selectUpWhenNoneSelected = previous === -1 && delta < 0;
    var index = selectUpWhenNoneSelected ? delta : previous + delta;
    var option = options[mod(index, options.length)];
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
  var selectBy = useCallback(
  function (delta) {return callbackByDelta(delta, selected.shift(), selectOption);},
  [callbackByDelta, selected, selectOption]);


  var focusBy = useCallback(
  function (delta) {return (
      callbackByDelta(delta, focusRef.current.active, function (option) {
        var focus = focusRef.current.focusMap[option];
        if (focus) {
          focus();
        }
      }));},
  [callbackByDelta]);


  useImperativeHandle(
  ref,
  function () {return (
      /** @type {!SelectorDef.SelectorApi} */({
        clear: clear,
        selectBy: selectBy,
        toggle: toggle }));},

  [clear, selectBy, toggle]);


  var onKeyDown = useCallback(
  function (e) {
    if (customOnKeyDown) {
      customOnKeyDown(e);
    }
    var key = e.key;
    var dir;
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
        break;}

    if (dir) {
      if (keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT) {
        selectBy(dir);
      } else if (keyboardSelectMode === KEYBOARD_SELECT_MODE.FOCUS) {
        focusBy(dir);
      }
    }
  },
  [customOnKeyDown, keyboardSelectMode, focusBy, selectBy]);


  return (
    Preact.createElement(Comp, _objectSpread(_objectSpread({},
    rest), {}, {
      role: role,
      "aria-disabled": disabled,
      "aria-multiselectable": multiple,
      disabled: disabled,
      form: form,
      keyboardSelectMode: keyboardSelectMode,
      multiple: multiple,
      name: name,
      onKeyDown: onKeyDown,
      tabIndex:
      (tabIndex !== null && tabIndex !== void 0 ? tabIndex : keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT) ? 0 : -1,

      value: selected }),

    Preact.createElement("input", { hidden: true, defaultValue: selected, name: name, form: form }),
    Preact.createElement(SelectorContext.Provider, { value: context },
    children)));



}

var Selector = forwardRef(SelectorWithRef);
Selector.displayName = 'Selector'; // Make findable for tests.
export { Selector };

/**
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
export function Option(_ref2)










{var _ref2$as = _ref2.as,Comp = _ref2$as === void 0 ? 'div' : _ref2$as,_ref2$disabled = _ref2.disabled,disabled = _ref2$disabled === void 0 ? false : _ref2$disabled,index = _ref2.index,customOnClick = _ref2.onClick,customOnFocus = _ref2.onFocus,customOnKeyDown = _ref2.onKeyDown,option = _ref2.option,_ref2$role = _ref2.role,role = _ref2$role === void 0 ? 'option' : _ref2$role,tabIndex = _ref2.tabIndex,rest = _objectWithoutProperties(_ref2, _excluded2);

  var ref = useRef(null);
  var _useContext =







  useContext(SelectorContext),selectorDisabled = _useContext.disabled,focusRef = _useContext.focusRef,keyboardSelectMode = _useContext.keyboardSelectMode,selectorMultiple = _useContext.multiple,optionsRef = _useContext.optionsRef,selectOption = _useContext.selectOption,selected = _useContext.selected;

  var focus = useCallback(
  function (e) {
    if (customOnFocus) {
      customOnFocus(e);
    }
    if (ref.current) {
      tryFocus(ref.current);
    }
  },
  [customOnFocus]);


  // Element should be "registered" before it is visible.
  useLayoutEffect(function () {
    var refFromContext = optionsRef;
    if (!refFromContext || !refFromContext.current) {
      return;
    }
    if (index != undefined && !disabled) {
      refFromContext.current[index] = option;
    }
    return function () {return delete refFromContext.current[index];};
  }, [disabled, index, option, optionsRef]);

  // Element should be focusable before it is visible.
  useLayoutEffect(function () {
    if (!focusRef) {
      return;
    }
    var refFromContext = focusRef.current;
    if (!refFromContext || !refFromContext.focusMap) {
      return;
    }
    refFromContext.focusMap[option] = focus;
    return function () {return delete refFromContext.focusMap[option];};
  }, [focus, focusRef, option]);

  var trySelect = useCallback(function () {
    if (selectorDisabled || disabled) {
      return;
    }
    selectOption(option);
  }, [disabled, option, selectOption, selectorDisabled]);

  var onClick = useCallback(
  function (e) {
    trySelect();
    if (customOnClick) {
      customOnClick(e);
    }
  },
  [customOnClick, trySelect]);


  var onKeyDown = useCallback(
  function (e) {
    if (e.key === Keys.ENTER || e.key === Keys.SPACE) {
      trySelect();
    }
    if (customOnKeyDown) {
      customOnKeyDown(e);
    }
  },
  [customOnKeyDown, trySelect]);


  var isSelected = /** @type {!Array} */(selected).includes(option);
  var optionProps = _objectSpread(_objectSpread({},
  rest), {}, {
    className: (((('' + (
    true ? _$option : '')) + (
    isSelected && !selectorMultiple ? ' ' + _$selected : '')) + (
    isSelected && selectorMultiple ? ' ' + _$multiselected : '')) + (
    disabled || selectorDisabled ? ' ' + _$disabled : '')),

    disabled: disabled,
    'aria-disabled': String(disabled),
    onClick: onClick,
    onFocus: function onFocus() {return (focusRef.current.active = option);},
    onKeyDown: onKeyDown,
    option: option,
    ref: ref,
    role: role,
    selected: isSelected,
    'aria-selected': String(isSelected),
    tabIndex:
    (tabIndex !== null && tabIndex !== void 0 ? tabIndex : keyboardSelectMode === KEYBOARD_SELECT_MODE.SELECT) ? -1 : 0 });

  return Preact.createElement(Comp, _objectSpread({}, optionProps));
}
// /Users/mszylkowski/src/amphtml/extensions/amp-selector/1.0/component.js