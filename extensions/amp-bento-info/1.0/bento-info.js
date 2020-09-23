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
import * as Preact from '../../../src/preact';
import {CarouselContext} from '../../amp-base-carousel/1.0/carousel-context';
import {ContainWrapper} from '../../../src/preact/component';
import {useAmpContext, useLoad} from '../../../src/preact/context';
import {useMemo, useState} from '../../../src/preact';

/**
 * @return {PreactDef.Renderable}
 */
export function BentoInfo({loading, onLoad, onLoadError, ...rest}) {
  const context = useAmpContext();
  const load = useLoad(loading);

  const src = 'http://localhost:8000/examples/img/sea@1x.jpg';

  return (
    <div>
      <div>context.renderable: {String(context.renderable)}</div>
      <div>context.playable: {String(context.playable)}</div>
      <div>context.loading: {String(context.loading)}</div>
      <div>props.loading: {String(rest['loading'])}</div>
      <div>command.load: {String(load)}</div>
      <img
        src={load ? src : null}
        onLoad={onLoad}
        onError={onLoadError}
        style={{width: 40, height: 40}}
        />
    </div>
  );
}
