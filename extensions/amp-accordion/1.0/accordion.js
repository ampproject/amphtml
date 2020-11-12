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
import {animateCollapse, animateExpand} from './animations';
import {forwardRef} from '../../../src/preact/compat';
import {omit} from '../../../src/utils/object';
import {
  randomIdGenerator,
  sequentialIdGenerator,
} from '../../../src/utils/id-generator';
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
import {useStyles} from './accordion.jss';

const AccordionContext = Preact.createContext(
  /** @type {AccordionDef.AccordionContextProps} */ ({})
);
const SectionContext = Preact.createContext(
  /** @type {AccordionDef.SectionContextProps} */ ({})
);

/** @type {!Object<string, boolean>} */
const EMPTY_EXPANDED_MAP = {};

/** @type {!Object<string, function(boolean):undefined|undefined>} */
const EMPTY_EVENT_MAP = {};

const generateSectionId = sequentialIdGenerator();
const generateRandomId = randomIdGenerator(100000);

/**
 * @param {!AccordionDef.AccordionProps} props
 * @param {{current: (!AccordionDef.AccordionApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function AccordionWithRef(
  {
    as: Comp = 'section',
    expandSingleSection = false,
    animate = false,
    children,
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
    (id) => {
      setExpandedMap((expandedMap) => {
        const newExpandedMap = setExpanded(
          id,
          !expandedMap[id],
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
      /** @type {!AccordionDef.AccordionContextProps} */ ({
        registerSection,
        toggleExpanded,
        isExpanded,
        animate,
        prefix,
      }),
    [animate, registerSection, toggleExpanded, prefix, isExpanded]
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
  as: Comp = 'section',
  expanded: defaultExpanded = false,
  animate: defaultAnimate = false,
  id: propId,
  children,
  onExpandStateChange,
  ...rest
}) {
  const [genId] = useState(generateSectionId);
  const id = propId || genId;
  const [suffix] = useState(generateRandomId);
  const [expandedState, setExpandedState] = useState(defaultExpanded);

  const {
    registerSection,
    animate: contextAnimate,
    isExpanded,
    toggleExpanded,
    prefix,
  } = useContext(AccordionContext);

  const expanded = isExpanded ? isExpanded(id, defaultExpanded) : expandedState;
  const animate = contextAnimate ?? defaultAnimate;
  const contentId = `${prefix || 'a'}-content-${id}-${suffix}`;

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

  const expandHandler = useCallback(() => {
    if (toggleExpanded) {
      toggleExpanded(id);
    } else {
      setExpandedState((prev) => {
        const newValue = !prev;
        Promise.resolve().then(() => {
          const onExpandStateChange = onExpandStateChangeRef.current;
          if (onExpandStateChange) {
            onExpandStateChange(newValue);
          }
        });
        return newValue;
      });
    }
  }, [id, toggleExpanded]);

  const context = useMemo(
    () =>
      /** @type {AccordionDef.SectionContextProps} */ ({
        animate,
        contentId,
        expanded,
        expandHandler,
      }),
    [animate, contentId, expanded, expandHandler]
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
  as: Comp = 'header',
  role = 'button',
  className = '',
  tabIndex = 0,
  children,
  ...rest
}) {
  const {contentId, expanded, expandHandler} = useContext(SectionContext);
  const classes = useStyles();

  return (
    <Comp
      {...rest}
      role={role}
      className={`${className} ${classes.sectionChild} ${classes.header}`}
      tabIndex={tabIndex}
      aria-controls={contentId}
      onClick={expandHandler}
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
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null);
  const hasMountedRef = useRef(false);
  const {contentId, expanded, animate} = useContext(SectionContext);
  const classes = useStyles();

  useEffect(() => {
    hasMountedRef.current = true;
    return () => (hasMountedRef.current = false);
  }, []);

  useLayoutEffect(() => {
    const hasMounted = hasMountedRef.current;
    const content = ref.current;
    if (!animate || !hasMounted || !content || !content.animate) {
      return;
    }
    return expanded ? animateExpand(content) : animateCollapse(content);
  }, [expanded, animate]);

  return (
    <Comp
      {...rest}
      ref={ref}
      className={`${className} ${classes.sectionChild} ${classes.content}`}
      id={contentId}
      hidden={!expanded}
    >
      {children}
    </Comp>
  );
}
