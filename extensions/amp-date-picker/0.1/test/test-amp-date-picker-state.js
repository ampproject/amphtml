/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import '../../../../third_party/react-dates/bundle';
import * as lolex from 'lolex';
import {AmpDatePicker, DatePickerState} from '../amp-date-picker';
import {createElementWithAttributes} from '../../../../src/dom.js';
import {requireExternal} from '../../../../src/module';

describes.realWin(
  'amp-date-picker',
  {
    amp: {
      runtimeOn: false,
      extensions: ['amp-date-picker'],
    },
  },
  (env) => {
    const moment = requireExternal('moment');
    let clock;
    let document;

    /**
     * @param {!JsonObject<string, string>=} opt_attrs
     * @param {!Element=} opt_parent
     * @return {{
     *   element: !Element,
     *   picker: !AmpDatePicker,
     *   buildCallback: function():!Promise,
     *   layoutCallback: function():!Promise
     * }}
     */
    function createDatePicker(opt_attrs = {}, opt_parent = document.body) {
      const attrs = {...opt_attrs};
      let input = null;
      let endInput = null;
      if (attrs['mode'] === 'overlay') {
        input = document.createElement('input');
        input.id = 'date';

        if (attrs['type'] === 'range') {
          endInput = document.createElement('input');
          endInput.id = 'endDate';
          attrs['start-input-selector'] = '#date';
          attrs['end-input-selector'] = '#endDate';
        } else {
          attrs['input-selector'] = '#date';
        }
      }
      const element = createElementWithAttributes(
        document,
        'amp-date-picker',
        attrs
      );

      if (input) {
        element.appendChild(input);
      }
      if (endInput) {
        element.appendChild(endInput);
      }
      opt_parent.appendChild(element);
      const picker = new AmpDatePicker(element);

      return {
        element,
        input,
        endInput,
        picker,
        async buildCallback() {
          await picker.buildCallback();
        },
        async layoutCallback() {
          await picker.buildCallback();
          await picker.layoutCallback();
        },
      };
    }

    beforeEach(() => {
      document = env.win.document;
      clock = lolex.install({
        // Use the global window and not env.win. There is no way to inject the
        // env.win into moment right now.
        target: window,
        now: new Date('2018-01-01T08:00:00Z'),
      });
    });

    afterEach(() => {
      clock.uninstall();
    });

    describes.repeated(
      'picker type',
      {
        'range picker': {type: 'range'},
        'single picker': {type: 'single'},
      },
      (name, variant) => {
        describe('static states', () => {
          it('should start in the static state', async () => {
            const {picker, layoutCallback} = createDatePicker({
              'layout': 'fixed-height',
              'height': '360',
              'type': variant.type,
            });

            await layoutCallback();
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.STATIC
            );
          });

          it('should remain in the static state after a transition', async () => {
            const {element, picker, layoutCallback} = createDatePicker({
              'layout': 'fixed-height',
              'height': '360',
              'type': variant.type,
            });

            await layoutCallback();
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.STATIC
            );

            const fakeEscEvent = {
              target: element,
              key: 'Escape',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeEscEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.STATIC
            );

            picker.transitionTo_(DatePickerState.OVERLAY_OPEN_PICKER);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.STATIC
            );
          });
        });

        describe('overlay states', () => {
          it('should start in the unopened state', async () => {
            const {picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_CLOSED
            );
          });

          it('should transition to the opened state on focus', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeEvent = {target: input};
            picker.handleFocus_(fakeEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );
          });

          it('should transition to the closed state on blur', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeBlurEvent = {target: document.body};
            picker.handleFocus_(fakeBlurEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_CLOSED
            );
          });

          it('should transition to the closed state on esc', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeEscEvent = {
              target: input,
              key: 'Escape',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeEscEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_CLOSED
            );
          });

          it('should transition to picker state on arrow', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeKeydownEvent = {
              target: input,
              key: 'ArrowDown',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeKeydownEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );
          });

          it('should transition directly to picker state on arrow from closed', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_CLOSED
            );

            const fakeKeydownEvent = {
              target: input,
              key: 'ArrowDown',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeKeydownEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );
          });

          it('should transition to closed state from picker on esc', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });
            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeKeydownEvent = {
              target: input,
              key: 'ArrowDown',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeKeydownEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );

            const fakeEscEvent = {
              target: input,
              key: 'Escape',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeEscEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_CLOSED
            );
          });

          it('should transition to closed state from picker on document click', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeKeydownEvent = {
              target: input,
              key: 'ArrowDown',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeKeydownEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );

            const fakeClickEvent = {
              target: document.documentElement,
            };
            picker.handleClick_(fakeClickEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_CLOSED
            );
          });

          it('should remain in picker state on click in picker', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeKeydownEvent = {
              target: input,
              key: 'ArrowDown',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeKeydownEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );

            const fakeClickEvent = {
              target: input,
            };
            picker.handleClick_(fakeClickEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );
          });

          it('should transition to input state from picker on focus', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeKeydownEvent = {
              target: input,
              key: 'ArrowDown',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeKeydownEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );

            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );
          });

          it('should remain in open picker on clear', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeKeydownEvent = {
              target: input,
              key: 'ArrowDown',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeKeydownEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );

            picker.handleClear_();
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );
          });

          it('should transition from open picker to open input on clear with open-after-clear', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            const fakeKeydownEvent = {
              target: input,
              key: 'ArrowDown',
              preventDefault() {},
            };
            picker.handleKeydown_(fakeKeydownEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );

            picker.handleClear_();
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_PICKER
            );
          });

          it('should transition to closed after date change', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            picker.onDateChange(moment('2018-03-01'));
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_CLOSED
            );
          });

          it('should not transition to closed with open-after-select', async () => {
            const {input, picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'open-after-select': '',
              'type': variant.type,
            });

            await layoutCallback();
            const fakeFocusEvent = {target: input};
            picker.handleFocus_(fakeFocusEvent);
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );

            picker.onDateChange(moment('2018-03-01'));
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );
          });

          it('should transition from closed to open input in on clear with open-after-clear', async () => {
            const {picker, layoutCallback} = createDatePicker({
              'mode': 'overlay',
              'type': variant.type,
              'open-after-clear': '',
            });

            await layoutCallback();
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_CLOSED
            );

            picker.handleClear_();
            expect(picker.stateMachine_.state_).to.equal(
              DatePickerState.OVERLAY_OPEN_INPUT
            );
          });
        });
      }
    );
  }
);
