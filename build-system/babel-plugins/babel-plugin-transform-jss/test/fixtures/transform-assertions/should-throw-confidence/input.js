// Throws because object spread is not statically evaluable.
import {createUseStyles} from 'react-jss';
const foo = {foo: 7}
const JSS =  {...foo} 
export const useStyles = createUseStyles(JSS);
