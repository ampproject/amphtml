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

import {Keys} from '../../../src/utils/key-codes';
import {createElement, useContext} from '../../../src/preact';
import {dev, devAssert, userAssert} from '../../../src/log';
import {getAmpContext} from '../../../src/preact/context';
import {openWindowDialog} from '../../../src/dom';
import {parseQueryString} from '../../../src/url';
import {startsWith} from '../../../src/string';
import {useResourcesNotify} from '../../../src/preact/utils';

const socialShareStyle = `background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  background-color: black; 
  background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M211.9%20197.4h-36.7v59.9h36.7V433.1h70.5V256.5h49.2l5.2-59.1h-54.4c0%200%200-22.1%200-33.7%200-13.9%202.8-19.5%2016.3-19.5%2010.9%200%2038.2%200%2038.2%200V82.9c0%200-40.2%200-48.8%200%20-52.5%200-76.1%2023.1-76.1%2067.3C211.9%20188.8%20211.9%20197.4%20211.9%20197.4z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
`;

/**
 * @param {!JsonObject} props
 * @return {Preact.Renderable}
 */
export function SocialShare(props) {
  const context = useContext(getAmpContext());

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

  const attrs = {
    onClick: handleActivation,
    onKeydown: handleKeyPress,
    className: `social-share-${props['type']}`,
    style: socialShareStyle + props['style'],
    role: 'button',
    tabIndex: props['tabindex'] || '0',
  };

  const render = props['render'];
  useResourcesNotify();
  return render(null, props['children'], createElement('div', attrs));
}
