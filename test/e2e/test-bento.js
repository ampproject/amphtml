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

describes.endtoend('Bento', {fixture: 'bento/index.html'}, async (env) => {
  it('applies static layout without v0.js', async () => {
    const layoutSizedDefined = await env.controller.findElement(
      '.i-amphtml-layout-size-defined'
    );
    await expect(layoutSizedDefined).ok;
  });
});
