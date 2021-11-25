import {loadScript} from '#3p/3p';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper, useIntersectionObserver} from '#preact/component';
import {useMergeRefs} from '#preact/utils';

import {useStyles} from './component.jss';

/**
 * Displays given component with supplied props.
 * @param {*} props
 * @param {{current: ?Element}} ref
 * @return {PreactDef.Renderable}
 */
function DisplayAsWithRef({as: Comp = 'div', ...rest}, ref) {
  return <Comp {...rest} ref={ref} />;
}

const DisplayAs = forwardRef(DisplayAsWithRef);

/**
 * Checks whether given value is string or not.
 * @param value Value to be check
 * @return {boolean} True if value is string type
 */
function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]';
}

/**
 * @param {!BentoGpt.Props} props
 * @param {{current: (!BentoGptDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoGptWithRef(
  {
    adUnitPath,
    disableInitialLoad = false,
    fallback,
    height,
    optDiv,
    // For multi-size Gpt Ad - Omitted for now
    size,
    style,
    targeting,
    width,
    ...rest
  },
  ref
) {
  /** Styles */
  const classes = useStyles();
  //style.position = 'absolute';
  height = !height ? style.height : height;
  width = !width ? style.width : width;

  /** States */
  const [errorOnScriptLoad, setErrorOnScriptLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /** References */
  const gptAdDivRef = useRef(null);
  const gptAdSlotRef = useRef(null);
  const containerRef = useRef(ref);
  const fallbackDivRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const gptAdResponcereceivedRef = useRef(false);

  const showFallback = useCallback(
    (show) => {
      setErrorOnScriptLoad(show);
    },
    [setErrorOnScriptLoad]
  );

  /**
   * This callback will be executed when ContainerWrapper is in view.
   */
  const ioCallback = useCallback(
    ({isIntersecting}) => {
      if (!isIntersecting || disableInitialLoad) {
        return;
      }

      /**
       * If ad is directly in view, ioCallback will be executed before useEffect`
       * and thus `global.googletag` will be undefined.
       */
      if (global.googletag) {
        /** Register refresh when in View */
        global.googletag?.pubads().refresh([gptAdSlotRef.current]);
      } else {
        /** Register refresh when in View after 250ms */
        setTimeout(() => {
          global.googletag?.pubads().refresh([gptAdSlotRef.current]);
        }, 250);
      }
      inObRef(null);
    },
    [disableInitialLoad, inObRef]
  );
  const inObRef = useIntersectionObserver(ioCallback);

  /** Parsed Attributes */
  const parsedSize = useMemo(() => {
    return [parseInt(width, 10), parseInt(height, 10)];
  }, [width, height]);
  //const parsedSize = isString(size) ? JSON.parse(size) : size;
  const parsedTarget = isString(targeting) ? JSON.parse(targeting) : targeting;

  /**
   * Initializes Targets on Component Load
   */
  const initializeTargets = useCallback(
    (adSlot) => {
      if (parsedTarget) {
        /** Loop through all parsed keys and set targeting key-value pair */
        for (const key in parsedTarget) {
          adSlot.setTargeting(key, parsedTarget[key]);
        }
      }
    },
    [parsedTarget]
  );

  /**
   * Display GPT Ad
   */
  const display = useCallback(() => {
    global.googletag.display(gptAdDivRef.current);
  }, []);

  /**
   * Refresh GPT Ad
   */
  const refresh = useCallback(() => {
    global.googletag?.pubads().refresh([gptAdSlotRef.current]);
  }, []);

  /**
   * Initializes Google GPT Script and Service
   */
  const initialiseGpt = useCallback(() => {
    /** Retrieve Existing or Initializes New GPT Service */
    global.googletag = global.googletag || {cmd: []};

    /** Adds element to the execution queue */
    global.googletag.cmd.push(function () {
      global.bentoids.push(optDiv);

      /** Define slot and related parameters */
      gptAdSlotRef.current = global.googletag
        .defineSlot(adUnitPath, parsedSize, optDiv)
        .addService(global.googletag.pubads());

      /** Disable Initial Load */
      global.googletag.pubads().disableInitialLoad();

      /**
       * Note:  We can add multiple slots,
       *        but this is out of the scope of this component.
       */
      // scope.googletag
      //   .defineSlot('/21730346048/test-skyscraper', [120, 600], 'sample-div2')
      //   .addService(scope.googletag.pubads());

      global.googletag.pubads().addEventListener('slotRequested', function () {
        setIsLoading(true);
        fallbackTimerRef.current = setTimeout(() => {
          if (gptAdResponcereceivedRef.current === true) {
            return;
          }
          setIsLoading(false);
          showFallback(true);
        }, 2500);
      });

      global.googletag
        .pubads()
        .addEventListener('slotResponseReceived', function () {
          gptAdResponcereceivedRef.current = true;
          clearTimeout(fallbackTimerRef.current);
          setIsLoading(false);
          showFallback(false);
        });

      /** Enable Services */
      global.googletag.enableServices();

      initializeTargets(gptAdSlotRef.current);

      /** Display GPT Ad */
      display();
    });
  }, [
    adUnitPath,
    display,
    gptAdSlotRef,
    initializeTargets,
    optDiv,
    parsedSize,
    showFallback,
  ]);

  /** Gpt Component - API Functions */
  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoGptDef.Api} */ ({
        display,
        refresh,
      }),
    [display, refresh]
  );

  useEffect(() => {
    global.bentoids = global.bentoids || [];
    if (global.bentoids.indexOf(optDiv) > -1) {
      return;
    }

    /** Show loader, only if `disableInitialLoad` is `false */
    if (disableInitialLoad === false) {
      setIsLoading(true);
    }

    /**
     * Load `gpt.js` only once by checking `global.bentogpt` flag.
     */
    if (!global.bentogpt) {
      /** Set `global.bentogpt` so no more further requests are made for `gpt.js` */
      global.bentogpt = true;

      /** Load GPT Script async once component initialized */
      loadScript(
        global,
        'https://www.googletagservices.com/tag/js/gpt.js',
        () => {
          /** Script loaded successfully, now Initialize GPT Library for this component */
          initialiseGpt(global);
        },
        () => {
          /** Hide loader */
          setIsLoading(false);

          /** Error while loading `gpt.js` script, show fallback */
          showFallback(true);
        }
      );
    } else {
      /** `gpt.js` is already loaded, now Initialize GPT Library for this component */
      initialiseGpt(global);
    }
  }, [disableInitialLoad, initialiseGpt, optDiv, showFallback]);

  return (
    <ContainWrapper
      layout
      size
      paint
      {...rest}
      ref={useMergeRefs([containerRef, inObRef])}
      style={style}
    >
      {isLoading && (
        <div class={classes.loaderWrapper}>
          <div class={classes.loader}></div>
        </div>
      )}
      {!errorOnScriptLoad && (
        <div id={optDiv} ref={gptAdDivRef} style={{height, width}}></div>
      )}
      {errorOnScriptLoad && <DisplayAs as={fallback} ref={fallbackDivRef} />}
    </ContainWrapper>
  );
}

const BentoGpt = forwardRef(BentoGptWithRef);
BentoGpt.displayName = 'BentoGpt'; // Make findable for tests.
export {BentoGpt};
