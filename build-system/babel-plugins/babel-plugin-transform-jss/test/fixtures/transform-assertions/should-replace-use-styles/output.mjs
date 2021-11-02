import { $single as _$single } from "../foo.jss";
import { $two as _$two } from "../foo.jss";
import { $one as _$one } from "../foo.jss";
import { $x as _$x2 } from "../foo.jss";
import { $foo as _$foo } from "./something.jss";
import { $x as _$x } from "../foo.jss";
import { $b as _$b } from "../foo.jss";
import { useStyles } from '../foo.jss';
import { useStyles as useSomeOtherNameWithStyles } from './something.jss';
console.log(_$b);
console.log(_$x);

function x() {
  return _$foo;
}

_$x2;
const {
  one: _unused,
  two: _unused2,
  ...rest
} = useStyles();
const twoRenamed = _$two;
const one = _$one;
let single = _$single;
