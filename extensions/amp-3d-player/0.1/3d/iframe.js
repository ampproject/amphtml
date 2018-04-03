import {registerGlobalIpcCode} from './ipc';
import {resolveURL} from './util';
import animationLoop from './animationLoop';
import declareOrbitControls from './orbit';
import gltfLoader from './gltfLoader';
import gltfViewer from './viewer';

export default function makeViewerIframe(parent) {
  const iframe = document.createElement('iframe');
  const code = [
    `<script>${registerGlobalIpcCode}</script>`,
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/91/three.js"></script>',
    `<script>${resolveURL.toString()}</script>`,
    `<script>(${declareOrbitControls.toString()})()</script>`,
    `<script>(${animationLoop.toString()})()</script>`,
    `<script>(${gltfLoader.toString()})()</script>`,
    `<script>(${gltfViewer.toString()})()</script>`,
    '<style>body{margin:0;padding:0;}canvas{display:block}</style>',
  ].join('\n');

  parent.appendChild(iframe);
  iframe.contentDocument.write(code);
  iframe.contentDocument.write('<body />');

  return iframe;
}
