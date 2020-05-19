/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as CSS from './social-share.css';
import * as Preact from '../../../src/preact';
import {Keys} from '../../../src/utils/key-codes';
import {SocialShareIcon} from '../../../third_party/optimized-svg-icons/social-share-svgs';
import {openWindowDialog} from '../../../src/dom';
import {parseQueryString} from '../../../src/url';
import {startsWith} from '../../../src/string';
import {useResourcesNotify} from '../../../src/preact/utils';

const DEFAULT_WIDTH = 60;
const DEFAULT_HEIGHT = 44;

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function SocialShare(props) {
  /**
   * Handle key presses on the element.
   * @param {!Event} event
   * @private
   */
  function handleKeyPress(event) {
    const {key} = event;
    if (key == Keys.SPACE || key == Keys.ENTER) {
      event.preventDefault();
      handleActivation();
    }
  }

  /** @private */
  function handleActivation() {
    const href = props['href'];
    const target = props['target'] || '_blank';
    if (!href) {
      throw new Error('Clicked before href is set.');
    }
    if (startsWith(href, 'navigator-share:')) {
      if (!navigator.share) {
        throw new Error('no navigator.share');
      }
      const dataStr = href.substr(href.indexOf('?'));
      const data = parseQueryString(dataStr);
      navigator.share(data).catch(() => {
        // TODO(alanorozco): Warn here somehow.
        // warn(TAG, e.message, dataStr);
      });
    } else {
      const windowFeatures = 'resizable,scrollbars,width=640,height=480';
      openWindowDialog(window, href, target, windowFeatures);
    }
  }

  const type = props['type'].toUpperCase();
  const baseStyle = CSS.BASE_STYLE;
  const backgroundStyle = CSS[type];
  const size = {
    width: props['width'] || DEFAULT_WIDTH,
    height: props['height'] || DEFAULT_HEIGHT,
  };
  useResourcesNotify();
  return (
    <div
      role="button"
      tabindex={props['tabIndex'] || '0'}
      onKeyDown={handleKeyPress}
      onClick={handleActivation}
      style={{...size, ...props['style']}}
      {...props}
      aria-label={`amp-social-share component of type: ${type}`}
    >
      <SocialShareIcon
        style={{...backgroundStyle, ...baseStyle, ...size}}
        type={type}
      />
    </div>
  );
}
