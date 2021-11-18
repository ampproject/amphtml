import {AmpEvents_Enum} from '#core/constants/amp-events';
import {closestAncestorElementBySelector} from '#core/dom/query';

import {Services} from '#service';

import {createCustomEvent, getDetail} from '#utils/event-helper';

import {DIRTINESS_INDICATOR_CLASS, FormDirtiness} from '../form-dirtiness';

function getForm(doc) {
  const form = doc.createElement('form');
  form.setAttribute('method', 'POST');
  doc.body.appendChild(form);

  return form;
}

function createElement(doc, tagName, attributes) {
  const element = doc.createElement(tagName);
  for (const attributeName in attributes) {
    element.setAttribute(attributeName, attributes[attributeName]);
  }
  return element;
}

function changeInput(element, value) {
  element.value = value;
  dispatchInputEvent(element);
}

function checkInput(element, checked) {
  element.checked = checked;
  dispatchInputEvent(element);
}

function selectOption(option, selected) {
  option.selected = selected;

  // The native `InputEvent` is dispatched at the parent `<select>` when its
  // selected `<option>` changes.
  dispatchInputEvent(closestAncestorElementBySelector(option, 'select'));
}

function dispatchInputEvent(element) {
  const event = new Event('input', {bubbles: true});
  element.dispatchEvent(event);
}

function dispatchFormValueChangeEvent(element, win) {
  const ampValueChangeEvent = createCustomEvent(
    win,
    AmpEvents_Enum.FORM_VALUE_CHANGE,
    /* detail */ null,
    {bubbles: true}
  );
  element.dispatchEvent(ampValueChangeEvent);
}

function captureEventDispatched(eventName, element, dispatchEventFunction) {
  let eventCaptured = null;

  const handlerToCaptureEvent = (e) => {
    eventCaptured = e;
  };

  element.addEventListener(eventName, handlerToCaptureEvent);
  dispatchEventFunction();
  element.removeEventListener(eventName, handlerToCaptureEvent);

  return eventCaptured;
}

