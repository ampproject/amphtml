import {loadScript} from '#3p/3p';

import {isArray} from '#core/types';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {ContainWrapper} from '#preact/component';

/**
 * Parse a GPT-Style general size Array like `[[300, 250]]` or `"300x250,970x90"` into an array of sizes `["300x250"]` or '['300x250', '970x90']'
 * @param  {array[array|number]} sizeObj Input array or double array [300,250] or [[300,250], [728,90]]
 * @return {array[string]}  Array of strings like `["300x250"]` or `["300x250", "728x90"]`
 */
const parseSizesInput = function (sizeObj) {
  const parsedSizes = [];
  const _typeof =
    typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
      ? function (obj) {
          return typeof obj;
        }
      : function (obj) {
          return obj &&
            typeof Symbol === 'function' &&
            obj.constructor === Symbol
            ? 'symbol'
            : typeof obj;
        };

  //if a string for now we can assume it is a single size, like "300x250"
  if (
    (typeof sizeObj === 'undefined' ? 'undefined' : _typeof(sizeObj)) ===
    objectType_string
  ) {
    //multiple sizes will be comma-separated
    const sizes = sizeObj.split(',');

    //regular expression to match strigns like 300x250
    //start of line, at least 1 number, an "x" , then at least 1 number, and the then end of the line
    const sizeRegex = /^(\d)+x(\d)+$/i;
    if (sizes) {
      for (const curSizePos in sizes) {
        if (hasOwn(sizes, curSizePos) && sizes[curSizePos].match(sizeRegex)) {
          parsedSizes.push(sizes[curSizePos]);
        }
      }
    }
  } else if (
    (typeof sizeObj === 'undefined' ? 'undefined' : _typeof(sizeObj)) ===
    objectType_object
  ) {
    const sizeArrayLength = sizeObj.length;

    //don't process empty array
    if (sizeArrayLength > 0) {
      //if we are a 2 item array of 2 numbers, we must be a SingleSize array
      if (
        sizeArrayLength === 2 &&
        _typeof(sizeObj[0]) === objectType_number &&
        _typeof(sizeObj[1]) === objectType_number
      ) {
        parsedSizes.push(parseGPTSingleSizeArray(sizeObj));
      } else {
        //otherwise, we must be a MultiSize array
        for (let i = 0; i < sizeArrayLength; i++) {
          parsedSizes.push(parseGPTSingleSizeArray(sizeObj[i]));
        }
      }
    }
  }

  return parsedSizes;
};

//parse a GPT style sigle size array, (i.e [300,250])
//into an AppNexus style string, (i.e. 300x250)
const parseGPTSingleSizeArray = function (singleSize) {
  //if we aren't exactly 2 items in this array, it is invalid
  if (
    isArray(singleSize) &&
    singleSize.length === 2 &&
    !isNaN(singleSize[0]) &&
    !isNaN(singleSize[1])
  ) {
    return singleSize[0] + 'x' + singleSize[1];
  }
};

function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

/**
 * @param {!BentoGpt.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoGpt({adUnitPath, optDiv, size, ...rest}) {
  const div1Ref = useRef(null);
  //const div2Ref = useRef(null);
  //const x = Date.now();
  const tempSz = isString(size) ? JSON.parse(size) : size;

  //.defineSlot('/21730346048/test-skyscraper', [120, 600], 'div1')
  const initialiseGpt = useCallback(
    (g) => {
      g.googletag = g.googletag || {cmd: []};
      g.googletag.cmd.push(function () {
        g.googletag
          .defineSlot(adUnitPath, tempSz, optDiv)
          .addService(g.googletag.pubads());
        // g.googletag
        //   .defineSlot('/21730346048/test-skyscraper', [120, 600], 'div2')
        //   .addService(g.googletag.pubads());
        g.googletag.enableServices();
        g.googletag.display(div1Ref.current);
        //g.googletag.display(div2Ref.current);
      });
    },
    [adUnitPath, size, optDiv]
  );

  useEffect(() => {
    loadScript(
      global,
      'https://www.googletagservices.com/tag/js/gpt.js',
      () => {
        initialiseGpt(global);
      }
    );
  }, [initialiseGpt]);

  return (
    <ContainWrapper layout size paint {...rest}>
      <div
        id={optDiv}
        ref={div1Ref}
        style="width: 120px; height: 600px;; margin: 10px"
      ></div>
    </ContainWrapper>
  );
}
