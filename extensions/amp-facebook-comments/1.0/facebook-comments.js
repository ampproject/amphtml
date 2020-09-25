import * as Preact from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';
import {getIframeProps} from '../../../src/3p-frame';
import { ContainWrapper } from "../../../src/preact/component";

const TAG = "AMP-FACEBOOK-COMMENTS";


// TODO: After adding to type, do FB comments props
/**
 * @param {!FacebookCommentsProps} props
 * @return {PreactDef.Renderable}
 */
export function FacebookComments(props) {
  useResourcesNotify();
  const locale = props['data-locale'] ? props['data-locale'] : 'EN_US';
  let passedAttributes = Object.assign({}, datasetFromProps(props));
  passedAttributes['width'] = props['width'];
  passedAttributes['height'] = props['height'];
  const iframeProps = getIframeProps(
    window,
    document.body,
    passedAttributes,
    "facebook",
    undefined,
    TAG,
  );

  document.body.append(document.createElement('script').setAttribute('src', 'https://connect.facebook.net/' + locale + '/sdk.js'));
  return (
    <ContainWrapper size layout paint style={{ width: props['width'], height: props['height'] }}>
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
