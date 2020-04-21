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

import * as Preact from '../../../../src/preact';
import {button, number, select, text} from '@storybook/addon-knobs';

const FILL_OPTIONS = {
  none: 'none',
  forwards: 'forwards',
  backwards: 'backwards',
  both: 'both',
};

const DIRECTION_OPTIONS = {
  normal: 'normal',
  reverse: 'reverse',
  alternate: 'alternate',
  'alternate-reverse': 'alternate-reverse',
};

const CONTAINER_STYLE = {
  position: 'relative',
  width: '300px',
  height: '300px',
  background: '#EEE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const INFO_STYLE = {
  background: '#DDD',
  fontSize: 'x-small',
  margin: 0,
  position: 'absolute',
  top: 0,
  height: '100%',
  right: '-310px',
  width: '300px',
  overflow: 'auto',
};

/**
 * @param {!Object} props
 * @return {!Object}
 */
export function AnimationTemplate(props) {
  const {spec, children} = props;
  const duration = text('Duration', '1s');
  const iterations = number('Iterations', 2);
  const fill = select('Fill', FILL_OPTIONS, 'both');
  const direction = select('Direction', DIRECTION_OPTIONS, 'alternate');
  const fullSpec = {
    duration,
    iterations,
    fill,
    direction,
    ...spec,
  };
  return (
    <main>
      <amp-animation id="anim1" layout="nodisplay">
        <script
          type="application/json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(fullSpec)}}
        />
      </amp-animation>

      <div class="buttons" style={{marginBottom: '8px'}}>
        <button on="tap:anim1.start">Start</button>
        <button on="tap:anim1.restart">Restart</button>
        <button on="tap:anim1.togglePause">Toggle Pause</button>
        <button on="tap:anim1.seekTo(percent=0.5)">Seek to 50%</button>
        <button on="tap:anim1.reverse">Reverse</button>
        <button on="tap:anim1.finish">Finish</button>
        <button on="tap:anim1.cancel">Cancel</button>
      </div>
      <div style={CONTAINER_STYLE}>
        <pre style={INFO_STYLE}>{JSON.stringify(fullSpec, null, 2)}</pre>

        {children}
      </div>
    </main>
  );
}
