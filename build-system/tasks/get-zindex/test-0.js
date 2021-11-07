/* eslint-disable */

const declarator = {
  zIndex: 0,
};

assignment = {
  'z-index': 'auto',
};

const emptyZindexIsIgnored = {
  zIndex: '',
};

setStyle(foo, 'z-index', 15);
setStyles(bar, {foo: 'bar', 'z-index': 9999});

<div style={{zIndex: 'initial'}}></div>;
