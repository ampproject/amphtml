import {createUseStyles} from 'react-jss';

const autocomplete = {
  fontFamily: 'sans-serif',
};

const input = {
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const autocompleteResults = {
  position: 'absolute',
  // top: '100%',
  width: 'calc(100% - 1rem)',
  minWidth: 'calc(2em + 2rem)',
  maxHeight: '40vh',
  marginTop: '.5rem',
  marginLeft: '-.5rem',
  borderRadius: '4px',

  overflowY: 'auto',
  overflowX: 'hidden',

  backgroundColor: 'white',
  boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.5)',
  zIndex: '10',
};

const autocompleteItem = {
  position: 'relative',
  padding: '.5rem 1rem',
  cursor: 'pointer',

  '&:first-child': {
    borderRadius: '4px 4px 0 0',
  },

  '&:nth-last-child(2)': {
    borderRadius: '0 0 4px 4px',
  },

  '&:hover:not([data-disabled])': {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  '&[data-disabled]': {
    color: 'rgba(0,0,0,0.33)',
  },

  '& > .autocomplete-partial': {
    fontWeight: 'bold',
  },
};

const autocompleteItemActive = {
  '&:not([data-disabled])': {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
};

const JSS = {
  autocomplete,
  input,
  autocompleteResults,
  autocompleteItem,
  autocompleteItemActive,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
