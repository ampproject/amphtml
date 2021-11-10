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

let dynamic = 0;
function modifyDynamicValue() {
  dynamic = 1;
}

let backgroundColor = 'blue';

const constantsAreCollapsed = () => (
  <div
    style={{
      backgroundColor,
      width: 100,
      color: 'white',
      opacity: dynamic,
    }}
  />
);

const dimensional = () => <div style={{width: 100, height}} />;

const flex = 1;
const nonDimensional = () => (
  <div>
    <div style={{animationIterationCount}} />
    <div style={{boxFlex}} />
    <div style={{boxFlexGroup}} />
    <div style={{boxOrdinalGroup}} />
    <div style={{columnCount}} />
    <div style={{fillOpacity: 0}} />
    <div style={{flex}} />
    <div style={{flexGrow}} />
    <div style={{flexPositive}} />
    <div style={{flexShrink}} />
    <div style={{flexNegative}} />
    <div style={{flexOrder}} />
    <div style={{fontWeight}} />
    <div style={{lineClamp}} />
    <div style={{lineHeight}} />
    <div style={{opacity: 0.5}} />
    <div style={{order}} />
    <div style={{orphans}} />
    <div style={{stopOpacity}} />
    <div style={{strokeDashoffset}} />
    <div style={{strokeOpacity}} />
    <div style={{strokeWidth}} />
    <div style={{tabSize}} />
    <div style={{widows}} />
    <div style={{zIndex}} />
    <div style={{zoom}} />
  </div>
);
