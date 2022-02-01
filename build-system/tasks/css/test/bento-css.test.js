const test = require('ava');
const {renameSelectorsToBentoTagNames} = require('../bento-css');

async function renameSelectorsToBentoTagNamesExpected(t, input, expected) {
  const output = await renameSelectorsToBentoTagNames(input);
  t.is(output, expected);
}

test(
  'renames amp-* selectors to bento-* (simple)',
  renameSelectorsToBentoTagNamesExpected,
  `amp-foo {
    background: red;
  }`,
  `bento-foo {
    background: red;
  }`
);

test(
  'renames amp-* selectors to bento-* (nested)',
  renameSelectorsToBentoTagNamesExpected,
  `@media screen {
    amp-foo {
      background: red;
    }
  }`,
  `@media screen {
    bento-foo {
      background: red;
    }
  }`
);

test(
  'renames amp-* selectors to bento-* (multiple)',
  renameSelectorsToBentoTagNamesExpected,
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
  }`
);

test(
  'renames amp-* selectors to bento-* (mixed selector)',
  renameSelectorsToBentoTagNamesExpected,
  `amp-foo > div .amp-bar:not(amp-whatever) {
    background: red;
  }`,
  `bento-foo > div .amp-bar:not(bento-whatever) {
    background: red;
  }`
);

test(
  'renames amp-* selectors to bento-* (ignores @rule names)',
  renameSelectorsToBentoTagNamesExpected,
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
  }`
);

test(
  'renames amp-* selectors to bento-* (preserves minification)',
  renameSelectorsToBentoTagNamesExpected,
  `amp-foo>div:not(.amp-classname){background:red}amp-whatever{color:blue}`,
  `bento-foo>div:not(.amp-classname){background:red}bento-whatever{color:blue}`
);
