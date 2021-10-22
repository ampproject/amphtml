import {useStyles} from '../foo.jss';
import {useStyles as useSomeOtherNameWithStyles} from './something.jss';

const a = useStyles();
console.log(a.b);
console.log(a.x);

function x() {
  const x = useSomeOtherNameWithStyles();
  return x.foo;
}

useStyles().x;

const {
  one,
  two: twoRenamed,
  ...rest
} = useStyles();

let {single} = useStyles();
