import { $thisOneIsOptimized as _$thisOneIsOptimized2 } from "./bar.jss";
import { $thisOneIsOptimized as _$thisOneIsOptimized } from "./foo.jss";
// useStyles() references that don't belong to a MemberExpression should be 
// preserve the classname object.
// TODO(alanorozco): It would be nice if these cases were linted to prevent
// deopt.
import { useStyles } from './foo.jss';
import { useStyles as useAnotherStyles } from './bar.jss';
console.log(useStyles());
console.log(_$thisOneIsOptimized);
const a = useAnotherStyles();
console.log(a);
console.log(_$thisOneIsOptimized2);
