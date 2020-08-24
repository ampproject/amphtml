import * as Preact from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';

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
    // preconnectCallback(opt_onLayout

    return (
        <iframe 
        id="facebook-comments-iframe" 
        width="200" 
        height="200" 
        src="http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html"></iframe>
    )

}