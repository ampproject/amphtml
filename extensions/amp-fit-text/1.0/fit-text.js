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
import * as styles from './fit-text.css';
import {px, resetStyles, setStyle, setStyles} from '../../../src/style';
import {useCallback, useLayoutEffect, useRef} from '../../../src/preact';

const {LINE_HEIGHT_EM_} = styles;

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function FitText(props) {
  const {
    'children': children,
    'minFontSize': minFontSize = 6,
    'maxFontSize': maxFontSize = 72,
    'width': width = props['style']['width'] || '100%',
    'height': height = props['style']['height'] || '100%',
    ...rest
  } = props;
  const contentRef = useRef(null);
  const measurerRef = useRef(null);

  const resize = useCallback(
    (maxHeight, maxWidth) => {
      if (!measurerRef.current) {
        return;
      }
      const fontSize = calculateFontSize(
        measurerRef.current,
        Number(maxHeight),
        Number(maxWidth),
        minFontSize,
        maxFontSize
      );
      getOverflowStyle(measurerRef.current, Number(maxHeight), fontSize);
    },
    [maxFontSize, minFontSize]
  );

  // Here and below, useLayoutEffect is used so intermediary font sizes
  // during resizing are resolved before the component visually updates.
  // Font size should readjust when container resizes.
  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const last = entries[entries.length - 1];
      const {height: maxHeight, width: maxWidth} = last['contentRect'];
      resize(maxHeight, maxWidth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [resize]);

  // Font size should readjust when content changes.
  useLayoutEffect(() => {
    resize(height, width);
  }, [children, resize, height, width]);

  return (
    <div {...rest}>
      <div
        ref={contentRef}
        style={{
          ...styles.fitTextContent,
          'width': px(width),
          'height': px(height),
        }}
      >
        <div
          ref={measurerRef}
          style={{
            ...styles.fitTextContentWrapper,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 */
function calculateFontSize(
  measurer,
  expectedHeight,
  expectedWidth,
  minFontSize,
  maxFontSize
) {
  maxFontSize++;
  // Binomial search for the best font size.
  while (maxFontSize - minFontSize > 1) {
    const mid = Math.floor((minFontSize + maxFontSize) / 2);
    setStyle(measurer, 'fontSize', px(mid));
    const width = measurer./*OK*/ scrollWidth;
    const height = measurer./*OK*/ scrollHeight;
    if (height > expectedHeight || width > expectedWidth) {
      maxFontSize = mid;
    } else {
      minFontSize = mid;
    }
  }
  setStyle(measurer, 'fontSize', px(minFontSize));
  return minFontSize;
}

/**
 * @param {Element} measurer
 * @param {number} maxHeight
 * @param {number} fontSize
 */
function getOverflowStyle(measurer, maxHeight, fontSize) {
  const overflown = measurer./*OK*/ scrollHeight > maxHeight;
  console.log(overflown);
  const lineHeight = fontSize * LINE_HEIGHT_EM_;
  const numberOfLines = Math.floor(maxHeight / lineHeight);
  if (overflown) {
    setStyles(measurer, {
      'lineClamp': numberOfLines,
      '-webkit-line-clamp': numberOfLines,
      'maxHeight': px(lineHeight * numberOfLines),
    });
  } else {
    resetStyles(measurer, ['lineClamp', '-webkit-line-clamp', 'maxHeight']);
  }
}
