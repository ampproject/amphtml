

import * as Preact from '#preact';

const NOOP = () => {};

/**
 * @param {!IframeDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Iframe({
  allowFullScreen,
  allowPaymentRequest,
  allowTransparency,
  onLoadCallback = NOOP,
  referrerPolicy,
  sandbox,
  src,
  srcdoc,
  ...rest
}) {
  return (
    <iframe
      src={src}
      srcdoc={srcdoc}
      sandbox={sandbox}
      allowfullscreen={allowFullScreen}
      allowpaymentrequest={allowPaymentRequest}
      allowtransparency={allowTransparency}
      referrerpolicy={referrerPolicy}
      onload={onLoadCallback}
      {...rest}
    ></iframe>
  );
}
