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

import * as Preact from '#preact';
import {BentoBrightcove} from '../component';

export default {
  title: 'Brightcove',
  component: BentoBrightcove,
  args: {
    autoplay: false,
    videoId: 'ref:amp-docs-sample',
    player: 'SyIOV8yWM',
    account: '1290862519001',
  },
};

export const _default = (args) => {
  return <BentoBrightcove style={{width: 480, height: 270}} {...args} />;
};
