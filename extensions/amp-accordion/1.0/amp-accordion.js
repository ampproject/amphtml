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
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionSection,
} from './accordion';
import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-accordion-1.0.css';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {
  childElementsByTag,
  dispatchCustomEvent,
  toggleAttribute,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {devAssert, userAssert} from '../../../src/log';
import {dict, memo} from '../../../src/utils/object';
import {forwardRef} from '../../../src/preact/compat';
import {isExperimentOn} from '../../../src/experiments';
import {toArray, toWin} from '../../../src/types';
import {useImperativeHandle, useLayoutEffect} from '../../../src/preact';

/** @const {string} */
const TAG = 'amp-accordion';

const SECTION_SHIM_PROP = '__AMP_S_SHIM';
const HEADER_SHIM_PROP = '__AMP_H_SHIM';
const CONTENT_SHIM_PROP = '__AMP_C_SHIM';
const SECTION_POST_RENDER = '__AMP_PR';
const EXPAND_STATE_SHIM_PROP = '__AMP_EXPAND_STATE_SHIM';

const isDisplayLockingEnabledForAccordion = (win) =>
  isExperimentOn(win, 'amp-accordion-display-locking') &&
  win.document.body.onbeforematch !== undefined;

/** @extends {PreactBaseElement<AccordionDef.AccordionApi>} */
class AmpAccordion extends PreactBaseElement {
  /** @override */
  init() {
    this.registerApiAction('toggle', (api, invocation) =>
      api./*OK*/ toggle(invocation.args && invocation.args['section'])
    );
    this.registerApiAction('expand', (api, invocation) =>
      api./*OK*/ expand(invocation.args && invocation.args['section'])
    );
    this.registerApiAction('collapse', (api, invocation) =>
      api./*OK*/ collapse(invocation.args && invocation.args['section'])
    );

    const {element} = this;
    const experimentDisplayLocking = isDisplayLockingEnabledForAccordion(
      this.win
    );
    if (experimentDisplayLocking) {
      element.classList.add('i-amphtml-display-locking');
    }

    const mu = new MutationObserver(() => {
      this.mutateProps(getState(element, mu));
    });
    mu.observe(element, {
      attributeFilter: ['expanded', 'id'],
      subtree: true,
      childList: true,
    });

    const {'children': children} = getState(element, mu);
    return dict({
      'experimentDisplayLocking': experimentDisplayLocking,
      'children': children,
    });
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
    // TODO(wg-bento): This implementation causes infinite loops on DOM mutation.
    // See https://github.com/ampproject/amp-react-prototype/issues/40.
    if (!section[SECTION_POST_RENDER]) {
      section[SECTION_POST_RENDER] = () => mu.takeRecords();
    }

    const sectionShim = memo(
      section,
      SECTION_SHIM_PROP,
      bindSectionShimToElement
    );
    const headerShim = memo(section, HEADER_SHIM_PROP, bindHeaderShimToElement);
    const contentShim = memo(
      section,
      CONTENT_SHIM_PROP,
      bindContentShimToElement
    );
    const expandStateShim = memo(
      section,
      EXPAND_STATE_SHIM_PROP,
      getExpandStateTrigger
    );
    const sectionProps = dict({
      'key': section,
      'as': sectionShim,
      'expanded': section.hasAttribute('expanded'),
      'id': section.getAttribute('id'),
      'onExpandStateChange': expandStateShim,
    });
    const headerProps = dict({
      'as': headerShim,
      'id': section.firstElementChild.getAttribute('id'),
    });
    const contentProps = dict({
      'as': contentShim,
      'id': section.lastElementChild.getAttribute('id'),
    });
    return (
      <AccordionSection {...sectionProps}>
        <AccordionHeader {...headerProps}></AccordionHeader>
        <AccordionContent {...contentProps}></AccordionContent>
      </AccordionSection>
    );
  });
  return dict({'children': children});
}

/**
 * @param {!Element} section
 * @return {Function}
 */
