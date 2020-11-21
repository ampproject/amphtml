/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
const posthtml = require('posthtml');
const fs = require('fs');


/**
 * transformBind.
 *  - in:  <p [text]="stateKey">Hello, world</p>
 *  - out: <p data-amp-bind-text="stateKey"> Hello, world </p>
 *
 * transformCE. (todo: add more details)
 *  - in: <amp-base-carousel type="carousel">
 *  - out: <AmpComponentTranslation type="carousel" localName="amp-base-carousel">
 *  Also generates <script> bootstrap code that assigns to window.PREACT_ROOT.
 *
 * transformHead.
 *  - in:  v0 + extensions
 *  - out: hacks
 */
async function main() {
  const inputHtml = fs.readFileSync('./compiler-input.html', 'utf-8');
  const outputHtml = (
    await posthtml()
      .use(transformBind)
      .use(transformCE)
      .use(transformHead)
      .process(inputHtml, {closingSingleTag: 'slash'})
  ).html.replace(/onClick="(.*)"/g, (match, m1) => {
    // HACK ALERT: Replace onClick string with curly brances.
    return `onClick={ ${m1} }`
  })
  fs.writeFileSync('./compiler-output.html', outputHtml);
}

const TagsToComponentMap = {
  'amp-base-carousel': 'AmpBaseCarousel',
  'amp-state': 'AmpState',
};

function transformHead(ast) {
  const hackyMakeItWorkCode = `
        window.AMP = {}
        window.IS_ESM = false;
        class Log {assert(){}}
        self.__AMP_LOG = { user: new Log(), dev: new Log(), };
    `;
  ast.match({tag: 'head'}, (head) => {
    head.content.forEach((elem) => {
      if (elem.tag != 'script') {
        return;
      }
      if (!elem.attrs || !elem.attrs.src) {
        return;
      }
      if (elem.attrs.src.includes('/v0/')) {
        elem.tag = false;
        elem.content = [];
      }
      if (elem.attrs.src.endsWith('v0.js')) {
        elem.attrs.src = './bento-runtime.js';
      }
    });
    head.content.push({tag: 'script', content: hackyMakeItWorkCode});
    return head;
  });
}

// TODO: handle non AMP Components that have bound properties.
function transformCE(ast) {
  const tags = Object.keys(TagsToComponentMap);
  ast.match(
    tags.map((tag) => ({tag})),
    (ampElement) => {
      ampElement.attrs = ampElement.attrs ?? {};
      ampElement.attrs.localName = ampElement.tag;
      ampElement.tag = 'AmpComponentTranslation';
      return ampElement;
    }
  );
  ast.match({tag: 'body'}, (body) => {
    const content = body.content;
    body.content = [
      {
        tag: 'div',
        attrs: {id: 'AMP_ROOT'},
        content: [
          {
            tag: 'script',
            'content': [
              `window.PREACT_ROOT = (window.PREACT_ROOT || []); window.PREACT_ROOT.push(function Root({state, mergeState}) {
                return (<>`,
                content,
              '</>)});\n',
            ],
          },
        ],
      },
    ];
    return body;
  });
}

// - Transforms bound attributes to data-amp-bind format
// - converts JSON to JSX
// - HACK: converts tap:AMP.setState.  We need a full action
// parser for this if we don't want to do it at runtime.
function transformBind(ast) {
  function hasBoundAttr(el) {
    if (!el.attrs) {
      return false;
    }
    return Object.keys(el.attrs).some(
      (str) => str[0] === '[' && str[str.length - 1] === ']'
    );
  }
  ast.walk((elem) => {
    if (!hasBoundAttr(elem)) {
      return elem;
    }
    elem.attrs = Object.fromEntries(
      Object.entries(elem.attrs).map(([attrName, attrValue]) => [
        !attrName.startsWith('[')
          ? attrName
          : `data-amp-bind-${attrName.slice(1, attrName.length - 1)}`,
        attrValue,
      ])
    );
    return elem;
  });
  // Convert JSON from html format to JSX format.
  ast.match({tag: 'script'}, (script) => {
    if (!script.attrs || script.attrs.type != 'application/json') {
      return script;
    }
    script.tag = false;
    return '{' + script.content + '}';
  });

  ast.match({attrs: {'on': true}}, (elem) => {
    const on = elem.attrs.on;
    delete elem.attrs.on;
    if (on == 'tap:AMP.setState({visibleCount: visibleCount + 1})') {
      elem.attrs.onClick = '() => mergeState({visibleCount: state.visibleCount + 1})';
    } else if (on == 'tap:AMP.setState({visibleCount: visibleCount - 1})') {
      elem.attrs.onClick = '() => mergeState({visibleCount: state.visibleCount - 1})';
    }
    return elem;
  });
}

main();
