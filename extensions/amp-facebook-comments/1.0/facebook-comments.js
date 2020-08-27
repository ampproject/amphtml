import * as Preact from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';
import {getIframeProps} from '../../../src/3p-frame';

const NAME = 'FacebookComments';

/**
 * @param {!JsonObject} props
 *  type: ?string,
 *  endpoint: ?string,
 *  params: ?JsonObject,
 *  target: ?string,
 *  width: ?string,
 *  height: ?string,
 *  color: ?string,
 *  background: ?string,
 *  tabIndex: ?string,
 *  style: ?string,
 * @return {PreactDef.Renderable}
 */
export function FacebookComments(props) {
    useResourcesNotify();
    

    return Preact.createElement('iframe', getIframeProps(window, 'facebook'));

}