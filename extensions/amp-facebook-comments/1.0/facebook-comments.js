import * as Preact from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';
import {getIframeProps} from '../../../src/3p-frame';
import { ContainWrapper } from "../../../src/preact/component";

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
    <ContainWrapper size layout paint style={{ width: 600, height: 900 }}>
      <iframe {...iframeProps} />
    </ContainWrapper>
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
