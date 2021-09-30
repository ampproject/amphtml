const test = require('ava');
const {renameSelectorsToBentoTagNames} = require('../bento-css');

const cases = {
  'simple': [
    `amp-foo {
      background: red;
    }`,
    `bento-foo {
      background: red;
    }`,
  ],
  'nested': [
    `@media screen {
      amp-foo {
        background: red;
      }
    }`,
    `@media screen {
      bento-foo {
        background: red;
      }
    }`,
  ],
  'multiple': [
    `amp-foo {
      background: red;
    }
    amp-bar {
      color: blue;
    }
    div {
      transform: translate(100%, 0);
    }
    has-amp-but-does-not-start-with-amp- {
      background: yellow;
    }`,
    `bento-foo {
      background: red;
    }
    bento-bar {
      color: blue;
    }
    div {
      transform: translate(100%, 0);
    }
    has-amp-but-does-not-start-with-amp- {
      background: yellow;
    }`,
  ],
  'mixed selector': [
    `amp-foo > div .amp-bar:not(amp-whatever) {
      background: red;
    }`,
    `bento-foo > div .amp-bar:not(bento-whatever) {
      background: red;
    }`,
  ],
  'ignores @rule names': [
    `@keyframes amp-x {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }`,
    `@keyframes amp-x {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }`,
  ],
  'preserves minification': [
    `amp-foo>div:not(.amp-classname){background:red}amp-whatever{color:blue}`,
    `bento-foo>div:not(.amp-classname){background:red}bento-whatever{color:blue}`,
  ],
};

for (const name of Object.keys(cases)) {
  test(`renames amp-* selectors to bento-* (${name})`, async (t) => {
    const [input, expected] = cases[name];
    const output = await renameSelectorsToBentoTagNames(input);
    t.is(output, expected);
  });
}
