/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {ContainWrapper} from '../../../src/preact/component';
import {forwardRef} from '../../../src/preact/compat';
import {setStyle} from '../../../src/style';
import {truncateText} from './truncation';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './truncate-text.jss';

/**
 * @param {!TruncateTextDef.Props} props
 * @param {{current: (!TruncateTextDef.TruncateTextApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function TruncateTextWithRef(
  {slotPersistent, slotCollapsed, slotExpanded, children, ...rest},
  ref
) {
  const wrapperRef = useRef();
  const collapsedRef = useRef();
  const persistentRef = useRef();

  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);

  // Provide API actions
  useImperativeHandle(ref, () => ({
    expand: () => setExpanded(true),
    collapse: () => setExpanded(false),
  }));

  // TODO(rcebulko): Rewrite `truncateText` for Preact
  /** Perform truncation on contents. */
  const truncate = useCallback(() => {
    truncateText({
      container: wrapperRef.current,
      overflowNodes: [persistentRef.current, collapsedRef.current],
    });
  }, []);

  // Truncate the text when expanded/collapsed
  useLayoutEffect(truncate, [expanded, truncate, ready]);

  const classes = useStyles();
  return (
    <ContainWrapper
      layout
      ref={wrapperRef}
      wrapperClassName={`${classes.truncateTextWrapper} ${
        expanded ? classes.truncateTextExpandedWrapper : ''
      }`}
      contentClassName={`${classes.truncateTextContent} ${
        expanded
          ? classes.truncateTextExpandedContent
          : classes.truncateTextCollapsedContent
      }`}
      {...rest}
    >
      <span name="default">
        <slot children={children} />
      </span>

      {expanded ? (
        <span
          name="expanded"
          onClick={() => setExpanded(false)}
          className={classes.truncateTextExpandedSlot}
          children={slotExpanded}
        />
      ) : (
        <span
          name="collapsed"
          ref={collapsedRef}
          onClick={() => setExpanded(true)}
          children={slotCollapsed}
        />
      )}

      <span name="persistent" ref={persistentRef} children={slotPersistent} />
    </ContainWrapper>
  );
}

const TruncateText = forwardRef(TruncateTextWithRef);
TruncateText.displayName = 'TruncateText';
export {TruncateText};
