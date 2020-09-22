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
import {BentoInfo} from '../bento-info';
import {WithAmpContext} from '../../../../src/preact/context';
import {useMemo, useState} from '../../../../src/preact';

export function Shim({}) {
  const width = 200;
  const height = 100;
  const style = {width, height};

  const [renderable, setRenderable] = useState(true);
  const [playable, setPlayable] = useState(true);
  const [loadingContext, setLoadingContext] = useState('auto');
  const contextProps = {renderable, playable, loading: loadingContext};

  const [loading, setLoading] = useState('auto');

  return (
    <div>
      <div style={{border: '1px solid', margin: 8, padding: 8}}>
        <h2>Knobs</h2>
        <div>
          context.renderable:
          <input
            type="checkbox"
            checked={renderable}
            onChange={(e) => setRenderable(e.target.checked)}
          />
        </div>
        <div>
          context.playable:
          <input
            type="checkbox"
            checked={playable}
            onChange={(e) => setPlayable(e.target.checked)}
          />
        </div>
        <div>
          context.loading:
          <select
            value={loadingContext}
            onChange={(e) => setLoadingContext(e.target.value)}
          >
            <option value="auto">auto</option>
            <option value="lazy">lazy</option>
            <option value="eager">eager</option>
            <option value="unload">unload</option>
          </select>
        </div>
        <div>
          props.loading:
          <select value={loading} onChange={(e) => setLoading(e.target.value)}>
            <option value="auto">auto</option>
            <option value="lazy">lazy</option>
            <option value="eager">eager</option>
            <option value="unload">unload</option>
          </select>
        </div>
      </div>

      <WithAmpContext {...contextProps}>
        <BentoInfo style={style} loading={loading} />
      </WithAmpContext>
    </div>
  );
}
