import {greeting} from './utils';
import {camelCaseToDash} from '../../../src/string';

function hello(compiler: string) {
    console.log(`${greeting} from ${camelCaseToDash(compiler)}`);
}
hello("TypeScript");
