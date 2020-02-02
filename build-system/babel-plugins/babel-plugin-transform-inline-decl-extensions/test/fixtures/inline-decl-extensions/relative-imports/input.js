import {RelativeImports} from './input-nested-directory/input-base-class';

foo(
  useVendorComponentConfig(RelativeImports, {
    a: 'value for a',
    b: 'value for b',
    d: 'value for c',
  })
);
