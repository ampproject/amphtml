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
import {omit} from '../../../src/utils/object';
import {sequentialIdGenerator} from '../../../src/utils/id-generator';
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';

const AccordionContext = Preact.createContext(
  /** @type {AccordionDef.ContextProps} */ ({})
);

/** @type {!Object<string, boolean>} */
const EMPTY_EXPANDED_MAP = {};

const generateSectionId = sequentialIdGenerator();

const CHILD_STYLE = {
  // Make animations measurable. Without this, padding and margin can skew
  // animations.
  boxSizing: 'border-box',
  // Cancel out the margin collapse. Also helps with animations to avoid
  // overflow.
  overflow: 'hidden',
  // Ensure that any absolute elements are positioned within the section.
  position: 'relative',
};

/**
 * @param {!AccordionDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Accordion({
  as: Comp = 'section',
  expandSingleSection = false,
  animate = false,
  children,
  ...rest
}) {
  const [expandedMap, setExpandedMap] = useState(EMPTY_EXPANDED_MAP);

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
    (id, defaultExpanded) => {
      setExpandedMap((expandedMap) => {
        return setExpanded(
          id,
          defaultExpanded,
          expandedMap,
          expandSingleSection
        );
      });
      return () => setExpandedMap((expandedMap) => omit(expandedMap, id));
    },
    [expandSingleSection]
  );

  const toggleExpanded = useCallback(
    (id) => {
      setExpandedMap((expandedMap) => {
        const newValue = !expandedMap[id];
        return setExpanded(id, newValue, expandedMap, expandSingleSection);
      });
    },
    [expandSingleSection]
  );

  const context = useMemo(
    () =>
      /** @type {!AccordionDef.ContextProps} */ ({
        registerSection,
        toggleExpanded,
        isExpanded: (id, defaultExpanded) => expandedMap[id] ?? defaultExpanded,
        animate,
      }),
    [animate, expandedMap, registerSection, toggleExpanded]
  );

  return (
    <Comp {...rest}>
      <AccordionContext.Provider value={context}>
        {children}
      </AccordionContext.Provider>
    </Comp>
  );
}

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
  header,
  children,
  ...rest
}) {
  const [id] = useState(generateSectionId);
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const contentRef = useRef(null);
  const hasMountedRef = useRef(false);

  const {
    registerSection,
    animate: contextAnimate,
    isExpanded,
    toggleExpanded,
  } = useContext(AccordionContext);

  useEffect(() => {
    hasMountedRef.current = true;
    return () => (hasMountedRef.current = false);
  }, []);

  useLayoutEffect(() => {
    if (registerSection) {
      return registerSection(id, defaultExpanded);
    }
  }, [registerSection, id, defaultExpanded]);

  const expandHandler = useCallback(() => {
    if (toggleExpanded) {
      toggleExpanded(id);
    } else {
      setExpandedState((prev) => !prev);
    }
  }, [id, toggleExpanded]);

  const expanded = isExpanded ? isExpanded(id, defaultExpanded) : expandedState;
  const animate = contextAnimate ?? defaultAnimate;

  useLayoutEffect(() => {
    const hasMounted = hasMountedRef.current;
    const content = contentRef.current;
    if (!animate || !hasMounted || !content || !content.animate) {
      return;
    }
    return expanded ? animateExpand(content) : animateCollapse(content);
  }, [expanded, animate]);

  return (
    <Comp {...rest} expanded={expanded} aria-expanded={String(expanded)}>
      <HeaderComp role="button" style={CHILD_STYLE} onClick={expandHandler}>
        {header}
      </HeaderComp>
      <ContentComp ref={contentRef} style={CHILD_STYLE} hidden={!expanded}>
        {children}
      </ContentComp>
    </Comp>
  );
}
