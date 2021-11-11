import * as jsx from 'ANYWHERE_LEADING_TO/core/dom/jsx';

const logicalAnd = () => <div style={x && {background: 'red'}} />;

const logicalAndDeep = () => <div style={x && foo && {color: 'red'}} />;

const logicalOr = () => <div style={x || {background: 'red'}} />;

const ternary = () => <div style={x ? {color: 'red'} : {background: 'red'}} />;

const ternaryNested = () => (
  <div style={x ? (y ? {color: 'red'} : null) : {background: 'red'}} />
);
