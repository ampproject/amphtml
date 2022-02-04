import {devAssert} from '#core/assert';
import {toggleAttribute} from '#core/dom';
import {childElementsByTag} from '#core/dom/query';
import {toArray} from '#core/types/array';
import {memo} from '#core/types/object';

import * as Preact from '#preact';
import {useLayoutEffect, useRef} from '#preact';
import {PreactBaseElement} from '#preact/base-element';
import {forwardRef} from '#preact/compat';
import {useDOMHandle} from '#preact/component';
import {useSlotContext} from '#preact/slot';

import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from './component';

const HEADER_SHIM_PROP = '__AMP_H_SHIM';
const CONTENT_SHIM_PROP = '__AMP_C_SHIM';
const SECTION_POST_RENDER = '__AMP_PR';
const EXPAND_STATE_SHIM_PROP = '__AMP_EXPAND_STATE_SHIM';

/** @extends {PreactBaseElement<BentoAccordionDef.AccordionApi>} */
export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    const getExpandStateTrigger = (section) => (expanded) => {
      toggleAttribute(section, 'expanded', expanded);
      section[SECTION_POST_RENDER]?.();
      this.triggerEvent(section, expanded ? 'expand' : 'collapse');
    };

    const {element} = this;
    const mu = new MutationObserver(() => {
      this.mutateProps(getState(element, mu, getExpandStateTrigger));
    });
    mu.observe(element, {
      attributeFilter: ['expanded', 'id'],
      subtree: true,
      childList: true,
    });

    const {'children': children} = getState(element, mu, getExpandStateTrigger);
    return {
      'children': children,
    };
  }
}

/**
 * @param {!Element} element
 * @param {MutationObserver} mu
 * @param {!Function} getExpandStateTrigger
 * @return {!JsonObject}
 */
function getState(element, mu, getExpandStateTrigger) {
  const sections = toArray(childElementsByTag(element, 'section'));

  const children = sections.map((section) => {
    // TODO(wg-bento): This implementation causes infinite loops on DOM mutation.
    // See https://github.com/ampproject/amp-react-prototype/issues/40.
    if (!section[SECTION_POST_RENDER]) {
      section[SECTION_POST_RENDER] = () => mu.takeRecords();
    }

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
    const sectionProps = {
      'key': section,
      'expanded': section.hasAttribute('expanded'),
      'id': section.getAttribute('id'),
      'onExpandStateChange': expandStateShim,
    };
    // For headerProps and contentProps:
    // || undefined needed for the `role` attribute since an element w/o
    // role results in `null`.  When `null` is passed into Preact, the
    // default prop value is not used.  `undefined` triggers default prop
    // value.  This is not needed for `id` since this is handled with
    // explicit logic (not default prop value) and all falsy values are
    // handled the same.
    const headerProps = {
      'as': headerShim,
      'id': section.firstElementChild.getAttribute('id'),
      'role': section.firstElementChild.getAttribute('role') || undefined,
    };
    const contentProps = {
      'as': contentShim,
      'id': section.lastElementChild.getAttribute('id'),
      'role': section.lastElementChild.getAttribute('role') || undefined,
    };
    return (
      <BentoAccordionSection {...sectionProps}>
        <BentoAccordionHeader {...headerProps}></BentoAccordionHeader>
        <BentoAccordionContent {...contentProps}></BentoAccordionContent>
      </BentoAccordionSection>
    );
  });
  return {'children': children};
}

/**
 * @param {!Element} sectionElement
 * @param {!BentoAccordionDef.HeaderShimProps} props
 * @return {PreactDef.Renderable}
 */
function HeaderShim(
  sectionElement,
  {
    'aria-controls': ariaControls,
    'aria-expanded': ariaExpanded,
    id,
    onClick,
    role,
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
 * @return {function(!BentoAccordionDef.HeaderProps):PreactDef.Renderable}
 */
const bindHeaderShimToElement = (element) => HeaderShim.bind(null, element);

/**
 * @param {!Element} sectionElement
 * @param {!BentoAccordionDef.ContentShimProps} props
 * @param {{current: ?}} ref
 * @return {PreactDef.Renderable}
 */
function ContentShimWithRef(
  sectionElement,
  {'aria-labelledby': ariaLabelledBy, id, role},
  ref
) {
  const contentElement = sectionElement.lastElementChild;
  const contentRef = useRef();
  contentRef.current = contentElement;
  useSlotContext(contentRef);
  useDOMHandle(ref, contentElement);
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
 * @return {function(!BentoAccordionDef.ContentProps):PreactDef.Renderable}
 */
const bindContentShimToElement = (element) =>
  forwardRef(
    /** @type {function(?, {current:?}):PreactDef.Renderable} */ (
      ContentShimWithRef.bind(null, element)
    )
  );

/** @override */
BaseElement['Component'] = BentoAccordion;

/** @override */
BaseElement['detached'] = true;

/** @override */
BaseElement['props'] = {
  'animate': {attr: 'animate', type: 'boolean', media: true},
  'expandSingleSection': {
    attr: 'expand-single-section',
    type: 'boolean',
  },
};
