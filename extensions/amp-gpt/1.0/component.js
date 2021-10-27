import {loadScript} from '#3p/3p';

import {isArray} from '#core/types';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

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

  /** Parsed Attributes */
  const parsedSize = useMemo(() => {
    return [width, height];
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
  const display = useCallback(
    (scope) => {
      scope.googletag.display(gptAdDivRef.current);
    },
    [gptAdDivRef]
  );

  /**
   * Initializes Google GPT Script and Service
   */
  const initialiseGpt = useCallback(
    (scope) => {
      /** Retrieve Existing or Initializes New GPT Service */
      scope.googletag = scope.googletag || {cmd: []};

      /** Adds element to the execution queue */
      scope.googletag.cmd.push(function () {
        /** Define slot and related parameters */
        gptAdSlotRef.current = scope.googletag
          .defineSlot(adUnitPath, parsedSize, optDiv)
          .addService(scope.googletag.pubads());

        /**
         * Note:  We can add multiple slots,
         *        but this is out of the scope of this component.
         */
        // scope.googletag
        //   .defineSlot('/21730346048/test-skyscraper', [120, 600], 'sample-div2')
        //   .addService(scope.googletag.pubads());

        /** Enable Services */
        scope.googletag.enableServices();

        initializeTargets(gptAdSlotRef.current);

        /** Display GPT Ad */
        display(scope);
      });
    },
    [adUnitPath, display, gptAdSlotRef, initializeTargets, optDiv, parsedSize]
  );

  useEffect(() => {
    /** Load GPT Script async once component initialized */
    loadScript(
      global,
      'https://www.googletagservices.com/tag/js/gpt.js',
      () => {
        /** Script loaded successfully, now Initialize GPT Library */
        initialiseGpt(global);
      }
    );
  }, [initialiseGpt]);

  return (
    <ContainWrapper layout height={height} width={width} paint {...rest}>
      <div id={optDiv} ref={gptAdDivRef} style={{height, width}}></div>
    </ContainWrapper>
  );
}
