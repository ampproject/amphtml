import {createUseStyles} from 'react-jss';

// These styles base styles are copied from react-day-picker base CSS with some modifications
// https://github.com/gpbl/react-day-picker/blob/master/packages/react-day-picker/src/style.css
const dayPicker = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",

  '& .rdp': {
    '--header-color': '#000',
    '--rdp-cell-size': '40px',
    '--rdp-accent-color': '#0654ab',
    '--rdp-background-color': '#e4e7e7',
    '--rdp-outline': '2px solid var(--rdp-background-color)',
    '--rdp-outline-selected': '2px solid var(--rdp-accent-color)',

    margin: '1em',
  },

  '& .rdp-vhidden': {
    boxSizing: 'border-box',
    margin: 0,
    background: 'transparent',
    '-moz-appearance': 'none',
    '-webkit-appearance': 'none',
    appearance: 'none',
    position: 'absolute !important',
    top: 0,
    width: '1px !important',
    height: '1px !important',
    padding: '0 !important',
    overflow: 'hidden !important',
    clip: 'rect(1px, 1px, 1px, 1px) !important',
    border: '0 !important',
  },

  '& .rdp-button_reset': {
    appearance: 'none',
    position: 'relative',
    margin: 0,
    padding: 0,
    cursor: 'default',
    color: 'inherit',
    outline: 'none',
    background: 'none',
    font: 'inherit',
    '-moz-appearance': 'none',
    '-webkit-appearance': 'none',
  },

  '& .rdp-button': {
    border: '2px solid transparent',
  },

  '& .rdp-button[disabled]': {
    opacity: 0.25,
  },

  '& .rdp-button:not([disabled])': {
    cursor: 'pointer',
  },

  '& .rdp-button:focus:not([disabled]),.rdp-button:active:not([disabled])': {
    color: 'inherit',
    border: 'var(--rdp-outline)',
    backgroundColor: 'var(--rdp-background-color)',
  },

  '& .rdp-button:hover:not([disabed])': {
    backgroundColor: 'var(--rdp-background-color)',
  },

  '& .rdp-months': {
    display: 'flex',
  },

  '& .rdp-month': {
    margin: '0 1em',
  },

  '& .rdp-month:first-child': {
    marginLeft: 0,
  },

  '& .rdp-month:last-child': {
    marginRight: 0,
  },

  '& .rdp-table': {
    margin: 0,
    maxWidth: 'calc(var(--rdp-cell-size) * 7)',
    borderCollapse: 'collapse',
  },

  '& .rdp-caption': {
    backgroundColor: 'var(--header-color)',
    color: 'var(--rdp-background-color)',
    margin: '0 -30px 38px',
    paddingBottom: '20px',
    paddingTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
    textAlign: 'left',
  },

  '& .rdp-caption_dropdowns': {
    position: 'relative',
    display: 'inline-flex',
  },

  '& .rdp-caption_label': {
    fontWeight: 'lighter',
    position: 'relative',
    zIndex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    margin: 0,
    padding: '0 0.25em',
    whiteSpace: 'nowrap',
    color: 'currentColor',
    border: '2px solid transparent',
    fontFamily: 'inherit',
    fontSize: '140%',
  },

  '& .rdp-nav': {
    whiteSpace: 'nowrap',
  },

  '& .rdp-multiple_months .rdp-caption_start .rdp-nav': {
    position: 'absolute',
    top: '50%',
    left: 0,
    transform: 'translateY(-50%)',
  },

  '& .rdp-multiple_months .rdp-caption_end .rdp-nav': {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: 'translateY(-50%)',
  },

  '& .rdp-nav_button': {
    '--rdp-background-color': 'var(--header-color)',
    '--rdp-outline': '2px solid var(--header-color)',

    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--rdp-cell-size)',
    height: 'var(--rdp-cell-size)',
    padding: '0.25em',
    borderRadius: '100%',
  },

  '& .rdp-head': {
    border: 0,
  },

  '& .rdp-head_row .rdp-row': {
    height: '100%',
  },

  '& .rdp-head_cell': {
    verticalAlign: 'middle',
    textTransform: 'uppercase',
    fontSize: '0.75em',
    fontWeight: 700,
    textAlign: 'center',
    height: 'var(--rdp-cell-size)',
    padding: 0,
  },

  '& .rdp-tbody': {
    border: 0,
  },

  '& .rdp-foot': {
    margin: '0.5em',
  },

  '& .rdp-cell': {
    width: 'var(--rdp-cell-size)',
    height: 'var(--rdp-cell-size)',
    padding: 0,
    textAlign: 'center',
  },

  '& .rdp-weeknumber': {
    fontSize: '0.75em',
  },

  '& .rdp-weeknumber,.rdp-day': {
    display: 'flex',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    width: 'var(--rdp-cell-size)',
    maxWidth: 'var(--rdp-cell-size)',
    height: 'var(--rdp-cell-size)',
    margin: 0,
    border: '2px solid transparent',
    borderRadius: '100%',
  },

  '& .rdp-day_today:not(.rdp-day_outside)': {
    fontWeight: 'bold',
  },

  '& .rdp-day_selected:not([disabled]),.rdp-day_selected:focus:not([disabled]),.rdp-day_selected:active:not([disabled]),.rdp-day_selected:hover:not([disabled])':
    {
      color: 'white',
      backgroundColor: 'var(--rdp-accent-color)',
    },

  '& .rdp-day_selected:focus:not([disabled])': {
    border: 'var(--rdp-outline-selected)',
  },

  "& .rdp:not([dir='rtl']) .rdp-day_range_start:not(.rdp-day_range_end)": {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  "& .rdp:not([dir='rtl']) .rdp-day_range_end:not(.rdp-day_range_start)": {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  "& .rdp[dir='rtl'] .rdp-day_range_start:not(.rdp-day_range_end)": {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  "& .rdp[dir='rtl'] .rdp-day_range_end:not(.rdp-day_range_start)": {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  '& .rdp-day_range_end.rdp-day_range_start': {
    borderRadius: '100%',
  },

  '& .rdp-day_range_middle': {
    borderRadius: 0,
  },
};

const unmounted = {
  display: 'none',
};

const container = {};

const overlay = {
  position: 'relative',

  '& .rdp': {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    left: '10px',
    zIndex: 10,
  },
};

const JSS = {
  dayPicker,
  unmounted,
  container,
  overlay,
};

// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = createUseStyles(JSS);