describes.realWin('form-dirtiness', {}, (env) => {
  let doc, form, dirtinessHandler;

  beforeEach(() => {
    doc = env.win.document;
    form = getForm(doc);
    env.sandbox.stub(Services, 'platformFor').returns({
      isIos() {
        return false;
      },
    });
    dirtinessHandler = new FormDirtiness(form, env.win);
  });

  describe('ignored elements', () => {
    it('does not add dirtiness class if a nameless element changes', () => {
      const nameless = doc.createElement('input');
      form.appendChild(nameless);

      changeInput(nameless, 'changed');

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('does not add dirtiness class if a hidden element changes', () => {
      const hidden = doc.createElement('input');
      hidden.name = 'name';
      hidden.hidden = true;
      form.appendChild(hidden);

      changeInput(hidden, 'changed');

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('does not add dirtiness class if a disabled element changes', () => {
      const disabled = doc.createElement('input');
      disabled.name = 'name';
      disabled.disabled = true;
      form.appendChild(disabled);

      changeInput(disabled, 'changed');
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('amp-bind changes', () => {
    let input;

    beforeEach(() => {
      input = doc.createElement('input');
      input.name = 'name';
      form.appendChild(input);
    });

    it('adds dirtiness class if an element is changed with amp-bind', () => {
      input.value = 'changed';
      dispatchFormValueChangeEvent(input, env.win);

      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class if a dirty element is cleared with amp-bind', () => {
      changeInput(input, 'changed');
      input.value = '';
      dispatchFormValueChangeEvent(input, env.win);

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('text field changes', () => {
    let textField;

    beforeEach(() => {
      // Element is inserted as HTML so that the `defaultValue` property is
      // generated correctly, since it returns "the default value as
      // **originally specified in the HTML** that created this object."
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement#Properties
      const html = '<input name="name" type="text" value="default">';
      form.insertAdjacentHTML('afterbegin', html);
      textField = form.querySelector('input');
    });

    it('removes dirtiness class when text field is in default state', () => {
      changeInput(textField, textField.defaultValue);
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class when text field is empty', () => {
      changeInput(textField, '');
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('adds dirtiness class when text field is changed', () => {
      changeInput(textField, 'changed');
      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class when its value matches the submitted value', () => {
      changeInput(textField, 'submitted');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();
      changeInput(textField, 'submitted');

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('textarea changes', () => {
    let textarea;

    beforeEach(() => {
      const html = '<textarea name="comment">default</textarea>';
      form.insertAdjacentHTML('afterbegin', html);
      textarea = form.querySelector('textarea');
    });

    it('removes dirtiness class when textarea is in default state', () => {
      changeInput(textarea, textarea.defaultValue);
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class when textarea is empty', () => {
      changeInput(textarea, '');
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('adds dirtiness class when textarea is changed', () => {
      changeInput(textarea, 'changed');
      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('removes dirtiness class when its value matches the submitted value', () => {
      changeInput(textarea, 'submitted');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();
      changeInput(textarea, 'submitted');

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('checkbox changes', () => {
    let checkbox;

    beforeEach(() => {
      checkbox = createElement(doc, 'input', {
        type: 'checkbox',
        name: 'checkbox',
      });
      form.appendChild(checkbox);
    });

    it('clears dirtiness class when checkbox is in default state', () => {
      checkbox.setAttribute('checked', 'checked');
      checkInput(checkbox, true);

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('clears dirtiness class when checkbox is not checked', () => {
      checkInput(checkbox, false);
      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('adds dirtiness class when checkbox state has changed', () => {
      checkInput(checkbox, true);
      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('clears dirtiness class when checkbox matches its submitted state', () => {
      checkInput(checkbox, true);
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();
      checkInput(checkbox, true);

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('radio button changes', () => {
    let optionA, optionB;

    beforeEach(() => {
      optionA = createElement(doc, 'input', {type: 'radio', name: 'radio'});
      optionB = createElement(doc, 'input', {type: 'radio', name: 'radio'});
      form.appendChild(optionA);
      form.appendChild(optionB);
    });

    it('clears dirtiness class when radio button is in default state', () => {
      optionA.setAttribute('checked', 'checked');
      checkInput(optionA, true);

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('clears dirtiness class when no radio button is checked', () => {
      checkInput(optionA, false);
      checkInput(optionB, false);

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('adds dirtiness class when radio button state has changed', () => {
      checkInput(optionB, true);
      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('clears dirtiness class when radio button state matches its submitted state', () => {
      checkInput(optionB, true);
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();
      checkInput(optionB, true);

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('dropdown selection changes', () => {
    let dropdown, optionA, optionB;

    beforeEach(() => {
      dropdown = createElement(doc, 'select', {name: 'select'});
      optionA = createElement(doc, 'option', {value: 'A'});
      optionB = createElement(doc, 'option', {value: 'B'});

      dropdown.appendChild(optionA);
      dropdown.appendChild(optionB);
      form.appendChild(dropdown);
    });

    it('clears dirtiness class when dropdown is in its default state', () => {
      optionA.setAttribute('selected', 'selected');
      selectOption(optionA, true);

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('adds dirtiness class when dropdown is not in its default state', () => {
      selectOption(optionB, true);
      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('clears dirtiness class when dropdown selection matches its submitted state', () => {
      selectOption(optionA, true);
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();
      selectOption(optionA, true);

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('#onSubmitting', () => {
    it('clears the dirtiness class', () => {
      const input = doc.createElement('input');
      input.type = 'text';
      input.name = 'text';
      form.appendChild(input);

      changeInput(input, 'changed');
      dirtinessHandler.onSubmitting();

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('#onSubmitError', () => {
    let input;

    beforeEach(() => {
      input = doc.createElement('input');
      input.type = 'text';
      input.name = 'text';
      form.appendChild(input);
    });

    it('adds the dirtiness class if the form was dirty before submitting', () => {
      changeInput(input, 'changed');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitError();

      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('does not add the dirtiness class if the form was clean before submitting', () => {
      changeInput(input, '');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitError();

      expect(form).to.have.not.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('#onSubmitSuccess', () => {
    let input;

    beforeEach(() => {
      input = doc.createElement('input');
      input.type = 'text';
      input.name = 'text';
      form.appendChild(input);
    });

    it('clears the dirtiness class', () => {
      changeInput(input, 'changed');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();

      expect(form).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('tracks new changes after the form has been submitted', () => {
      changeInput(input, 'changed');
      dirtinessHandler.onSubmitting();
      dirtinessHandler.onSubmitSuccess();
      changeInput(input, 'changed again');

      expect(form).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });

  describe('AmpEvents_Enum.FORM_DIRTINESS_CHANGE', () => {
    let input;

    beforeEach(() => {
      input = createElement(doc, 'input', {type: 'text', name: 'text'});
      form.appendChild(input);
    });

    it('dispatches an event when the form transitions from clean to dirty', () => {
      const changeToDirty = () => changeInput(input, 'changed');
      const eventDispatched = captureEventDispatched(
        AmpEvents_Enum.FORM_DIRTINESS_CHANGE,
        form,
        changeToDirty
      );

      expect(eventDispatched).to.exist;
      expect(getDetail(eventDispatched).isDirty).to.be.true;
    });

    it('dispatches an event when the form transitions from dirty to clean', () => {
      changeInput(input, 'changed');

      const changeToClean = () => changeInput(input, '');
      const eventDispatched = captureEventDispatched(
        AmpEvents_Enum.FORM_DIRTINESS_CHANGE,
        form,
        changeToClean
      );

      expect(eventDispatched).to.exist;
      expect(getDetail(eventDispatched).isDirty).to.be.false;
    });

    it('does not dispatch an event when the dirtiness state does not change', () => {
      changeInput(input, 'changed');

      const remainDirty = () => changeInput(input, 'still dirty');
      const eventDispatched = captureEventDispatched(
        AmpEvents_Enum.FORM_DIRTINESS_CHANGE,
        form,
        remainDirty
      );

      expect(eventDispatched).to.not.exist;
    });
  });

  describe('initial dirtiness', () => {
    let newForm, input;

    beforeEach(() => {
      newForm = getForm(doc);
      input = createElement(doc, 'input', {type: 'text', name: 'text'});
      newForm.appendChild(input);
    });

    it('adds the dirtiness class if the form already has dirty fields', () => {
      changeInput(input, 'changed');
      dirtinessHandler = new FormDirtiness(newForm, env.win);

      expect(newForm).to.have.class(DIRTINESS_INDICATOR_CLASS);
    });

    it('does not add the dirtiness class if the form does not have dirty fields', () => {
      dirtinessHandler = new FormDirtiness(newForm, env.win);
      expect(newForm).to.not.have.class(DIRTINESS_INDICATOR_CLASS);
    });
  });
});
