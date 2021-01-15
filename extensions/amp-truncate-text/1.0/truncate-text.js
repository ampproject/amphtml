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
import {ContainWrapper, Wrapper} from '../../../src/preact/component';
import {forwardRef} from '../../../src/preact/compat';
import {setStyle} from '../../../src/style';
import {truncateText} from '../0.1/truncate-text';
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
    slotPersistent,
    slotCollapsed,
    slotExpanded,
    onBeforeExpand,
    onAfterCollapse,
    ...rest
  },
  ref
) {
  const wrapperRef = useRef();
  const collapsedRef = useRef();
  const persistentRef = useRef();

  const onBeforeExpandRef = useRef(onBeforeExpand);
  const onAfterCollapseRef = useRef(onAfterCollapse);

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
  });

  // Truncate the text when expanded/collapsed
  useLayoutEffect(() => {
    // Update container element attributes
    if (expanded) {
      onBeforeExpandRef.current && onBeforeExpandRef.current();
    } else {
      onAfterCollapseRef.current && onAfterCollapseRef.current();
    }

    // Truncate contents to fit/expand container
    truncate();
  }, [expanded]);

  // After the first layout, measure/truncate/display
  useEffect(() => {
    truncate();
    setReady(true);
  }, []);

  // Don't display contents until after the first measure/truncate
  useLayoutEffect(() => {
    setStyle(wrapperRef.current, 'visibility', ready ? 'visible' : 'hidden');
  }, [ready]);

  const classes = useStyles();
  const slots = {
    'default': <slot />,
    'persistent': slotPersistent,
    'collapsed': slotCollapsed,
    'expanded': slotExpanded,
  };

  const TruncateSlot = forwardRef(({name, ...rest}, ref) => (
    <span class={`i-amphtml-truncate-${name}-slot`} ref={ref} {...rest}>
      {slots[name]}
    </span>
  ));

  return (
    <Wrapper
      ref={wrapperRef}
      // Required to un-set defaults that break truncation
      wrapperStyle={{position: null}}
      wrapperClassName={`i-amphtml-truncate-content ${
        classes.truncateTextContent
      } ${
        expanded
          ? classes.truncateTextExpandedContent
          : classes.truncateTextCollapsedContent
      }`}
      {...rest}
    >
      <TruncateSlot name="default" />

      {expanded ? (
        <TruncateSlot
          name="expanded"
          onClick={() => setExpanded(false)}
          className={classes.truncateTextExpandedSlot}
        />
      ) : (
        <TruncateSlot
          name="collapsed"
          ref={collapsedRef}
          onClick={() => setExpanded(true)}
        />
      )}

      <TruncateSlot name="persistent" ref={persistentRef} />
    </Wrapper>
  );
}

const TruncateText = forwardRef(TruncateTextWithRef);
TruncateText.displayName = 'TruncateText';
export {TruncateText};
