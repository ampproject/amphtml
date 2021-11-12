import * as jsx from 'ANYWHERE_LEADING_TO/core/dom/jsx';

const randomObjectExpressionsAreUnmodified = () => ({
  background,
  color: null,
});

const nonObjectExpressionsAreUnmodified = () => (
  <div>
    <div style={foo} />
    <div style={foo ? 'foo: bar;' : null} />
  </div>
);

const red = 'red';
const otherAttributesAreUnmodified = () => (
  <div
    foo={{
      color: null,
      'background-color': red,
      backgroundImage,
      opacity: 0,
      width: 100,
    }}
  />
);

const modified = () => (
  <div
    style={{
      color: null,
      'background-color': red,
      backgroundImage,
      opacity: 0,
      width: 100,
    }}
  />
);

const emptyStringValueIsRemoved = () => <div style={{background: ''}} />;

let dynamic = 0;
function modifyDynamicValue() {
  dynamic = 1;
}

let backgroundColor = 'blue';

const constants = () => (
  <div
    style={{
      backgroundColor,
      width: 100,
      color: 'white',
      opacity: dynamic,
    }}
  />
);

const empty = () => (
  <div
    style={{
      background: '',
      color: null,
    }}
  />
);
