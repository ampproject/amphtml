// Throws because cant use classname "CSS", as it conflicts with this transform.
import {createUseStyles} from 'react-jss'; 
export const useStyles = createUseStyles({CSS: {fontSize: 12}});
