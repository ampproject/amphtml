import { jsxStylePropertyString as _jsxStylePropertyString2 } from "#core/dom/jsx/style-property-string";
import { jsxStylePropertyString as _jsxStylePropertyString } from "#core/dom/jsx/style-property-string";
import * as jsx from 'ANYWHERE_LEADING_TO/core/dom/jsx';

const randomObjectExpressionsAreUnmodified = () => ({
  background,
  color: null
});

const nonObjectExpressionsAreUnmodified = () => <div>
    <div style={foo} />
    <div style={foo ? 'foo: bar;' : null} />
  </div>;

const red = 'red';

const otherAttributesAreUnmodified = () => <div foo={{
  color: null,
  'background-color': red,
  backgroundImage,
  opacity: 0,
  width: 100
}} />;

const modified = () => <div style={"background-color:red;" + _jsxStylePropertyString("background-image", backgroundImage, true) + "opacity:0;" + "width:100px;"} />;

const emptyStringValueIsRemoved = () => <div style={""} />;

let dynamic = 0;

function modifyDynamicValue() {
  dynamic = 1;
}

let backgroundColor = 'blue';

const constants = () => <div style={"background-color:blue;" + "width:100px;" + "color:white;" + _jsxStylePropertyString2("opacity", dynamic)} />;

const empty = () => <div style={""} />;
