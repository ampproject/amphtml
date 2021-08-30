import {createUseStyles} from 'react-jss';

export const useStyles = createUseStyles({
  floatLeft: {float: 'left'},
});

// These next lines should be unaffected by jss transform.
export const unrelated = 5;
unrelated + unrelated == unrelated * 2;
