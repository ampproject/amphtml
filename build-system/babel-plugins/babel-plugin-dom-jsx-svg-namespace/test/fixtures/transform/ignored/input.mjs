// Import does not end with core/dom/jsx so we ignore this file.
/** @jsx Preact.createElement */
import * as Preact from 'preact';

() => <svg />;
() => <svg xmlns="http://www.w3.org/2000/svg" />;
() => <path foo="bar" />;
() => <circle foo="bar" />;

() => <div />;
() => <span class="whatever" />;
