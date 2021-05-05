/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import * as Preact from '../../../../src/preact';

/**
 * @param {*} props
 * @param {*} props.id
 * @param {*} props.children
 * @return {*}
 */
export const VideoElementWithActions = ({
  id,
  children,
  actions = ['play', 'pause', 'mute', 'unmute', 'fullscreen'],
}) => (
  <div style="max-width: 800px">
    <p style={{display: 'flex'}}>
      {actions.map((action) => (
        <button style={{flex: 1, margin: '0 4px'}} on={`tap:${id}.${action}`}>
          {action}
        </button>
      ))}
    </p>
    {children}
  </div>
);
