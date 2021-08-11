import { $contentHidden as _$contentHidden } from "./component.jss";import { $sectionChild as _$sectionChild2 } from "./component.jss";import { $header as _$header } from "./component.jss";import { $sectionChild as _$sectionChild } from "./component.jss";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";var _excluded = ["animate", "as", "children", "expandSingleSection", "id"],_excluded2 = ["animate", "as", "children", "expanded", "id", "onExpandStateChange"],_excluded3 = ["as", "children", "className", "id", "role", "tabIndex"],_excluded4 = ["as", "children", "className", "id", "role"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _slicedToArray(arr, i) {return (_arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest());}function _nonIterableRest() {throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _iterableToArrayLimit(arr, i) {var _i = arr == null ? null : (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);if (_i == null) return;var _arr = [];var _n = true;var _d = false;var _s, _e;try {for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"] != null) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}function _arrayWithHoles(arr) {if (Array.isArray(arr)) return arr;}function _objectWithoutProperties(source, excluded) {if (source == null) return {};var target = _objectWithoutPropertiesLoose(source, excluded);var key, i;if (Object.getOwnPropertySymbols) {var sourceSymbolKeys = Object.getOwnPropertySymbols(source);for (i = 0; i < sourceSymbolKeys.length; i++) {key = sourceSymbolKeys[i];if (excluded.indexOf(key) >= 0) continue;if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;target[key] = source[key];}}return target;}function _objectWithoutPropertiesLoose(source, excluded) {if (source == null) return {};var target = {};var sourceKeys = Object.keys(source);var key, i;for (i = 0; i < sourceKeys.length; i++) {key = sourceKeys[i];if (excluded.indexOf(key) >= 0) continue;target[key] = source[key];}return target;} /**
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
import { WithAmpContext } from "../../../src/preact/context";
import { animateCollapse, animateExpand } from "./animations";
import { forwardRef } from "../../../src/preact/compat";
import { omit } from "../../../src/core/types/object";
import {
randomIdGenerator,
sequentialIdGenerator } from "../../../src/core/data-structures/id-generator";

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

var AccordionContext = Preact.createContext(
/** @type {AccordionDef.AccordionContext} */({}));


var SectionContext = Preact.createContext(
/** @type {AccordionDef.SectionContext} */({}));


/** @type {!Object<string, boolean>} */
var EMPTY_EXPANDED_MAP = {};

/** @type {!Object<string, function(boolean):undefined|undefined>} */
var EMPTY_EVENT_MAP = {};

var generateSectionId = sequentialIdGenerator();
var generateRandomId = randomIdGenerator(100000);

/**
 * @param {!AccordionDef.AccordionProps} props
 * @param {{current: ?AccordionDef.AccordionApi}} ref
 * @return {PreactDef.Renderable}
 */
