/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {FormDataWrapper} from '../../src/form-data-wrapper';
import {fromIterator} from '../../src/utils/array';

describes.realWin('FormDataWrapper', {}, env => {
  describe('entries', () => {
    let nativeEntries;
    const scenarios = [{
      description: 'when native `entries` is not available',

      beforeEach() {
        nativeEntries = FormData.prototype.entries;
        // Remove native entries from the prototype in case the browser running
        // the tests already have it to force the "no native `entries`"
        // scenario.
        FormData.prototype.entries = undefined;
      },

      afterEach() {
        FormData.prototype.entries = nativeEntries;
      },
    }];
    if (FormData.prototype.entries) {
      scenarios.push({
        description: 'when native `entries` is available',

        beforeEach() {
          // Do nothing as `env.win.FormData.prototype` already has `entires`.
        },

        afterEach() {
          // Do nothing as `env.win.FormData.prototype` is intact.
        },
      });
    }

    scenarios.forEach(scenario => {
      describe(scenario.description, () => {
        beforeEach(scenario.beforeEach);

        afterEach(scenario.afterEach);

        it('returns empty if no form passed and no entries appended', () => {
          const formData = new FormDataWrapper();
          expect(fromIterator(formData.entries()))
              .to.be.an('array').that.is.empty;
        });

        describe('when entries appended', () => {
          let formData;

          beforeEach(() => formData = new FormDataWrapper());

          it('returns appended string entries', () => {
            formData.append('a', '1');
            formData.append('b', 'true');

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['a', '1'],
              ['b', 'true'],
            ]);
          });

          it('returns appended non-string entries', () => {
            formData.append(1, true);
            formData.append(-3.4, null);
            formData.append(false, undefined);

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['1', 'true'],
              ['-3.4', 'null'],
              ['false', 'undefined'],
            ]);
          });
        });

        describe('when form passed to constructor', () => {
          let form;

          beforeEach(() => {
            form = env.win.document.createElement('form');
            env.win.document.body.appendChild(form);
          });

          it('returns empty if no entries in form', () => {
            const formData = new FormDataWrapper(form);
            expect(fromIterator(formData.entries()))
                .to.be.an('array').that.is.empty;
          });

          it('returns text input entries in form', () => {
            const input = env.win.document.createElement('input');
            input.type = 'text';
            input.name = 'foo';
            input.value = 'bar';
            form.appendChild(input);

            const formData = new FormDataWrapper(form);

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['foo', 'bar'],
            ]);
          });

          it('returns textarea entries in form', () => {
            const textarea = env.win.document.createElement('textarea');
            textarea.name = 'foo';
            textarea.value = 'bar';
            form.appendChild(textarea);

            const formData = new FormDataWrapper(form);

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['foo', 'bar'],
            ]);
          });

          it('returns checked checkbox entries in form', () => {
            const input = env.win.document.createElement('input');
            input.type = 'checkbox';
            input.name = 'foo';
            input.value = 'bar';
            input.checked = true;
            form.appendChild(input);

            const formData = new FormDataWrapper(form);

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['foo', 'bar'],
            ]);
          });

          it('returns selected single-select entries in form', () => {
            const select = env.win.document.createElement('select');
            select.name = 'foo';
            select.multiple = false;

            const selectedOption = env.win.document.createElement('option');
            selectedOption.value = 'bar';
            selectedOption.selected = true;

            const unselectedOption = env.win.document.createElement('option');
            unselectedOption.value = 'bang';
            unselectedOption.selected = false;

            select.appendChild(selectedOption);
            select.appendChild(unselectedOption);
            form.appendChild(select);

            const formData = new FormDataWrapper(form);

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['foo', 'bar'],
            ]);
          });
        });

        it('returns multiple form entries and appended entries', () => {
          const form = env.win.document.createElement('form');

          const input = env.win.document.createElement('input');
          input.type = 'text';
          input.name = 'foo1';
          input.value = 'bar';

          const textarea = env.win.document.createElement('textarea');
          textarea.name = 'foo2';
          textarea.value = 'bar';

          form.appendChild(input);
          form.appendChild(textarea);
          env.win.document.body.appendChild(form);

          const formData = new FormDataWrapper(form);
          formData.append('foo1', 'baz');
          formData.append('42', 'bang');

          expect(fromIterator(formData.entries())).to.have.deep.members([
            ['foo1', 'bar'],
            ['foo2', 'bar'],
            ['foo1', 'baz'],
            ['42', 'bang'],
          ]);
        });
      });
    });
  });
});
