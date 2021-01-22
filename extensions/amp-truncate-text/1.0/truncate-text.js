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
import {truncateText} from './truncation';
import {
  useCallback,
  useEffect,
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
  {
    persistentContent,
    collapsedContent,
    expandedContent,
    onToggle,
    children,
    ...rest
  },
  ref
) {
  const wrapperRef = useRef();
  const collapsedContentRef = useRef();
  const persistentContentRef = useRef();

  const [expanded, setExpanded] = useState(false);

  // Provide API actions
  useImperativeHandle(
    ref,
    () => ({
      expand: () => setExpanded(true),
      collapse: () => setExpanded(false),
    }),
    []
  );

  // TODO(#31685): Rewrite `truncateText` for Preact
  /** Perform truncation on contents. */
  const truncate = useCallback(() => {
    const container = wrapperRef.current;
    const overflowNodes = [
      persistentContentRef.current,
      collapsedContentRef.current,
    ].filter(Boolean);

    container && truncateText({container, overflowNodes});
    onToggle && onToggle(expanded);
  }, [onToggle, expanded]);

  // Truncate the text when expanded/collapsed
  // TODO(#31685): Add ResizeObserver to watch for height changes.
  useLayoutEffect(truncate, [expanded, truncate]);
  // When used in an AMP component, requires an initial truncate to layout.
  useEffect(() => onToggle && truncate(), [onToggle, truncate]);

  const classes = useStyles();
  // TODO(#31685): Remove extra <slot> in default span if possible.
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
          role="button"
          onClick={() => setExpanded(false)}
          className={classes.truncateTextExpandedSlot}
          children={expandedContent}
        />
      ) : (
        <span
          name="collapsed"
          role="button"
          ref={collapsedContentRef}
          onClick={() => setExpanded(true)}
          children={collapsedContent}
        />
      )}

      <span
        name="persistent"
        ref={persistentContentRef}
        children={persistentContent}
      />
    </ContainWrapper>
  );
}

const TruncateText = forwardRef(TruncateTextWithRef);
TruncateText.displayName = 'TruncateText';
export {TruncateText};
