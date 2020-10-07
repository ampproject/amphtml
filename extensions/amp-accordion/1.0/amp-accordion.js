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
import {Accordion, AccordionSection} from './accordion';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {childElementsByTag, toggleAttribute} from '../../../src/dom';
import {devAssert, userAssert} from '../../../src/log';
import {dict, memo} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {toArray} from '../../../src/types';
import {useLayoutEffect} from '../../../src/preact';

/** @const {string} */
const TAG = 'amp-accordion';

const SECTION_SHIM_PROP = '__AMP_S_SHIM';
const HEADER_SHIM_PROP = '__AMP_H_SHIM';

class AmpAccordion extends PreactBaseElement {
  /** @override */
  init() {
    const {element} = this;

    const mu = new MutationObserver(() => {
      this.mutateProps(getState(element, mu));
    });
    mu.observe(element, {
      attributeFilter: ['expanded'],
      subtree: true,
    });

    const {'children': children} = getState(element, mu);
    return dict({'children': children});
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'amp-accordion-bento'),
      'expected amp-accordion-bento experiment to be enabled'
    );
    return true;
  }
}

/**
 * @param {!Element} element
 * @param {MutationObserver} mu
 * @return {!JsonObject}
 */
function getState(element, mu) {
  const sections = toArray(childElementsByTag(element, 'section'));

  const children = sections.map((section) => {
    const sectionShim = memo(
      section,
      SECTION_SHIM_PROP,
      bindSectionShimToElement
    );
    const headerShim = memo(section, HEADER_SHIM_PROP, bindHeaderShimToElement);
    const expanded = section.hasAttribute('expanded');
    const props = dict({
      'key': section,
      'as': sectionShim,
      'headerAs': headerShim,
      'expanded': expanded,
      // TODO(wg-bento): This implementation causes infinite loops on DOM mutation.
      // See https://github.com/ampproject/amp-react-prototype/issues/40.
      'postRender': () => {
        // Skip mutations to avoid cycles.
        mu.takeRecords();
      },
    });
    return <AccordionSection {...props} />;
  });
  return dict({'children': children});
}

/**
 * @param {!Element} sectionElement
 * @param {!AccordionDef.SectionProps} props
 * @return {PreactDef.Renderable}
 */
function SectionShim(sectionElement, {expanded, children}) {
  useLayoutEffect(() => {
    toggleAttribute(sectionElement, 'expanded', expanded);
    sectionElement.setAttribute('aria-expanded', String(expanded));
  }, [sectionElement, expanded]);
  return children;
}

/**
 * @param {!Element} element
 * @return {function(!AccordionDef.SectionProps):PreactDef.Renderable}
 */
const bindSectionShimToElement = (element) => SectionShim.bind(null, element);

/**
 * @param {!Element} sectionElement
 * @param {!AccordionDef.HeaderProps} props
 * @return {PreactDef.Renderable}
 */
function HeaderShim(sectionElement, {onClick}) {
  const headerElement = sectionElement.firstElementChild;
  useLayoutEffect(() => {
    if (!headerElement || !onClick) {
      return;
    }
    headerElement.addEventListener('click', onClick);
    return () => {
      headerElement.removeEventListener('click', devAssert(onClick));
    };
  }, [headerElement, onClick]);
  return <header />;
}

/**
 * @param {!Element} element
 * @return {function(!AccordionDef.HeaderProps):PreactDef.Renderable}
 */
const bindHeaderShimToElement = (element) => HeaderShim.bind(null, element);

/** @override */
AmpAccordion['Component'] = Accordion;

/** @override */
AmpAccordion['detached'] = true;

/** @override */
AmpAccordion['props'] = {
  'expandSingleSection': {attr: 'expand-single-section', type: 'boolean'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAccordion);
});