function AccordionWithRef(_ref,








ref)
{var _ref$animate = _ref.animate,animate = _ref$animate === void 0 ? false : _ref$animate,_ref$as = _ref.as,Comp = _ref$as === void 0 ? 'section' : _ref$as,children = _ref.children,_ref$expandSingleSect = _ref.expandSingleSection,expandSingleSection = _ref$expandSingleSect === void 0 ? false : _ref$expandSingleSect,id = _ref.id,rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(EMPTY_EXPANDED_MAP),_useState2 = _slicedToArray(_useState, 2),expandedMap = _useState2[0],setExpandedMap = _useState2[1];
  var eventMapRef = useRef(EMPTY_EVENT_MAP);
  var _useState3 = useState(generateRandomId),_useState4 = _slicedToArray(_useState3, 1),randomPrefix = _useState4[0];
  var prefix = id || "a".concat(randomPrefix);

  useEffect(function () {
    if (!expandSingleSection) {
      return;
    }
    setExpandedMap(function (expandedMap) {
      var newExpandedMap = {};
      var expanded = 0;
      for (var k in expandedMap) {
        newExpandedMap[k] = expandedMap[k] && expanded++ == 0;
      }
      return newExpandedMap;
    });
  }, [expandSingleSection]);

  var registerSection = useCallback(
  function (id, defaultExpanded, _ref2) {var onExpandStateChange = _ref2.current;
    setExpandedMap(function (expandedMap) {
      return setExpanded(
      id,
      defaultExpanded,
      expandedMap,
      expandSingleSection);

    });
    eventMapRef.current = _objectSpread(_objectSpread({}, eventMapRef.current), {}, _defineProperty({}, id, onExpandStateChange));
    return function () {
      setExpandedMap(function (expandedMap) {return omit(expandedMap, id);});
      eventMapRef.current = omit(
      /** @type {!Object} */(eventMapRef.current),
      id);

    };
  },
  [expandSingleSection]);


  var toggleExpanded = useCallback(
  function (id, opt_expand) {
    setExpandedMap(function (expandedMap) {
      var newExpanded = opt_expand !== null && opt_expand !== void 0 ? opt_expand : !expandedMap[id];
      var newExpandedMap = setExpanded(
      id,
      newExpanded,
      expandedMap,
      expandSingleSection);


      // Schedule a single microtask to fire events for
      // all changed sections (order not defined)
      _resolvedPromise().then(function () {
        for (var k in expandedMap) {
          var onExpandStateChange = eventMapRef.current[k];
          if (onExpandStateChange && expandedMap[k] != newExpandedMap[k]) {
            onExpandStateChange(newExpandedMap[k]);
          }
        }
      });
      return newExpandedMap;
    });
  },
  [expandSingleSection]);


  var isExpanded = useCallback(
  function (id, defaultExpanded) {var _expandedMap$id;return (_expandedMap$id = expandedMap[id]) !== null && _expandedMap$id !== void 0 ? _expandedMap$id : defaultExpanded;},
  [expandedMap]);


  var toggle = useCallback(
  function (id) {
    if (id) {
      if (id in expandedMap) {
        toggleExpanded(id);
      }
    } else {
      // Toggle all should do nothing when expandSingleSection is true
      if (!expandSingleSection) {
        for (var k in expandedMap) {
          toggleExpanded(k);
        }
      }
    }
  },
  [expandedMap, toggleExpanded, expandSingleSection]);


  var expand = useCallback(
  function (id) {
    if (id) {
      if (!isExpanded(id, true)) {
        toggleExpanded(id);
      }
    } else {
      // Expand all should do nothing when expandSingleSection is true
      if (!expandSingleSection) {
        for (var k in expandedMap) {
          if (!isExpanded(k, true)) {
            toggleExpanded(k);
          }
        }
      }
    }
  },
  [expandedMap, toggleExpanded, isExpanded, expandSingleSection]);


  var collapse = useCallback(
  function (id) {
    if (id) {
      if (isExpanded(id, false)) {
        toggleExpanded(id);
      }
    } else {
      for (var k in expandedMap) {
        if (isExpanded(k, false)) {
          toggleExpanded(k);
        }
      }
    }
  },
  [expandedMap, toggleExpanded, isExpanded]);


  useImperativeHandle(
  ref,
  function () {return (
      /** @type {!AccordionDef.AccordionApi} */({
        toggle: toggle,
        expand: expand,
        collapse: collapse }));},

  [toggle, collapse, expand]);


  var context = useMemo(
  function () {return (
      /** @type {!AccordionDef.AccordionContext} */({
        registerSection: registerSection,
        toggleExpanded: toggleExpanded,
        isExpanded: isExpanded,
        animate: animate,
        prefix: prefix }));},

  [registerSection, toggleExpanded, isExpanded, animate, prefix]);


  return (
    Preact.createElement(Comp, _objectSpread({ id: id }, rest),
    Preact.createElement(AccordionContext.Provider, { value: context },
    children)));



}

var Accordion = forwardRef(AccordionWithRef);
Accordion.displayName = 'Accordion'; // Make findable for tests.
export { Accordion };

