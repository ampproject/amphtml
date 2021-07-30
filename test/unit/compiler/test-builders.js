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
import {getBuilders} from '#compiler/builders';

describes.sandboxed('getBuilders', {}, () => {
  it('should return an empty list for empty extensions with nonexistent runtime', () => {
    const extensions = [];
    const runtime = 'nonexistent';

    expect(getBuilders({runtime, extensions})).to.eql({});
  });

  it('should return eligible builtins when provided valid runtime', () => {
    const extensions = [];
    const runtime = 'v0';
    const builders = getBuilders({runtime, extensions});

    expect(builders).have.all.keys(['amp-layout']);
  });

  it('eligible extension with wrong version is not used', () => {
    const extensions = [{name: 'amp-fit-text', version: '1.0'}];
    const runtime = 'nonexistent';

    const builders = getBuilders({runtime, extensions});
    expect(builders).have.all.keys([]);
  });

  it('should return eligible extensions', () => {
    const extensions = [{name: 'amp-fit-text', version: '0.1'}];
    const runtime = 'v0';

    const builders = getBuilders({runtime, extensions});
    expect(builders).have.all.keys(['amp-layout', 'amp-fit-text']);
  });
});
