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
import {omit} from '../../../src/utils/object';
import {sequentialIdGenerator} from '../../../src/utils/id-generator';
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from '../../../src/preact';

const AccordionContext = Preact.createContext(
  /** @type {AccordionDef.ContextProps} */ ({})
);

/** @type {!Object<string, boolean>} */
const EMPTY_EXPANDED_MAP = {};

const generateSectionId = sequentialIdGenerator();

/**
 * @param {!AccordionDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Accordion({
  as: Comp = 'section',
  expandSingleSection = false,
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
      }),
    [expandedMap, registerSection, toggleExpanded]
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
  header,
  children,
  ...rest
}) {
  const [id] = useState(generateSectionId);
  const [expandedState, setExpandedState] = useState(defaultExpanded);

  const {registerSection, isExpanded, toggleExpanded} = useContext(
    AccordionContext
  );

  useLayoutEffect(() => {
    if (registerSection) {
      registerSection(id, defaultExpanded);
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

  return (
    <Comp {...rest} expanded={expanded} aria-expanded={String(expanded)}>
      <HeaderComp role="button" onClick={expandHandler}>
        {header}
      </HeaderComp>
      <ContentComp hidden={!expanded}>{children}</ContentComp>
    </Comp>
  );
}
