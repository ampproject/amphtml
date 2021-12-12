// src/polyfills.js must be the first import.
import '#3p/polyfills';

import {gltfViewer} from '#3p/3d-gltf';
import {register} from '#3p/3p';
import {draw3p, init} from '#3p/integration-lib';

init(window);
register('3d-gltf', gltfViewer);

window.draw3p = draw3p;
