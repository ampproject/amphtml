import {loadScript} from '#3p/3p';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef} from '#preact';
import {ContainWrapper, useIntersectionObserver} from '#preact/component';
import {useMergeRefs} from '#preact/utils';
/**
 *
 * @param {*} x
 * @return {boolean} TODO
 */
function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

/**
 * @param {!BentoGpt.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoGpt({
  adUnitPath,
  disableInitialLoad = false,
  height,
  optDiv,
  size,
  targeting,
  width,
  ...rest
}) {
  /** References */
  const gptAdDivRef = useRef(null);
  const gptAdSlotRef = useRef(null);
  const containerRef = useRef(null);

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
    },
    [disableInitialLoad]
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
  const display = useCallback((adSlot) => {
    global.googletag.display(adSlot);
  }, []);

  /**
   * Initializes Google GPT Script and Service
   */
  const initialiseGpt = useCallback(() => {
    /** Retrieve Existing or Initializes New GPT Service */
    global.googletag = global.googletag || {cmd: []};

    /** Adds element to the execution queue */
    global.googletag.cmd.push(function () {
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

      /** Enable Services */
      global.googletag.enableServices();
      initializeTargets(gptAdSlotRef.current);

      /** Display GPT Ad */
      display(gptAdDivRef.current);
    });
  }, [
    adUnitPath,
    display,
    gptAdSlotRef,
    initializeTargets,
    optDiv,
    parsedSize,
  ]);

  useEffect(() => {
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
        }
      );
    } else {
      /** `gpt.js` is already loaded, now Initialize GPT Library for this component */
      initialiseGpt(global);
    }
  }, [initialiseGpt]);

  return (
    <ContainWrapper
      layout
      height={height}
      width={width}
      paint
      {...rest}
      ref={useMergeRefs([containerRef, inObRef])}
    >
      <div id={optDiv} ref={gptAdDivRef} style={{height, width}}></div>
    </ContainWrapper>
  );
}
