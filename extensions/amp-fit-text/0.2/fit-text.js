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
import {omit} from '../../../src/utils/object';
import {px, setStyle} from '../../../src/style';
import {useEffect, useRef, useState} from '../../../src/preact';

const {LINE_HEIGHT_EM_} = styles;

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function FitText(props) {
  const {
    'children': children,
    'measurerChildren': measurerChildren = children,
    'minFontSize': minFontSize = 6,
    'maxFontSize': maxFontSize = 72,
    'width': width = props['style']['width'] || '100%',
    'height': height = props['style']['height'] || '100%',
  } = props;
  const rest = omit(props, [
    'children',
    'minFontSize',
    'maxFontSize',
    'width',
    'height',
  ]);
  const contentRef = useRef(null);
  const measurerRef = useRef(null);
  const [wrapperStyle, setWrapperStyle] = useState(/** @type {Object} */ ({}));

  useEffect(() => {
    const node = contentRef.current;
    const observer = new ResizeObserver((entries) => {
      const last = entries[entries.length - 1];
      const {height: maxHeight, width: maxWidth} = last['contentRect'];
      const fontSize = calculateFontSize(
        measurerRef.current,
        maxHeight,
        maxWidth,
        minFontSize,
        maxFontSize
      );
      const overflownStyle = getOverflowStyle(
        measurerRef.current,
        maxHeight,
        fontSize
      );
      setWrapperStyle({...overflownStyle, fontSize: px(fontSize)});
    });
    if (node) {
      observer.observe(node);
    }
    return () => observer.unobserve(node);
  }, [maxFontSize, minFontSize]);

  return (
    <div {...rest}>
      <div
        ref={contentRef}
        style={{
          ...styles.fitTextContent,
          'width': px(width),
          'height': px(height),
          'visibility': !!wrapperStyle['fontSize'] ? '' : 'hidden',
        }}
      >
        <div
          style={{
            ...styles.fitTextContentWrapper,
            ...wrapperStyle,
          }}
        >
          {children}
        </div>
      </div>
      <div ref={measurerRef} style={{...styles.measurer, maxWidth: px(width)}}>
        {measurerChildren}
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
 * @return {Object}
 */
function getOverflowStyle(measurer, maxHeight, fontSize) {
  const overflown = measurer./*OK*/ offsetHeight > maxHeight;
  const lineHeight = fontSize * LINE_HEIGHT_EM_;
  const numberOfLines = Math.floor(maxHeight / lineHeight);
  return overflown
    ? {
        ...styles.fitTextContentOverflown,
        lineClamp: numberOfLines,
        '-webkit-line-clamp': numberOfLines,
        maxHeight: px(lineHeight * numberOfLines),
      }
    : {};
}
