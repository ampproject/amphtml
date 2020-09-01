import * as Preact from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';
import {getIframeProps} from '../../../src/3p-frame';
import { ContainWrapper } from "../../../src/preact/component";


/**
 * @param {!JsonObject} props
 *  type: !string,
 *  href: ?string,
 *  target: ?string,
 *  width: ?string,
 *  height: ?string,
 *  background: ?string,
 *  tabIndex: ?string,
 *  style: ?string,
 * @return {PreactDef.Renderable}
 */
export function FacebookComments(prop) {
  const iframeProps = getIframeProps(
    window,
    document.body,
    "facebook",
    undefined,
    undefined,
    {
      attributes: { _context: { tagName: "AMP-FACEBOOK-COMMENTS" } },
    }
  );

  return (
    <div>
      <script src='https://connect.facebook.net/EN_US/sdk.js'></script>
    <ContainWrapper size layout paint style={{ width: 600, height: 900 }}>
      <iframe {...iframeProps} />
    </ContainWrapper>
    </div>
  );
}

function datasetFromProps(props) {
  const dataset = {};
  for (const key in props) {
    if (/^data-/.test(key)) {
      dataset[key.replace(/^data-/, "")] = props[key];
    }
  }
  return dataset;
}
