import {useStyles} from 'foo';

const direct = useStyles();
direct.memberExpression;
const {objectPatternProperty} = direct;
const indirect = direct;
indirect.memberExpressionIndirect;
const {objectPatternPropertyIndirect} = indirect;
