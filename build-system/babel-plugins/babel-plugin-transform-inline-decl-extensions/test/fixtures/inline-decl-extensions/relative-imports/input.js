import {RelativeImports} from './input-nested-directory/input-base-class';

foo(
  configureComponent(RelativeImports, {
    a: 'value for a',
    b: 'value for b',
    d: 'value for c',
  })
);
