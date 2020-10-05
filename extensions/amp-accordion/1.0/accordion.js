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
  useMemo,
  useState,
} from '../../../src/preact';

const AccordionContext = Preact.createContext(
  /** @type {AccordionDef.ContextProps} */ ({})
);

/** @type {!Object<string, boolean>} */
const EMPTY_EXPANDED_SET = {};

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
  const [expandedSet, setExpandedSet] = useState(EMPTY_EXPANDED_SET);

  useEffect(() => {
    if (!expandSingleSection) {
      return;
    }
    setExpandedSet((expandedSet) => {
      const newExpandedSet = {};
      let expanded = 0;
      for (const k in expandedSet) {
        newExpandedSet[k] = expandedSet[k] && expanded++ == 0;
      }
      return newExpandedSet;
    });
  }, [expandSingleSection]);

  const registerSection = useCallback((id) => {
    return () => setExpandedSet((expandedSet) => omit(expandedSet, id));
  }, []);

  const toggleExpanded = useCallback(
    (id, defaultExpanded) => {
      setExpandedSet((expandedSet) => {
        const newValue = !isExpanded(
          id,
          defaultExpanded,
          expandedSet,
          expandSingleSection
        );
        let newExpandedSet;
        if (newValue && expandSingleSection) {
          newExpandedSet = {[id]: newValue};
          for (const k in expandedSet) {
            if (k != id) {
              newExpandedSet[k] = false;
            }
          }
        } else {
          newExpandedSet = {...expandedSet, [id]: newValue};
        }
        return newExpandedSet;
      });
    },
    [expandSingleSection]
  );

  const context = useMemo(
    () =>
      /** @type {!AccordionDef.ContextProps} */ ({
        registerSection,
        toggleExpanded,
        isExpanded: (id, defaultExpanded) =>
          isExpanded(id, defaultExpanded, expandedSet, expandSingleSection),
      }),
    [expandedSet, expandSingleSection, registerSection, toggleExpanded]
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
 * @param {boolean} defaultExpanded
 * @param {!Object<string, boolean>} expandedSet
 * @param {boolean} expandSingleSection
 * @return {boolean}
 */
function isExpanded(id, defaultExpanded, expandedSet, expandSingleSection) {
  const current = expandedSet[id];
  if (current != null) {
    return current;
  }
  const adjDefaultExpanded = expandSingleSection
    ? Object.values(expandedSet).includes(true)
      ? false
      : defaultExpanded
    : defaultExpanded;
  return adjDefaultExpanded;
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

  useEffect(() => registerSection && registerSection(id), [
    registerSection,
    id,
  ]);

  const expandHandler = useCallback(() => {
    if (toggleExpanded) {
      toggleExpanded(id, defaultExpanded);
    } else {
      setExpandedState((prev) => !prev);
    }
  }, [id, toggleExpanded, defaultExpanded]);

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
