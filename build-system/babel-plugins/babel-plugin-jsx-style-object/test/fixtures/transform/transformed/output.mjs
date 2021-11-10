import { jsxStylePropertyString } from "core/dom/jsx-style-property-string";
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

const modified = () => <div style={jsxStylePropertyString("color", null, true) + "background-color:red;" + jsxStylePropertyString("background-image", backgroundImage, true) + "opacity:0;width:100px;"} />;

let dynamic = 0;

function modifyDynamicValue() {
  dynamic = 1;
}

let backgroundColor = 'blue';

const constantsAreCollapsed = () => <div style={"background-color:blue;width:100px;color:white;" + jsxStylePropertyString("opacity", dynamic)} />;

const dimensional = () => <div style={"width:100px;" + jsxStylePropertyString("height", height, true)} />;

const flex = 1;

const nonDimensional = () => <div>
    <div style={jsxStylePropertyString("animation-iteration-count", animationIterationCount)} />
    <div style={jsxStylePropertyString("box-flex", boxFlex)} />
    <div style={jsxStylePropertyString("box-flex-group", boxFlexGroup)} />
    <div style={jsxStylePropertyString("box-ordinal-group", boxOrdinalGroup)} />
    <div style={jsxStylePropertyString("column-count", columnCount)} />
    <div style={"fill-opacity:0;"} />
    <div style={"flex:1;"} />
    <div style={jsxStylePropertyString("flex-grow", flexGrow)} />
    <div style={jsxStylePropertyString("flex-positive", flexPositive)} />
    <div style={jsxStylePropertyString("flex-shrink", flexShrink)} />
    <div style={jsxStylePropertyString("flex-negative", flexNegative)} />
    <div style={jsxStylePropertyString("flex-order", flexOrder)} />
    <div style={jsxStylePropertyString("font-weight", fontWeight)} />
    <div style={jsxStylePropertyString("line-clamp", lineClamp)} />
    <div style={jsxStylePropertyString("line-height", lineHeight)} />
    <div style={"opacity:0.5;"} />
    <div style={jsxStylePropertyString("order", order)} />
    <div style={jsxStylePropertyString("orphans", orphans)} />
    <div style={jsxStylePropertyString("stop-opacity", stopOpacity)} />
    <div style={jsxStylePropertyString("stroke-dashoffset", strokeDashoffset)} />
    <div style={jsxStylePropertyString("stroke-opacity", strokeOpacity)} />
    <div style={jsxStylePropertyString("stroke-width", strokeWidth)} />
    <div style={jsxStylePropertyString("tab-size", tabSize)} />
    <div style={jsxStylePropertyString("widows", widows)} />
    <div style={jsxStylePropertyString("z-index", zIndex)} />
    <div style={jsxStylePropertyString("zoom", zoom)} />
  </div>;
