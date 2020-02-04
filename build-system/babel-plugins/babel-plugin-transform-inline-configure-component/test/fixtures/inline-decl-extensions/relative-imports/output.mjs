import "../backwards";
import "./input-nested-directory/for/wards";
import { leaveThis } from 'alone';
import { baz } from "./input-nested-directory/foo/bar";

class RelativeImports {}

const _a = 'value for a',
      _b = 'value for b',
      _d = 'value for c';
import { RelativeImports as _RelativeImports } from './input-nested-directory/input-base-class';
foo(RelativeImports);
