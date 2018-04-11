import {registerGlobalIpcCode} from './ipc';
import {resolveURL} from './util';
import animationLoop from './animationLoop';
import declareOrbitControls from './orbit';
import gltfLoader from './gltfLoader';
import gltfViewer from './viewer';

export default function makeViewerIframe(win, parent) {
  const iframe = win.document.createElement('iframe');
  const code = [
    `<script>${registerGlobalIpcCode}</script>`,
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/91/three.js"></script>',
    `<script>${resolveURL.toString()}</script>`,
    `<script>(${declareOrbitControls.toString()})()</script>`,
    `<script>(${animationLoop.toString()})()</script>`,
    `<script>(${gltfLoader.toString()})()</script>`,
    `<script>(${gltfViewer.toString()})()</script>`,
    '<style>body{margin:0;padding:0;}canvas{display:block}</style>',
    '<body></body>',
  ].join('\n');

  const blob = new Blob([code], {type: 'text/html'});
  const url = URL.createObjectURL(blob);

  iframe.setAttribute('src', url);

  parent.appendChild(iframe);

  let released = false;
  return {
    iframe,
    release: () => {
      if (released) {
        return;
      }
      parent.removeChild(iframe);
      URL.revokeObjectURL(url);
      released = true;
    },
  };
}
