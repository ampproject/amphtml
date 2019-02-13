const _template = ["html usage"],
      _template2 = ["<div>html usage</div>"],
      _template3 = ["<div>third sibling</div>"],
      _template4 = ["<div>fouth sibling</div>"],
      _template5 = ["<div>fifth sibling</div>"];

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
console.log(cachedHtmlFor(element)(["html usage"]));
console.log(cachedHtmlFor(element)(["html usage multiline"]));
console.log(cachedHtmlFor(element)(["<p active=true>Attribute Quote Removal</p>"]));
console.log(cachedHtmlFor(element)(["<p data-order-state=\"new 'thing'\">Impossible to Remove Quotes</p>"]));
console.log(cachedHtmlFor(element)(["<p><span>html usage</span> <span>more spans</span></p>"]));
console.log(cachedHtmlFor(element)(["<p><span>html usage</span> <span>whitespace before entry tag</span></p>"]));
console.log(cachedHtmlFor(element)(["<p><span>html usage</span> <span>whitespace after entry tag</span></p>"]));
console.log(cachedHtmlFor(element)(["<p><span>html usage</span> <span>whitespace before and after entry tag</span></p>"]));
console.log(cachedHtmlFor(element)(["<p><span>html usage</span> <span>comment before entry tag</span></p>"]));
console.log(cachedHtmlFor(element)(["<p><span>html usage</span> <span>comment after entry tag</span></p>"]));
console.log(cachedHtmlFor(element)(["<p><span>html usage</span> <span>with comment sibling</span></p>"]));

function pleaseHoistInternalUsage() {
  console.log(html(_template));
  console.log(htmlFor(element)(_template));
  console.log(cachedHtmlFor(element)(_template));
}

function pleaseHoistDifferentTemplates() {
  console.log(html(_template));
  console.log(htmlFor(element)(_template));
  console.log(cachedHtmlFor(element)(_template));
  console.log(html(_template2));
  console.log(htmlFor(element)(_template2));
  console.log(cachedHtmlFor(element)(_template2));
  console.log(html(_template3));
  console.log(htmlFor(element)(_template4));
  console.log(cachedHtmlFor(element)(_template5));
}
