import objStr from 'obj-str';

import {MESSAGE_TYPE_ENUM, deserializeMessage} from '#core/3p-frame-messaging';
import {tryParseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {useIntersectionObserver, useValueRef} from '#preact/component';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';
import {useMergeRefs} from '#preact/utils';

import {useStyles} from './component.jss';
import {TYPE} from './utils';

const ORIGIN_MATCHER = () => true;

/**
 * @param {!BentoMathmlDef.Props} props
 * @param {{current: BentoMathmlDef.Api}} ref
 * @return {PreactDef.Renderable}
 */
function BentoMathmlWithRef(props, ref) {
  const {
    formula,
    inline = false,
    onLoad,
    requestResize,
    style: bentoMathmlStyles,
    title = 'MathML formula',
    ...rest
  } = props;
  const [dimensions, setDimensions] = useState(null);
  // to avoid layout shifts, hide correct dimensions until the content is offscreen to avoid a Layout Shift
  const [allowDimensions, setAllowDimensions] = useState(false);
  const onLoadRef = useValueRef(onLoad);
  const requestResizeRef = useValueRef(requestResize);
  const classes = useStyles();

  useEffect(() => {
    if (allowDimensions && dimensions) {
      onLoadRef.current?.();
      requestResizeRef.current?.(dimensions);
    }
  }, [onLoadRef, requestResizeRef, allowDimensions, dimensions]);

  const messageHandler = useCallback(
    (e) => {
      const data = tryParseJson(e.data) ?? deserializeMessage(e.data);
      if (data['type'] == MESSAGE_TYPE_ENUM.EMBED_SIZE) {
        const {height, width: w} = data;
        const width = inline ? w : undefined;
        setDimensions({height, width});
      }
    },
    [inline]
  );

  // eslint-disable-next-line prefer-const
  let observerCb;
  const ioCallback = useCallback(
    ({isIntersecting}) => {
      if (!isIntersecting) {
        setAllowDimensions(true);
        // unobserve element once it's rendered
        observerCb(null);
      }
    },
    [setAllowDimensions, observerCb]
  );
  observerCb = useIntersectionObserver(ioCallback);
  // Need to create custom callback ref because ProxyIframeEmbed uses an imperative handle with an property for the node.
  const observerCbRef = (proxyIframeEmbedHandle) => {
    const {node: iframeNode} = proxyIframeEmbedHandle;
    // Observe grandparent div instead of iframe because iframe keeps changing height
    observerCb(iframeNode?.parentNode.parentNode);
  };

  const styles = useMemo(() => {
    return {
      ...(allowDimensions && dimensions),
      ...bentoMathmlStyles,
    };
  }, [allowDimensions, dimensions, bentoMathmlStyles]);

  const iframeOptions = useMemo(() => ({formula}), [formula]);

  const proxyIframeEmbedRef = useMergeRefs([ref, observerCbRef]);

  if (!validProps(props)) {
    return null;
  }

  return (
    <ProxyIframeEmbed
      class={objStr({
        [classes.inline]: inline,
      })}
      style={styles}
      allowFullscreen
      ref={proxyIframeEmbedRef}
      type={TYPE}
      title={title}
      options={iframeOptions}
      matchesMessagingOrigin={ORIGIN_MATCHER}
      messageHandler={messageHandler}
      {...rest}
    ></ProxyIframeEmbed>
  );
}

const BentoMathml = forwardRef(BentoMathmlWithRef);
BentoMathml.displayName = 'BentoMathml'; // Make findable for tests.
export {BentoMathml};

/**
 * Verify required props and throw error if necessary.
 * @param {!BentoMathmlDef.Props} props
 * @return {boolean} true on valid
 */
function validProps({formula}) {
  // Perform manual checking as assertion is not available for Bento: Issue #32739
  if (!formula) {
    console /*OK*/
      .warn('formula is required for <BentoMathml>');
    return false;
  }
  return true;
}
