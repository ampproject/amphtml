import './polyfills';
import {compile} from './compile';

globalThis.compile = compile;
