import './polyfills';
import {compile} from './compile';

(globalThis as any)['compile'] = compile;
