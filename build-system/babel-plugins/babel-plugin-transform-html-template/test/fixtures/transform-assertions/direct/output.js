const _template = ["html usage"],
      _template2 = ["svg usage"],
      _template3 = ["<div>html usage</div>"],
      _template4 = ["<div>fourth sibling</div>"],
      _template5 = ["<div>fifth sibling</div>"],
      _template6 = ["<svg>sixth sibling</svg>"],
      _template7 = ["<svg>seventh sibling</svg>"];
console.log(html(["html usage"]));
console.log(html(["html usage multiline"]));
console.log(html(["<p active=true>Attribute Quote Removal</p>"]));
console.log(html(["<p data-order-state=\"new 'thing'\">Impossible to Remove Quotes</p>"]));
console.log(html(["<p><span>html usage</span> <span>more spans</span></p>"]));
console.log(html(["<p><span>html usage</span> <span>whitespace before entry tag</span></p>"]));
console.log(html(["<p><span>html usage</span> <span>whitespace after entry tag</span></p>"]));
console.log(html(["<p><span>html usage</span> <span>whitespace before and after entry tag</span></p>"]));
console.log(html(["<p><span>html usage</span> <span>comment before entry tag</span></p>"]));
console.log(html(["<p><span>html usage</span> <span>comment after entry tag</span></p>"]));
console.log(html(["<p><span>html usage</span> <span>with comment sibling</span></p>"]));
console.log(htmlFor(element)(["html usage"]));
console.log(htmlFor(element)(["html usage multiline"]));
console.log(htmlFor(element)(["<p active=true>Attribute Quote Removal</p>"]));
console.log(htmlFor(element)(["<p data-order-state=\"new 'thing'\">Impossible to Remove Quotes</p>"]));
console.log(htmlFor(element)(["<p><span>html usage</span> <span>more spans</span></p>"]));
console.log(htmlFor(element)(["<p><span>html usage</span> <span>whitespace before entry tag</span></p>"]));
console.log(htmlFor(element)(["<p><span>html usage</span> <span>whitespace after entry tag</span></p>"]));
console.log(htmlFor(element)(["<p><span>html usage</span> <span>whitespace before and after entry tag</span></p>"]));
console.log(htmlFor(element)(["<p><span>html usage</span> <span>comment before entry tag</span></p>"]));
console.log(htmlFor(element)(["<p><span>html usage</span> <span>comment after entry tag</span></p>"]));
console.log(htmlFor(element)(["<p><span>html usage</span> <span>with comment sibling</span></p>"]));
console.log(svg(["<svg xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink><rect x=10 y=10 height=100 width=100 /></svg>"]));
console.log(svg(["<svg width=190 height=160 xmlns=http://www.w3.org/2000/svg><path d=\"M 10 80 Q 95 10 180 80\" stroke=black fill=transparent /></svg>"]));
console.log(svgFor(element)(["<svg></svg>"]));
console.log(svgFor(element)(["<svg><path foo/></svg>"]));

function pleaseHoistInternalUsage() {
  console.log(html(_template));
  console.log(htmlFor(element)(_template));
  console.log(svg(_template2));
  console.log(svgFor(element)(_template2));
}

function pleaseHoistDifferentTemplates() {
  console.log(html(_template));
  console.log(htmlFor(element)(_template));
  console.log(html(_template3));
  console.log(htmlFor(element)(_template3));
  console.log(html(_template4));
  console.log(htmlFor(element)(_template5));
  console.log(svg(_template6));
  console.log(svgFor(element)(_template7));
}
