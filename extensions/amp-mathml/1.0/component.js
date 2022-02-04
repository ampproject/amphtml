import objStr from 'obj-str';

import {MessageType_Enum, deserializeMessage} from '#core/3p-frame-messaging';
import {tryParseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {useCallback, useMemo} from '#preact';
import {forwardRef} from '#preact/compat';
import {useValueRef} from '#preact/component';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';

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
    title = 'MathML formula',
    ...rest
  } = props;
  const onLoadRef = useValueRef(onLoad);
  const classes = useStyles();

  const messageHandler = useCallback(
    (e) => {
      const data = tryParseJson(e.data) ?? deserializeMessage(e.data);
      if (data['type'] == MessageType_Enum.EMBED_SIZE) {
        onLoadRef.current?.();
      }
    },
    [onLoadRef]
  );

  const iframeOptions = useMemo(() => ({formula}), [formula]);

  if (!validProps(props)) {
    return null;
  }

  return (
    <ProxyIframeEmbed
      class={objStr({
        [classes.inline]: inline,
      })}
      allowFullscreen
      ref={ref}
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
