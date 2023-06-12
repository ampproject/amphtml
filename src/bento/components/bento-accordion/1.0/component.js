import objstr from 'obj-str';

import {
  randomIdGenerator,
  sequentialIdGenerator,
} from '#core/data-structures/id-generator';
import {omit} from '#core/types/object';

import * as Preact from '#preact';
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
import {forwardRef} from '#preact/compat';
import {WithAmpContext} from '#preact/context';
import {propName, tabindexFromProps} from '#preact/utils';

import {animateCollapse, animateExpand} from './animations';
import {useStyles} from './component.jss';

const AccordionContext = Preact.createContext(
  /** @type {BentoAccordionDef.AccordionContext} */ ({})
);

const SectionContext = Preact.createContext(
  /** @type {BentoAccordionDef.SectionContext} */ ({})
);

/** @type {!{[key: string]: boolean}} */
const EMPTY_EXPANDED_MAP = {};

/** @type {!{[key: string]: function(boolean):undefined|undefined}} */
const EMPTY_EVENT_MAP = {};

const generateSectionId = sequentialIdGenerator();
const generateRandomId = randomIdGenerator(100000);

/**
 * @param {!BentoAccordionDef.BentoAccordionProps} props
 * @param {{current: ?BentoAccordionDef.AccordionApi}} ref
 * @return {PreactDef.Renderable}
 */
function BentoAccordionWithRef(
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
      /** @type {!BentoAccordionDef.AccordionApi} */ ({
        toggle,
        expand,
        collapse,
      }),
    [toggle, collapse, expand]
  );

  const context = useMemo(
    () =>
      /** @type {!BentoAccordionDef.AccordionContext} */ ({
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

const BentoAccordion = forwardRef(BentoAccordionWithRef);
BentoAccordion.displayName = 'Accordion'; // Make findable for tests.
export {BentoAccordion};

/**
 * @param {string} id
 * @param {boolean} value
 * @param {!{[key: string]: boolean}} expandedMap
 * @param {boolean} expandSingleSection
 * @return {!{[key: string]: boolean}}
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
 * @param {!BentoAccordionDef.BentoAccordionSectionProps} props
 * @return {PreactDef.Renderable}
 */
export function BentoAccordionSection({
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
      /** @type {BentoAccordionDef.SectionContext} */ ({
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
    <Comp {...rest}>
      <SectionContext.Provider value={context}>
        {children}
      </SectionContext.Provider>
    </Comp>
  );
}

/**
 * @param {!BentoAccordionDef.BentoAccordionHeaderProps} props
 * @return {PreactDef.Renderable}
 */
export function BentoAccordionHeader({
  as: Comp = 'div',
  children,
  id,
  role = 'button',
  [propName('class')]: className = '',
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
      class={`${className} ${classes.sectionChild} ${classes.header}`}
      tabindex={tabindexFromProps(rest)}
      aria-controls={contentId}
      onClick={() => toggleHandler()}
      aria-expanded={String(expanded)}
    >
      {children}
    </Comp>
  );
}

/**
 * @param {!BentoAccordionDef.BentoAccordionContentProps} props
 * @return {PreactDef.Renderable}
 */
export function BentoAccordionContent({
  as: Comp = 'div',
  children,
  id,
  role = 'region',
  [propName('class')]: className = '',
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
        class={objstr({
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
