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

import * as Preact from '#preact';
import {WithAmpContext} from '#preact/context';
import {animateCollapse, animateExpand} from './animations';
import {forwardRef} from '#preact/compat';
import {omit} from '#core/types/object';
import {
  randomIdGenerator,
  sequentialIdGenerator,
} from '#core/math/id-generator';
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
import {useStyles} from './component.jss';
import objstr from 'obj-str';

const AccordionContext = Preact.createContext(
  /** @type {AccordionDef.AccordionContext} */ ({})
);

const SectionContext = Preact.createContext(
  /** @type {AccordionDef.SectionContext} */ ({})
);

/** @type {!Object<string, boolean>} */
const EMPTY_EXPANDED_MAP = {};

/** @type {!Object<string, function(boolean):undefined|undefined>} */
const EMPTY_EVENT_MAP = {};

const generateSectionId = sequentialIdGenerator();
const generateRandomId = randomIdGenerator(100000);

/**
 * @param {!AccordionDef.AccordionProps} props
 * @param {{current: ?AccordionDef.AccordionApi}} ref
 * @return {PreactDef.Renderable}
 */
function AccordionWithRef(
  {
    animate = false,
    as: Comp = 'section',
    children,
    expandSingleSection = false,
    id,
    ...rest
  },
  ref
) {
  const [expandedMap, setExpandedMap] = useState(EMPTY_EXPANDED_MAP);
  const eventMapRef = useRef(EMPTY_EVENT_MAP);
  const [randomPrefix] = useState(generateRandomId);
  const prefix = id || `a${randomPrefix}`;

  useEffect(() => {
    if (!expandSingleSection) {
      return;
    }
    setExpandedMap((expandedMap) => {
      const newExpandedMap = {};
      let expanded = 0;
      for (const k in expandedMap) {
        newExpandedMap[k] = expandedMap[k] && expanded++ == 0;
      }
      return newExpandedMap;
    });
  }, [expandSingleSection]);

  const registerSection = useCallback(
    (id, defaultExpanded, {current: onExpandStateChange}) => {
      setExpandedMap((expandedMap) => {
        return setExpanded(
          id,
          defaultExpanded,
          expandedMap,
          expandSingleSection
        );
      });
      eventMapRef.current = {...eventMapRef.current, [id]: onExpandStateChange};
      return () => {
        setExpandedMap((expandedMap) => omit(expandedMap, id));
        eventMapRef.current = omit(
          /** @type {!Object} */ (eventMapRef.current),
          id
        );
      };
    },
    [expandSingleSection]
  );

  const toggleExpanded = useCallback(
    (id, opt_expand) => {
      setExpandedMap((expandedMap) => {
        const newExpanded = opt_expand ?? !expandedMap[id];
        const newExpandedMap = setExpanded(
          id,
          newExpanded,
          expandedMap,
          expandSingleSection
        );

        // Schedule a single microtask to fire events for
        // all changed sections (order not defined)
        Promise.resolve().then(() => {
          for (const k in expandedMap) {
            const onExpandStateChange = eventMapRef.current[k];
            if (onExpandStateChange && expandedMap[k] != newExpandedMap[k]) {
              onExpandStateChange(newExpandedMap[k]);
            }
          }
        });
        return newExpandedMap;
      });
    },
    [expandSingleSection]
  );

  const isExpanded = useCallback(
    (id, defaultExpanded) => expandedMap[id] ?? defaultExpanded,
    [expandedMap]
  );

  const toggle = useCallback(
    (id) => {
      if (id) {
        if (id in expandedMap) {
          toggleExpanded(id);
        }
      } else {
        // Toggle all should do nothing when expandSingleSection is true
        if (!expandSingleSection) {
          for (const k in expandedMap) {
            toggleExpanded(k);
          }
        }
      }
    },
    [expandedMap, toggleExpanded, expandSingleSection]
  );

  const expand = useCallback(
    (id) => {
      if (id) {
        if (!isExpanded(id, true)) {
          toggleExpanded(id);
        }
      } else {
        // Expand all should do nothing when expandSingleSection is true
        if (!expandSingleSection) {
          for (const k in expandedMap) {
            if (!isExpanded(k, true)) {
              toggleExpanded(k);
            }
          }
        }
      }
    },
    [expandedMap, toggleExpanded, isExpanded, expandSingleSection]
  );

  const collapse = useCallback(
    (id) => {
      if (id) {
        if (isExpanded(id, false)) {
          toggleExpanded(id);
        }
      } else {
        for (const k in expandedMap) {
          if (isExpanded(k, false)) {
            toggleExpanded(k);
          }
        }
      }
    },
    [expandedMap, toggleExpanded, isExpanded]
  );

  useImperativeHandle(
    ref,
    () =>
      /** @type {!AccordionDef.AccordionApi} */ ({
        toggle,
        expand,
        collapse,
      }),
    [toggle, collapse, expand]
  );

  const context = useMemo(
    () =>
      /** @type {!AccordionDef.AccordionContext} */ ({
        registerSection,
        toggleExpanded,
        isExpanded,
        animate,
        prefix,
      }),
    [registerSection, toggleExpanded, isExpanded, animate, prefix]
  );

  return (
    <Comp id={id} {...rest}>
      <AccordionContext.Provider value={context}>
        {children}
      </AccordionContext.Provider>
    </Comp>
  );
}

const Accordion = forwardRef(AccordionWithRef);
Accordion.displayName = 'Accordion'; // Make findable for tests.
export {Accordion};