/**
 * @param {string} id
 * @param {boolean} value
 * @param {!Object<string, boolean>} expandedMap
 * @param {boolean} expandSingleSection
 * @return {!Object<string, boolean>}
 */
function setExpanded(id, value, expandedMap, expandSingleSection) {
  var newExpandedMap;
  if (expandSingleSection && value) {
    newExpandedMap = _defineProperty({}, id, value);
    for (var k in expandedMap) {
      if (k != id) {
        newExpandedMap[k] = false;
      }
    }
  } else {
    newExpandedMap = _objectSpread(_objectSpread({}, expandedMap), {}, _defineProperty({}, id, value));
  }
  return newExpandedMap;
}

/**
 * @param {!AccordionDef.AccordionSectionProps} props
 * @return {PreactDef.Renderable}
 */
export function AccordionSection(_ref3)







{var _ref3$animate = _ref3.animate,defaultAnimate = _ref3$animate === void 0 ? false : _ref3$animate,_ref3$as = _ref3.as,Comp = _ref3$as === void 0 ? 'section' : _ref3$as,children = _ref3.children,_ref3$expanded = _ref3.expanded,defaultExpanded = _ref3$expanded === void 0 ? false : _ref3$expanded,propId = _ref3.id,onExpandStateChange = _ref3.onExpandStateChange,rest = _objectWithoutProperties(_ref3, _excluded2);
  var _useState5 = useState(generateSectionId),_useState6 = _slicedToArray(_useState5, 1),genId = _useState6[0];
  var id = propId || genId;
  var _useState7 = useState(generateRandomId),_useState8 = _slicedToArray(_useState7, 1),suffix = _useState8[0];
  var _useState9 = useState(defaultExpanded),_useState10 = _slicedToArray(_useState9, 2),expandedState = _useState10[0],setExpandedState = _useState10[1];
  var _useState11 = useState(null),_useState12 = _slicedToArray(_useState11, 2),contentIdState = _useState12[0],setContentIdState = _useState12[1];
  var _useState13 = useState(null),_useState14 = _slicedToArray(_useState13, 2),headerIdState = _useState14[0],setHeaderIdState = _useState14[1];

  var _useContext =





  useContext(AccordionContext),contextAnimate = _useContext.animate,isExpanded = _useContext.isExpanded,prefix = _useContext.prefix,registerSection = _useContext.registerSection,toggleExpanded = _useContext.toggleExpanded;

  var expanded = isExpanded ? isExpanded(id, defaultExpanded) : expandedState;
  var animate = contextAnimate !== null && contextAnimate !== void 0 ? contextAnimate : defaultAnimate;
  var contentId =
  contentIdState || "".concat(prefix || 'a', "-content-").concat(id, "-").concat(suffix);
  var headerId = headerIdState || "".concat(prefix || 'a', "-header-").concat(id, "-").concat(suffix);

  // Storing this state change callback in a ref because this may change
  // frequently and we do not want to trigger a re-register of the section
  // each time  the callback is updated
  var onExpandStateChangeRef = useRef(
  /** @type {?function(boolean):undefined|undefined} */(null));

  onExpandStateChangeRef.current = onExpandStateChange;
  useLayoutEffect(function () {
    if (registerSection) {
      return registerSection(id, defaultExpanded, onExpandStateChangeRef);
    }
  }, [registerSection, id, defaultExpanded]);

  var toggleHandler = useCallback(
  function (opt_expand) {
    if (toggleExpanded) {
      toggleExpanded(id, opt_expand);
    } else {
      setExpandedState(function (prev) {
        var newValue = opt_expand !== null && opt_expand !== void 0 ? opt_expand : !prev;
        _resolvedPromise2().then(function () {
          var onExpandStateChange = onExpandStateChangeRef.current;
          if (onExpandStateChange) {
            onExpandStateChange(newValue);
          }
        });
        return newValue;
      });
    }
  },
  [id, toggleExpanded]);


  var context = useMemo(
  function () {return (
      /** @type {AccordionDef.SectionContext} */({
        animate: animate,
        contentId: contentId,
        headerId: headerId,
        expanded: expanded,
        toggleHandler: toggleHandler,
        setContentId: setContentIdState,
        setHeaderId: setHeaderIdState }));},

  [animate, contentId, headerId, expanded, toggleHandler]);


  return (
    Preact.createElement(Comp, _objectSpread(_objectSpread({}, rest), {}, { expanded: expanded }),
    Preact.createElement(SectionContext.Provider, { value: context },
    children)));



}

