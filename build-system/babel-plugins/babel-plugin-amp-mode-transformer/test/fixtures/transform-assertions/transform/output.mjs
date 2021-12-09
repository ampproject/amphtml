import { getMode } from '../../../../../../../src/mode';
import * as mode from 'core/mode';
const test = false;
const localDev = false;
const minified = true;
const development = false;
const namespaceVersion = mode.version();

function foo() {
  if (false == false) {
    return false;
  }
}
