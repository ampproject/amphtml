import {px, resetStyles, setStyle, setStyles} from '#core/dom/style';
import {getWin} from '#core/window';

import * as Preact from '#preact';
import {useCallback, useLayoutEffect, useRef} from '#preact';
import {ContainWrapper} from '#preact/component';

import {LINE_HEIGHT_EM_, useStyles} from './component.jss';

/**
 * @param {BentoFitTextDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoFitText({
  children,
  maxFontSize = 72,
  minFontSize = 6,
  ...rest
}) {
  const classes = useStyles();
  const containerRef = useRef(null);
  const measurerRef = useRef(null);
  const heightRef = useRef(null);

  const resize = useCallback(() => {
    if (!measurerRef.current || !containerRef.current) {
      return;
    }
    const {clientHeight, clientWidth} = containerRef.current;
    const fontSize = calculateFontSize(
      measurerRef.current,
      clientHeight,
      clientWidth,
      minFontSize,
      maxFontSize
    );
    setOverflowStyle(measurerRef.current, clientHeight, fontSize);
  }, [maxFontSize, minFontSize]);

  // useLayoutEffect is used so intermediary font sizes during calculation
  // are resolved before the component visually updates.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = heightRef.current;
    if (!container || !content) {
      return;
    }
    const win = getWin(container);
    if (!win) {
      return undefined;
    }
    const observer = new win.ResizeObserver(() => resize());
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [resize]);

  return (
    <ContainWrapper
      size={true}
      layout={true}
      paint={true}
      contentRef={containerRef}
      contentClassName={classes.fitTextContentWrapper}
      {...rest}
    >
      <div ref={measurerRef} class={classes.fitTextContent}>
        <div ref={heightRef} class={classes.minContentHeight}>
          {children}
        </div>
      </div>
    </ContainWrapper>
  );
}

/**
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 * @visibleForTesting
 */
export function calculateFontSize(
  measurer,
  expectedHeight,
  expectedWidth,
  minFontSize,
  maxFontSize
) {
  maxFontSize++;
  // Binary search for the best font size.
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
 * @visibleForTesting
 */
export function setOverflowStyle(measurer, maxHeight, fontSize) {
  const overflowed = measurer./*OK*/ scrollHeight > maxHeight;
  const lineHeight = fontSize * LINE_HEIGHT_EM_;
  const numberOfLines = Math.floor(maxHeight / lineHeight);
  if (overflowed) {
    setStyles(measurer, {
      'lineClamp': numberOfLines,
      '-webkit-line-clamp': numberOfLines,
      'maxHeight': px(lineHeight * numberOfLines),
    });
    // Cannot use setInitialDisplay which calls devAssert.
    // eslint-disable-next-line local/no-style-display
    resetStyles(measurer, ['display']);
  } else {
    // eslint-disable-next-line local/no-style-display
    setStyle(measurer, 'display', 'flex');
    resetStyles(measurer, ['lineClamp', '-webkit-line-clamp', 'maxHeight']);
  }
}
