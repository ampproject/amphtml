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

describes.endtoend(
  'amp-date-countdown',
  {
    version: '1.0',
    fixture: 'amp-date-countdown/amp-date-countdown.html',
    experiments: ['bento-date-countdown'],
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('renders a custom mustache template', async () => {
      const template = await controller.findElement('#one div');

      const text = await controller.getElementProperty(template, 'textContent');
      const data = JSON.parse(text.trim());

      await expect(data['d']).to.equal('0');
      await expect(data['dd']).to.equal('00');
      await expect(data['h']).to.equal('0');
      await expect(data['hh']).to.equal('00');
      await expect(data['m']).to.equal('0');
      await expect(data['mm']).to.equal('00');
      await expect(data['s']).to.equal('0');
      await expect(data['ss']).to.equal('00');

      await expect(data['years']).to.equal('Years');
      await expect(data['months']).to.equal('Months');
      await expect(data['days']).to.equal('Days');
      await expect(data['hours']).to.equal('Hours');
      await expect(data['minutes']).to.equal('Minutes');
      await expect(data['seconds']).to.equal('Seconds');
    });

    it('renders default template', async () => {
      const template = await controller.findElement('#two div');

      const text = await controller.getElementProperty(template, 'textContent');
      await expect(text).to.equal('Days 00, Hours 00, Minutes 00, Seconds 00');
    });

    it('renders correct time and locale respecting biggest unit', async () => {
      const template = await controller.findElement('#three div');

      const text = await controller.getElementProperty(template, 'textContent');
      const data = JSON.parse(text.trim());

      await expect(data['d']).to.equal('0');
      await expect(data['dd']).to.equal('00');
      await expect(data['h']).to.equal('27');
      await expect(data['hh']).to.equal('27');
      await expect(data['m']).to.equal('46');
      await expect(data['mm']).to.equal('46');
      // omit check for seconds as it causes flakiness
      // due to rendering timing

      await expect(data['years']).to.equal('Jahren');
      await expect(data['months']).to.equal('Monaten');
      await expect(data['days']).to.equal('Tagen');
      await expect(data['hours']).to.equal('Stunden');
      await expect(data['minutes']).to.equal('Minuten');
      await expect(data['seconds']).to.equal('Sekunden');
    });
  }
);
