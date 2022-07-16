// Utility file that generates URLs suitable for AMP's impression tracking.

import {initLogConstructor, setReportError} from '#utils/log';

import {installAlpClickHandler, warmupStatic} from './handler';

import {reportError} from '../../src/error-reporting';

initLogConstructor();
setReportError(reportError);
installAlpClickHandler(window);
warmupStatic(window);
