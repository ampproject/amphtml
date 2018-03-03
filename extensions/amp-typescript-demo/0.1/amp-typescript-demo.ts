import {greeting} from './utils';

function hello(compiler: string) {
    console.log(`${greeting} from ${compiler}`);
}
hello("TypeScript");
