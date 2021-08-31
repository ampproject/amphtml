import {getMode} from '../../../../../../../src/mode';
const test = false;
const minified = true;
const development = getMode().development;

function foo() {
  if (getMode().development == false) {
    return false;
  }
}
