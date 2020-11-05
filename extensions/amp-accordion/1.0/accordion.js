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
  /** @type {AccordionDef.ContextProps} */ ({})
);

/** @type {!Object<string, boolean>} */
const EMPTY_EXPANDED_MAP = {};

const generateSectionId = sequentialIdGenerator();
const generateRandomId = randomIdGenerator(100000);

/**
 * @param {!AccordionDef.Props} props
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
  const eventMap = useRef(/** @type {!Object} */ ({}));
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
    (id, defaultExpanded, {onExpandStateChange}) => {
      setExpandedMap((expandedMap) => {
        return setExpanded(
          id,
          defaultExpanded,
          expandedMap,
          expandSingleSection
        );
      });
      eventMap.current[id] = onExpandStateChange;
      return () => {
        setExpandedMap((expandedMap) => omit(expandedMap, id));
        eventMap.current = omit(/** @type {!Object} */ (eventMap.current), id);
      };
    },
    [expandSingleSection]
  );

  const toggleExpanded = useCallback(
    (id) => {
      let newValue;
      setExpandedMap((expandedMap) => {
        newValue = !expandedMap[id];
        return setExpanded(id, newValue, expandedMap, expandSingleSection);
      });
      const onExpandStateChange = eventMap.current[id];
      if (onExpandStateChange) {
        onExpandStateChange(newValue);
      }
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
      /** @type {!AccordionDef.ContextProps} */ ({
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
 * @param {!AccordionDef.SectionProps} props
 * @return {PreactDef.Renderable}
 */
export function AccordionSection({
  as: Comp = 'section',
  headerAs: HeaderComp = 'header',
  contentAs: ContentComp = 'div',
  expanded: defaultExpanded = false,
  animate: defaultAnimate = false,
  headerClassName = '',
  contentClassName = '',
  id: propId,
  header,
  children,
  onExpandStateChange,
  ...rest
}) {
  const [genId] = useState(generateSectionId);
  const id = propId || genId;
  const [suffix] = useState(generateRandomId);
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const contentRef = useRef(null);
  const hasMountedRef = useRef(false);
  const classes = useStyles();

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

  useEffect(() => {
    hasMountedRef.current = true;
    return () => (hasMountedRef.current = false);
  }, []);

  const sectionPropsRef = useRef(
    /** @type {?AccordionDef.SectionPropsRef} */ (null)
  );
  sectionPropsRef.current = {onExpandStateChange};
  useLayoutEffect(() => {
    if (registerSection) {
      return registerSection(id, defaultExpanded, sectionPropsRef.current);
    }
  }, [registerSection, id, defaultExpanded]);

  const expandHandler = useCallback(() => {
    if (toggleExpanded) {
      toggleExpanded(id);
    } else {
      setExpandedState((prev) => !prev);
    }
  }, [id, toggleExpanded]);

  useLayoutEffect(() => {
    const hasMounted = hasMountedRef.current;
    const content = contentRef.current;
    if (!animate || !hasMounted || !content || !content.animate) {
      return;
    }
    return expanded ? animateExpand(content) : animateCollapse(content);
  }, [expanded, animate]);

  return (
    <Comp {...rest} expanded={expanded}>
      <HeaderComp
        role="button"
        className={`${headerClassName} ${classes.sectionChild} ${classes.header}`}
        aria-controls={contentId}
        tabIndex="0"
        onClick={expandHandler}
        aria-expanded={String(expanded)}
      >
        {header}
      </HeaderComp>
      <ContentComp
        ref={contentRef}
        className={`${contentClassName} ${classes.sectionChild} ${classes.content}`}
        id={contentId}
        hidden={!expanded}
      >
        {children}
      </ContentComp>
    </Comp>
  );
}