function getExpandStateTrigger(section) {
  const action = Services.actionServiceForDoc(section);
  const triggerEvent = (expanded) => {
    const eventName = expanded ? 'expand' : 'collapse';
    const event = createCustomEvent(
      toWin(section.ownerDocument.defaultView),
      `accordionSection.${eventName}`,
      dict()
    );
    action.trigger(section, eventName, event, ActionTrust.HIGH);
    dispatchCustomEvent(section, name);
  };
  return triggerEvent;
}

/**
 * @param {!Element} sectionElement
 * @param {!AccordionDef.SectionShimProps} props
 * @return {PreactDef.Renderable}
 */
function SectionShim(sectionElement, {expanded, children}) {
  useLayoutEffect(() => {
    toggleAttribute(sectionElement, 'expanded', expanded);
    if (sectionElement[SECTION_POST_RENDER]) {
      sectionElement[SECTION_POST_RENDER]();
    }
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
 * @param {!AccordionDef.HeaderShimProps} props
 * @return {PreactDef.Renderable}
 */
function HeaderShim(
  sectionElement,
  {
    id,
    role,
    onClick,
    'aria-controls': ariaControls,
    'aria-expanded': ariaExpanded,
  }
) {
  const headerElement = sectionElement.firstElementChild;
  useLayoutEffect(() => {
    if (!headerElement || !onClick) {
      return;
    }
    headerElement.setAttribute('id', id);
    headerElement.classList.add('i-amphtml-accordion-header');
    headerElement.addEventListener('click', onClick);
    if (!headerElement.hasAttribute('tabindex')) {
      headerElement.setAttribute('tabindex', 0);
    }
    headerElement.setAttribute('aria-expanded', ariaExpanded);
    headerElement.setAttribute('aria-controls', ariaControls);
    headerElement.setAttribute('role', role);
    if (sectionElement[SECTION_POST_RENDER]) {
      sectionElement[SECTION_POST_RENDER]();
    }
    return () => {
      headerElement.removeEventListener('click', devAssert(onClick));
    };
  }, [
    sectionElement,
    headerElement,
    id,
    role,
    onClick,
    ariaControls,
    ariaExpanded,
  ]);
  return <header />;
}

/**
 * @param {!Element} element
 * @return {function(!AccordionDef.HeaderProps):PreactDef.Renderable}
 */
const bindHeaderShimToElement = (element) => HeaderShim.bind(null, element);

/**
 * @param {!Element} sectionElement
 * @param {!AccordionDef.ContentShimProps} props
 * @param {{current: ?}} ref
 * @return {PreactDef.Renderable}
 */
function ContentShimWithRef(
  sectionElement,
  {id, role, 'aria-labelledby': ariaLabelledBy},
  ref
) {
  const contentElement = sectionElement.lastElementChild;
  useImperativeHandle(ref, () => contentElement, [contentElement]);
  useLayoutEffect(() => {
    if (!contentElement) {
      return;
    }
    contentElement.classList.add('i-amphtml-accordion-content');
    contentElement.setAttribute('id', id);
    contentElement.setAttribute('role', role);
    contentElement.setAttribute('aria-labelledby', ariaLabelledBy);
    if (sectionElement[SECTION_POST_RENDER]) {
      sectionElement[SECTION_POST_RENDER]();
    }
  }, [sectionElement, contentElement, id, role, ariaLabelledBy]);
  return <div />;
}

/**
 * @param {!Element} element
 * @return {function(!AccordionDef.ContentProps):PreactDef.Renderable}
 */
const bindContentShimToElement = (element) =>
  forwardRef(
    /** @type {function(?, {current:?}):PreactDef.Renderable} */ (ContentShimWithRef.bind(
      null,
      element
    ))
  );

/** @override */
AmpAccordion['Component'] = Accordion;

/** @override */
AmpAccordion['detached'] = true;

/** @override */
AmpAccordion['props'] = {
  'animate': {attr: 'animate', type: 'boolean'},
  'expandSingleSection': {attr: 'expand-single-section', type: 'boolean'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAccordion, CSS);
});
