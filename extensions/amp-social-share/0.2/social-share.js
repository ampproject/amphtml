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
import {dev, devAssert, userAssert} from '../../../src/log';
import {getAmpContext} from '../../../src/preact/context';
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
  const context = Preact.useContext(getAmpContext());

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
    const href = context['href'] || props['href'];
    const target = context['target'] || props['target'] || '_blank';
    userAssert(href && target, 'Clicked before href is set.');
    dev().assertString(href);
    dev().assertString(target);
    if (startsWith(href, 'navigator-share:')) {
      devAssert(navigator.share !== undefined, 'navigator.share disappeared.');
      // navigator.share() fails 'gulp check-types' validation on Travis
      navigator['share'](parseQueryString(href.substr(href.indexOf('?'))));
    } else {
      const windowFeatures = 'resizable,scrollbars,width=640,height=480';
      openWindowDialog(window, href, target, windowFeatures);
    }
  }

  const styleType = `SOCIAL_SHARE_${props['type'].toUpperCase()}`;
  const base = CSS.BASE_STYLE;
  const background = CSS[styleType];
  const size =
    props['layout'] === 'responsive'
      ? {}
      : {
          width: props['width'] || DEFAULT_WIDTH,
          height: props['height'] || DEFAULT_HEIGHT,
        };
  useResourcesNotify();
  return (
    <SocialShareIcon
      className={`social-share-${props['type']}`}
      onClick={handleActivation}
      onKeydown={handleKeyPress}
      role="button"
      style={{...size, ...base, ...background}}
      styleType={styleType}
      tabIndex={props['tabIndex'] || '0'}
    />
  );
}
