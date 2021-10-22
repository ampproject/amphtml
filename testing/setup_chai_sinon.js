import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import stringify from 'json-stable-stringify';
import sinon from 'sinon'; // eslint-disable-line local/no-import
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
window.chai = chai;
window.should = chai.should();
window.expect = chai.expect;
window.assert = chai.assert;
window.sinon = sinon;

chai.use(chaiAsPromised);

chai.Assertion.addMethod('attribute', function (attr) {
  const obj = this._obj;
  const tagName = obj.tagName.toLowerCase();
  this.assert(
    obj.hasAttribute(attr),
    "expected element '" + tagName + "' to have attribute #{exp}",
    "expected element '" + tagName + "' to not have attribute #{act}",
    attr,
    attr
  );
});

chai.Assertion.addMethod('class', function (className) {
  const obj = this._obj;
  const tagName = obj.tagName.toLowerCase();
  this.assert(
    obj.classList.contains(className),
    "expected element '" + tagName + "' to have class #{exp}",
    "expected element '" + tagName + "' to not have class #{act}",
    className,
    className
  );
});

chai.Assertion.addProperty('visible', function () {
  const obj = this._obj;
  const computedStyle = window.getComputedStyle(obj);
  const visibility = computedStyle.getPropertyValue('visibility');
  const opacity = computedStyle.getPropertyValue('opacity');
  const isOpaque = parseInt(opacity, 10) > 0;
  const tagName = obj.tagName.toLowerCase();
  this.assert(
    visibility === 'visible' && isOpaque,
    "expected element '" +
      tagName +
      "' to be #{exp}, got #{act}. with classes: " +
      obj.className,
    "expected element '" +
      tagName +
      "' not to be #{exp}, got #{act}. with classes: " +
      obj.className,
    'visible and opaque',
    `visibility = ${visibility} and opacity = ${opacity}`
  );
});

chai.Assertion.addProperty('hidden', function () {
  const obj = this._obj;
  const computedStyle = window.getComputedStyle(obj);
  const visibility = computedStyle.getPropertyValue('visibility');
  const opacity = computedStyle.getPropertyValue('opacity');
  const tagName = obj.tagName.toLowerCase();
  this.assert(
    visibility === 'hidden' || parseInt(opacity, 10) == 0,
    "expected element '" +
      tagName +
      "' to be #{exp}, got #{act}. with classes: " +
      obj.className,
    "expected element '" +
      tagName +
      "' not to be #{act}. with classes: " +
      obj.className,
    'hidden',
    visibility
  );
});

chai.Assertion.addMethod('display', function (display) {
  const obj = this._obj;
  const value = window.getComputedStyle(obj).getPropertyValue('display');
  const tagName = obj.tagName.toLowerCase();
  this.assert(
    value === display,
    "expected element '" + tagName + "' to be display #{exp}, got #{act}.",
    "expected element '" + tagName + "' not to be display #{act}.",
    display,
    value
  );
});

chai.Assertion.addMethod('jsonEqual', function (compare) {
  const obj = this._obj;
  const a = stringify(compare);
  const b = stringify(obj);
  this.assert(
    a == b,
    'expected JSON to be equal.\nExp: #{exp}\nAct: #{act}',
    'expected JSON to not be equal.\nExp: #{exp}\nAct: #{act}',
    a,
    b
  );
});
