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

import {
  PolyfillFormDataWrapper,
  createFormDataWrapper,
} from '../../src/form-data-wrapper';
import {Services} from '../../src/services';
import {fromIterator} from '../../src/utils/array';

describes.realWin('FormDataWrapper', {}, env => {
  describe('entries', () => {
    let nativeEntries;
    let nativeDelete;
    const scenarios = [{
      description: 'when native `entries` is not available',

      beforeEach() {
        nativeEntries = FormData.prototype.entries;
        nativeDelete = FormData.prototype.delete;
        // Remove native entries from the prototype in case the browser running
        // the tests already have it to force the "no native `entries`"
        // scenario.
        FormData.prototype.entries = undefined;
        FormData.prototype.delete = undefined;
      },

      afterEach() {
        FormData.prototype.entries = nativeEntries;
        FormData.prototype.delete = nativeDelete;
      },
    }];

    // Intentionally use the non-env global to detect the browser capability
    if (FormData.prototype.entries) {
      scenarios.push({
        description: 'when native `entries` is available',

        beforeEach() {
          // Do nothing as `FormData.prototype` already has `entries`.
        },

        afterEach() {
          // Do nothing as `FormData.prototype` is intact.
        },
      });
    }

    scenarios.forEach(scenario => {
      describe(scenario.description, () => {
        beforeEach(scenario.beforeEach);

        afterEach(scenario.afterEach);

        beforeEach(() => {
          sandbox.stub(Services, 'platformFor').returns({
            isIos() { return false; },
          });
        });

        it('returns empty if no form passed and no entries appended', () => {
          const formData = createFormDataWrapper(env.win);
          expect(fromIterator(formData.entries()))
              .to.be.an('array').that.is.empty;
        });

        describe('when entries appended', () => {
          let formData;

          beforeEach(() => formData = createFormDataWrapper(env.win));

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

          it('returns appended entries without deleted entries', () => {
            formData.append('a', '1');
            formData.append('b', 'true');
            formData.delete('a');

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['b', 'true'],
            ]);
          });

          it('does not delete items if a non-present name is deleted', () => {
            formData.append('a', '1');
            formData.append('b', 'true');
            formData.delete('does-not-exist');

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['a', '1'],
              ['b', 'true'],
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
            const formData = createFormDataWrapper(env.win, form);
            expect(fromIterator(formData.entries()))
                .to.be.an('array').that.is.empty;
          });

          it('returns text input entries in form', () => {
            const input = env.win.document.createElement('input');
            input.type = 'text';
            input.name = 'foo';
            input.value = 'bar';
            form.appendChild(input);

            const formData = createFormDataWrapper(env.win, form);

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['foo', 'bar'],
            ]);
          });

          it('returns textarea entries in form', () => {
            const textarea = env.win.document.createElement('textarea');
            textarea.name = 'foo';
            textarea.value = 'bar';
            form.appendChild(textarea);

            const formData = createFormDataWrapper(env.win, form);

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

            const formData = createFormDataWrapper(env.win, form);

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

            const formData = createFormDataWrapper(env.win, form);

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['foo', 'bar'],
            ]);
          });

          it('returns selected multi-select entries in form', () => {
            const select = env.win.document.createElement('select');
            select.name = 'foo';
            select.multiple = true;

            const selectedOption = env.win.document.createElement('option');
            selectedOption.value = 'bar';
            selectedOption.selected = true;

            const unselectedOption = env.win.document.createElement('option');
            unselectedOption.value = 'bang';
            unselectedOption.selected = true;

            select.appendChild(selectedOption);
            select.appendChild(unselectedOption);
            form.appendChild(select);

            const formData = createFormDataWrapper(env.win, form);

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['foo', 'bar'],
              ['foo', 'bang'],
            ]);
          });

          it('deletes form element values', () => {
            const input = env.win.document.createElement('input');
            input.type = 'text';
            input.name = 'foo';
            input.value = 'bar';
            form.appendChild(input);

            const input2 = env.win.document.createElement('input');
            input2.type = 'text';
            input2.name = 'baz';
            input2.value = 'qux';
            form.appendChild(input2);

            const formData = createFormDataWrapper(env.win, form);
            formData.delete('foo');

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['baz', 'qux'],
            ]);
          });

          it('deletes form element values', () => {
            const input = env.win.document.createElement('input');
            input.type = 'text';
            input.name = 'foo';
            input.value = 'bar';
            form.appendChild(input);

            const input2 = env.win.document.createElement('input');
            input2.type = 'text';
            input2.name = 'baz';
            input2.value = 'qux';
            form.appendChild(input2);

            const formData = createFormDataWrapper(env.win, form);
            formData.delete('foo');

            expect(fromIterator(formData.entries())).to.have.deep.members([
              ['baz', 'qux'],
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

          const formData = createFormDataWrapper(env.win, form);
          formData.append('foo1', 'baz');
          formData.append('42', 'bang');

          expect(fromIterator(formData.entries())).to.have.deep.members([
            ['foo1', 'bar'],
            ['foo2', 'bar'],
            ['foo1', 'baz'],
            ['42', 'bang'],
          ]);
        });

        it('includes the focused submit input at submit-time', () => {
          const form = env.win.document.createElement('form');

          const input = env.win.document.createElement('input');
          input.type = 'text';
          input.name = 'foo1';
          input.value = 'bar';

          const submit = env.win.document.createElement('input');
          submit.type = 'submit';
          submit.name = 'foo2';
          submit.value = 'baz';

          form.appendChild(input);
          form.appendChild(submit);
          env.win.document.body.appendChild(form);

          submit.focus();
          const formData = createFormDataWrapper(env.win, form);
          expect(fromIterator(formData.entries())).to.have.deep.members([
            ['foo1', 'bar'],
            ['foo2', 'baz'],
          ]);
        });

        it('includes the focused submit button at submit-time', () => {
          const form = env.win.document.createElement('form');

          const input = env.win.document.createElement('input');
          input.type = 'text';
          input.name = 'foo1';
          input.value = 'bar';

          const submit = env.win.document.createElement('button');
          submit.name = 'foo2';
          submit.innerText = 'baz';

          form.appendChild(input);
          form.appendChild(submit);
          env.win.document.body.appendChild(form);

          submit.focus();
          const formData = createFormDataWrapper(env.win, form);
          expect(fromIterator(formData.entries())).to.have.deep.members([
            ['foo1', 'bar'],
            ['foo2', ''],
          ]);
        });
      });
    });

    describe('Ios11NativeFormDataWrapper', () => {
      beforeEach(() => {
        sandbox.stub(Services, 'platformFor').returns({
          isIos() { return true; },
          getMajorVersion() { return 11; },
        });
      });

      it('replaces empty file objects in forms with empty blobs', () => {
        const form = env.win.document.createElement('form');

        const input = env.win.document.createElement('input');
        input.type = 'file';
        input.name = 'foo1';

        form.appendChild(input);
        env.win.document.body.appendChild(form);

        const formData = createFormDataWrapper(env.win, form);
        const actual = fromIterator(formData.entries());
        expect(actual[0][0]).to.equal('foo1');
        expect(actual[0][1] instanceof Blob).to.be.true;
      });

      it('appends empty blobs instead of empty file objects', () => {
        const file = new File([], '');
        const formData = createFormDataWrapper(env.win);
        formData.append('myFile', file);

        const actual = fromIterator(formData.entries());
        expect(actual[0][0]).to.equal('myFile');
        expect(actual[0][1] instanceof Blob).to.be.true;
      });
    });

    describe('PolyfillFormDataWrapper', () => {
      it('getFormData matches native behavior', () => {

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

        const polyfillFormDataWrapper = new PolyfillFormDataWrapper(form);

        if (FormData.prototype.entries) {
          const polyfillFormData = polyfillFormDataWrapper.getFormData();
          expect(fromIterator(polyfillFormData.entries())).to.deep.equal(
              fromIterator(new FormData(form).entries()));
        } else {
          // For testing in non-supporting browsers like IE.
          // We can't query the state of FormData, but we can check that
          // the polyfill appended to the real FormData enough.
          const appendSpy =
              env.sandbox.spy(FormData.prototype, 'append');
          polyfillFormDataWrapper.getFormData();
          expect(appendSpy).to.have.been.calledTwice;
        }
      });
    });
  });
});