/**
 * @param {!AccordionDef.AccordionHeaderProps} props
 * @return {PreactDef.Renderable}
 */
export function AccordionHeader(_ref4)







{var _ref4$as = _ref4.as,Comp = _ref4$as === void 0 ? 'div' : _ref4$as,children = _ref4.children,_ref4$className = _ref4.className,className = _ref4$className === void 0 ? '' : _ref4$className,id = _ref4.id,_ref4$role = _ref4.role,role = _ref4$role === void 0 ? 'button' : _ref4$role,_ref4$tabIndex = _ref4.tabIndex,tabIndex = _ref4$tabIndex === void 0 ? 0 : _ref4$tabIndex,rest = _objectWithoutProperties(_ref4, _excluded3);
  var _useContext2 =
  useContext(SectionContext),contentId = _useContext2.contentId,expanded = _useContext2.expanded,headerId = _useContext2.headerId,setHeaderId = _useContext2.setHeaderId,toggleHandler = _useContext2.toggleHandler;


  useLayoutEffect(function () {
    if (setHeaderId) {
      setHeaderId(id);
    }
  }, [setHeaderId, id]);

  return (
    Preact.createElement(Comp, _objectSpread(_objectSpread({},
    rest), {}, {
      id: headerId,
      role: role,
      className: "".concat(className, " ").concat(_$sectionChild, " ").concat(_$header),
      tabIndex: tabIndex,
      "aria-controls": contentId,
      onClick: function onClick() {return toggleHandler();},
      "aria-expanded": String(expanded) }),

    children));


}

/**
 * @param {!AccordionDef.AccordionContentProps} props
 * @return {PreactDef.Renderable}
 */
export function AccordionContent(_ref5)






{var _ref5$as = _ref5.as,Comp = _ref5$as === void 0 ? 'div' : _ref5$as,children = _ref5.children,_ref5$className = _ref5.className,className = _ref5$className === void 0 ? '' : _ref5$className,id = _ref5.id,_ref5$role = _ref5.role,role = _ref5$role === void 0 ? 'region' : _ref5$role,rest = _objectWithoutProperties(_ref5, _excluded4);
  var ref = useRef(null);
  var hasMountedRef = useRef(false);
  var _useContext3 =
  useContext(SectionContext),animate = _useContext3.animate,contentId = _useContext3.contentId,expanded = _useContext3.expanded,headerId = _useContext3.headerId,setContentId = _useContext3.setContentId;


  useEffect(function () {
    hasMountedRef.current = true;
    return function () {return (hasMountedRef.current = false);};
  }, []);

  useLayoutEffect(function () {
    if (setContentId) {
      setContentId(id);
    }
  }, [setContentId, id]);

  useLayoutEffect(function () {
    var hasMounted = hasMountedRef.current;
    var content = ref.current;
    if (!animate || !hasMounted || !content || !content.animate) {
      return;
    }
    return expanded ? animateExpand(content) : animateCollapse(content);
  }, [expanded, animate]);

  return (
    Preact.createElement(WithAmpContext, { renderable: expanded },
    Preact.createElement(Comp, _objectSpread(_objectSpread({},
    rest), {}, {
      ref: ref,
      className: ((((((((('' + (((
      true ? className : '')))))) + (((
      true ? ' ' + _$sectionChild2 : '')))))) + (((
      !expanded ? ' ' + _$contentHidden : '')))))),

      id: contentId,
      "aria-labelledby": headerId,
      role: role }),

    children)));



}
// /Users/mszylkowski/src/amphtml/extensions/amp-accordion/1.0/component.js