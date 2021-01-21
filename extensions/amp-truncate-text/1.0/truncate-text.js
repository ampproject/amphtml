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
  {persistent, collapsed, expanded, onToggle, children, ...rest},
  ref
) {
  const wrapperRef = useRef();
  const collapsedRef = useRef();
  const persistentRef = useRef();

  const [isExpanded, setIsExpanded] = useState(false);

  // Provide API actions
  useImperativeHandle(ref, () => ({
    expand: () => setIsExpanded(true),
    collapse: () => setIsExpanded(false),
  }));

  // TODO(rcebulko): Rewrite `truncateText` for Preact
  /** Perform truncation on contents. */
  const truncate = useCallback(() => {
    console.log(`truncate(${isExpanded})`);
    const container = wrapperRef.current;
    const overflowNodes = [persistentRef.current, collapsedRef.current].filter(
      Boolean
    );

    container && truncateText({container, overflowNodes});
    onToggle && onToggle(isExpanded);
  }, [onToggle, isExpanded]);

  // Truncate the text when expanded/collapsed
  useLayoutEffect(truncate, [isExpanded, truncate]);
  // When used in an AMP component, requires an initial truncate to layout.
  useEffect(() => onToggle && truncate(), [onToggle, truncate]);

  const classes = useStyles();
  return (
    <ContainWrapper
      layout
      ref={wrapperRef}
      wrapperClassName={`${classes.truncateTextWrapper} ${
        isExpanded ? classes.truncateTextExpandedWrapper : ''
      }`}
      contentClassName={`${classes.truncateTextContent} ${
        isExpanded
          ? classes.truncateTextExpandedContent
          : classes.truncateTextCollapsedContent
      }`}
      {...rest}
    >
      <span name="default">
        <slot children={children} />
      </span>

      {isExpanded ? (
        <span
          name="expanded"
          onClick={() => setIsExpanded(false)}
          className={classes.truncateTextExpandedSlot}
          children={expanded}
        />
      ) : (
        <span
          name="collapsed"
          ref={collapsedRef}
          onClick={() => setIsExpanded(true)}
          children={collapsed}
        />
      )}

      <span name="persistent" ref={persistentRef} children={persistent} />
    </ContainWrapper>
  );
}

const TruncateText = forwardRef(TruncateTextWithRef);
TruncateText.displayName = 'TruncateText';
export {TruncateText};