/**
 * @param {string} id
 * @param {boolean} value
 * @param {!Object<string, boolean>} expandedMap
 * @param {boolean} expandSingleSection
 * @return {!Object<string, boolean>}
 */
function setExpanded(id, value, expandedMap, expandSingleSection) {
  let newExpandedMap;
  if (expandSingleSection && value) {
    newExpandedMap = {[id]: value};
    for (const k in expandedMap) {
      if (k != id) {
        newExpandedMap[k] = false;
      }
    }
  } else {
    newExpandedMap = {...expandedMap, [id]: value};
  }
  return newExpandedMap;
}

/**
 * @param {!AccordionDef.AccordionSectionProps} props
 * @return {PreactDef.Renderable}
 */
export function AccordionSection({
  animate: defaultAnimate = false,
  as: Comp = 'section',
  children,
  expanded: defaultExpanded = false,
  id: propId,
  onExpandStateChange,
  ...rest
}) {
  const [genId] = useState(generateSectionId);
  const id = propId || genId;
  const [suffix] = useState(generateRandomId);
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const [contentIdState, setContentIdState] = useState(null);
  const [headerIdState, setHeaderIdState] = useState(null);

  const {
    animate: contextAnimate,
    isExpanded,
    prefix,
    registerSection,
    toggleExpanded,
  } = useContext(AccordionContext);

  const expanded = isExpanded ? isExpanded(id, defaultExpanded) : expandedState;
  const animate = contextAnimate ?? defaultAnimate;
  const contentId =
    contentIdState || `${prefix || 'a'}-content-${id}-${suffix}`;
  const headerId = headerIdState || `${prefix || 'a'}-header-${id}-${suffix}`;

  // Storing this state change callback in a ref because this may change
  // frequently and we do not want to trigger a re-register of the section
  // each time  the callback is updated
  const onExpandStateChangeRef = useRef(
    /** @type {?function(boolean):undefined|undefined} */ (null)
  );
  onExpandStateChangeRef.current = onExpandStateChange;
  useLayoutEffect(() => {
    if (registerSection) {
      return registerSection(id, defaultExpanded, onExpandStateChangeRef);
    }
  }, [registerSection, id, defaultExpanded]);

  const toggleHandler = useCallback(
    (opt_expand) => {
      if (toggleExpanded) {
        toggleExpanded(id, opt_expand);
      } else {
        setExpandedState((prev) => {
          const newValue = opt_expand ?? !prev;
          Promise.resolve().then(() => {
            const onExpandStateChange = onExpandStateChangeRef.current;
            if (onExpandStateChange) {
              onExpandStateChange(newValue);
            }
          });
          return newValue;
        });
      }
    },
    [id, toggleExpanded]
  );

  const context = useMemo(
    () =>
      /** @type {AccordionDef.SectionContext} */ ({
        animate,
        contentId,
        headerId,
        expanded,
        toggleHandler,
        setContentId: setContentIdState,
        setHeaderId: setHeaderIdState,
      }),
    [animate, contentId, headerId, expanded, toggleHandler]
  );

  return (
    <Comp {...rest} expanded={expanded}>
      <SectionContext.Provider value={context}>
        {children}
      </SectionContext.Provider>
    </Comp>
  );
}

/**
 * @param {!AccordionDef.AccordionHeaderProps} props
 * @return {PreactDef.Renderable}
 */
export function AccordionHeader({
  as: Comp = 'div',
  children,
  className = '',
  id,
  role = 'button',
  tabIndex = 0,
  ...rest
}) {
  const {contentId, expanded, headerId, setHeaderId, toggleHandler} =
    useContext(SectionContext);
  const classes = useStyles();

  useLayoutEffect(() => {
    if (setHeaderId) {
      setHeaderId(id);
    }
  }, [setHeaderId, id]);

  return (
    <Comp
      {...rest}
      id={headerId}
      role={role}
      className={`${className} ${classes.sectionChild} ${classes.header}`}
      tabIndex={tabIndex}
      aria-controls={contentId}
      onClick={() => toggleHandler()}
      aria-expanded={String(expanded)}
    >
      {children}
    </Comp>
  );
}

/**
 * @param {!AccordionDef.AccordionContentProps} props
 * @return {PreactDef.Renderable}
 */
export function AccordionContent({
  as: Comp = 'div',
  children,
  className = '',
  id,
  role = 'region',
  ...rest
}) {
  const ref = useRef(null);
  const hasMountedRef = useRef(false);
  const {animate, contentId, expanded, headerId, setContentId} =
    useContext(SectionContext);
  const classes = useStyles();

  useEffect(() => {
    hasMountedRef.current = true;
    return () => (hasMountedRef.current = false);
  }, []);

  useLayoutEffect(() => {
    if (setContentId) {
      setContentId(id);
    }
  }, [setContentId, id]);

  useLayoutEffect(() => {
    const hasMounted = hasMountedRef.current;
    const content = ref.current;
    if (!animate || !hasMounted || !content || !content.animate) {
      return;
    }
    return expanded ? animateExpand(content) : animateCollapse(content);
  }, [expanded, animate]);

  return (
    <WithAmpContext renderable={expanded}>
      <Comp
        {...rest}
        ref={ref}
        className={objstr({
          [className]: true,
          [classes.sectionChild]: true,
          [classes.contentHidden]: !expanded,
        })}
        id={contentId}
        aria-labelledby={headerId}
        role={role}
      >
        {children}
      </Comp>
    </WithAmpContext>
  );
}
