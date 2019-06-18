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

describes.realWin(
  'amp-date-picker',
  {
    amp: {
      runtimeOn: false,
      extensions: ['amp-date-picker'],
    },
  },
  env => {
    let clock;
    let document;

    const DEFAULT_ATTRS = {
      layout: 'fixed-height',
      height: '360',
    };

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
      const attrs = Object.assign({}, DEFAULT_ATTRS, opt_attrs);
      const element = createElementWithAttributes(
        document,
        'amp-date-picker',
        attrs
      );

      opt_parent.appendChild(element);
      const picker = new AmpDatePicker(element);

      return {
        element,
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

    describe('static states', () => {
      it('should start in the static state', async () => {
        const {picker, layoutCallback} = createDatePicker({
          'layout': 'fixed-height',
          'height': '360',
        });

        await layoutCallback();
        expect(picker.stateMachine_.state_).to.equal(DatePickerState.STATIC);
      });
    });

    describe('overlay states', () => {
      it('should start in the unopened state', async () => {
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

        await layoutCallback();
        expect(picker.stateMachine_.state_).to.equal(
          DatePickerState.OVERLAY_CLOSED
        );
      });

      it('should transition to the opened state on focus', async () => {
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

        await layoutCallback();
        const fakeEvent = {target: input};
        picker.handleFocus_(fakeEvent);
        expect(picker.stateMachine_.state_).to.equal(
          DatePickerState.OVERLAY_OPEN_INPUT
        );
      });

      it('should transition to the closed state on blur', async () => {
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

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
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

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
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

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
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

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
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

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
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

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
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

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
        const {element, picker, layoutCallback} = createDatePicker({
          'mode': 'overlay',
          'input-selector': '#date',
        });
        const input = document.createElement('input');
        input.id = 'date';
        element.appendChild(input);

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
    });
  }
);
