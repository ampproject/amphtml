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
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionSection,
} from '../../../amp-accordion/1.0/component';
import {Youtube} from '../component';
import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';
import {useRef, useState} from '../../../../src/preact';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'YouTube',
  component: Youtube,
  decorators: [withA11y, withKnobs],
};

const VIDEOID = 'IAvf-rkzNck';
const LIVE_CHANNEL_ID = 'sKCkM-f2Qk4';

export const _default = () => {
  const width = number('width', 300);
  const height = number('height', 200);
  const videoid = text('videoid', VIDEOID);
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const params = object('params', {});
  const credentials = text('credentials', 'include');
  return (
    <Youtube
      autoplay={autoplay}
      loop={loop}
      videoid={videoid}
      params={params}
      style={{width, height}}
      credentials={credentials}
    />
  );
};

/**
 * @param {*} props
 * @return {*}
 */
function WithStateTable({videoid, autoplay, loop, params, credentials, style}) {
  const ref = useRef(null);

  const [stateTable, setStateTable] = useState(null);
  const setCurrentStateTable = () => {
    setStateTable(
      <table>
        {['autoplay', 'controls', 'loop', 'currentTime', 'duration'].map(
          (key) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{ref.current[key]}</td>
            </tr>
          )
        )}
      </table>
    );
  };

  return (
    <>
      <Youtube
        ref={ref}
        autoplay={autoplay}
        loop={loop}
        videoid={videoid}
        params={params}
        style={style}
        credentials={credentials}
      />
      <p>
        <button onClick={setCurrentStateTable}>🔄 current state</button>
      </p>
      {stateTable}
    </>
  );
}

/**
 * @return {*}
 */
export function State() {
  const width = number('width', 300);
  const height = number('height', 200);
  const videoid = text('videoid', VIDEOID);
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const params = object('params', {});
  const credentials = text('credentials', 'include');
  return (
    <WithStateTable
      autoplay={autoplay}
      loop={loop}
      videoid={videoid}
      params={params}
      style={{width, height}}
      credentials={credentials}
    />
  );
}

export const liveChannelId = () => {
  const width = number('width', 300);
  const height = number('height', 200);
  const liveChannelid = text('liveChannelid', LIVE_CHANNEL_ID);
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const params = object('params', {});
  const credentials = text('credentials', 'include');
  return (
    <Youtube
      autoplay={autoplay}
      loop={loop}
      liveChannelid={liveChannelid}
      params={params}
      style={{width, height}}
      credentials={credentials}
    />
  );
};

export const InsideAccordion = () => {
  const width = text('width', '320px');
  const height = text('height', '180px');
  const videoid = text('videoid', VIDEOID);
  const params = object('params', {});
  return (
    <Accordion expandSingleSection>
      <AccordionSection key={1} expanded>
        <AccordionHeader>
          <h2>Controls</h2>
        </AccordionHeader>
        <AccordionContent>
          <Youtube
            loop={true}
            videoid={videoid}
            params={params}
            style={{width, height}}
          />
        </AccordionContent>
      </AccordionSection>
      <AccordionSection key={2}>
        <AccordionHeader>
          <h2>Autoplay</h2>
        </AccordionHeader>
        <AccordionContent>
          <Youtube
            autoplay={true}
            loop={true}
            videoid={videoid}
            params={params}
            style={{width, height}}
          />
        </AccordionContent>
      </AccordionSection>
    </Accordion>
  );
};
