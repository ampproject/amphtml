console.log(html`html usage`);
console.log(html`html usage
multiline`);
console.log(html`<p active="true">Attribute Quote Removal</p>`);
console.log(html`<p data-order-state="new 'thing'">Impossible to Remove Quotes</p>`);
console.log(html`<p>
  <span>html usage</span>
  <span>more spans</span>
</p>`);
console.log(html` <p>
  <span>html usage</span>
  <span>whitespace before entry tag</span>
</p>`);
console.log(html`<p>
  <span>html usage</span>
  <span>whitespace after entry tag</span>
</p>  `);
console.log(html` <p>
  <span>html usage</span>
  <span>whitespace before and after entry tag</span>
</p>  `);
console.log(html`<!-- Test Comment to Remove -->
<p>
  <span>html usage</span>
  <span>comment before entry tag</span>
</p>`);
console.log(html`<p>
  <span>html usage</span>
  <span>comment after entry tag</span>
</p><!-- Test Comment to Remove -->`);
console.log(html`<p>
  <!-- Test Comment to Remove -->
  <span>html usage</span>
  <span>with comment sibling</span>
</p>`);
console.log(htmlFor(element)`html usage`);
console.log(htmlFor(element)`html usage
multiline`);
console.log(htmlFor(element)`<p active="true">Attribute Quote Removal</p>`);
console.log(htmlFor(element)`<p data-order-state="new 'thing'">Impossible to Remove Quotes</p>`);
console.log(htmlFor(element)`<p>
  <span>html usage</span>
  <span>more spans</span>
</p>`);
console.log(htmlFor(element)` <p>
  <span>html usage</span>
  <span>whitespace before entry tag</span>
</p>`);
console.log(htmlFor(element)`<p>
  <span>html usage</span>
  <span>whitespace after entry tag</span>
</p>  `);
console.log(htmlFor(element)` <p>
  <span>html usage</span>
  <span>whitespace before and after entry tag</span>
</p>  `);
console.log(htmlFor(element)`<!-- Test Comment to Remove -->
<p>
  <span>html usage</span>
  <span>comment before entry tag</span>
</p>`);
console.log(htmlFor(element)`<p>
  <span>html usage</span>
  <span>comment after entry tag</span>
</p><!-- Test Comment to Remove -->`);
console.log(htmlFor(element)`<p>
  <!-- Test Comment to Remove -->
  <span>html usage</span>
  <span>with comment sibling</span>
</p>`);
console.log(svg`
  <!-- This comment, whitespace, and attribute quotes should be removed -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <rect
      x="10"
      y="10"
      height="100"
      width="100"
    />
  </svg>
`)
console.log(svg`
  <svg width="190" height="160" xmlns="http://www.w3.org/2000/svg">
    <!-- The "d" attribute should not have its quotes removed -->
    <path d="M 10 80 Q 95 10 180 80" stroke="black" fill="transparent" />
  </svg>
`)
console.log(svgFor(element)`<svg>
  <!-- Test Comment to Remove -->
</svg>`);
console.log(svgFor(element)`<!-- This comment should be removed -->
  <svg>
    <path foo />
  </svg>`);

function pleaseHoistInternalUsage() {
  console.log(html`html usage`);
  console.log(htmlFor(element)`html usage`);
  console.log(svg`svg usage`);
  console.log(svgFor(element)`svg usage`);
}

function pleaseHoistDifferentTemplates() {
  console.log(html`html usage`);
  console.log(htmlFor(element)`html usage`);
  console.log(html`<div>html usage</div>`);
  console.log(htmlFor(element)`<div>html usage</div>`);
  console.log(html`<div>fourth sibling</div>`);
  console.log(htmlFor(element)`<div>fifth sibling</div>`);
  console.log(svg`<svg>sixth sibling</svg>`);
  console.log(svgFor(element)`<svg>seventh sibling</svg>`);
}
