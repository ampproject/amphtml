import {withKnobs} from '@storybook/addon-knobs';

import {toWin} from '#core/window';

import * as Preact from '#preact';
import {useCallback, useRef, useState} from '#preact';
import {useIntersectionObserver} from '#preact/component';

export default {
  title: '0/Hooks',
  decorators: [withKnobs],
};

function Component({prop}) {
  const [text, setText] = useState('initial render');
  const ref = useRef(null);
  const ioCallback = useCallback(
    (entry) => {
      console.log(entry);
      setText(`is intersecting for ${prop}: ${entry.isIntersecting}`);
    },
    [prop]
  );
  useIntersectionObserver(
    ref,
    toWin(ref.current?.ownerDocument?.defaultView),
    ioCallback
  );
  return <div ref={ref}>{text}</div>;
}
export const useIO = () => {
  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'blue',
        }}
      ></div>
      <Component prop="1" />
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'blue',
        }}
      ></div>
      <Component prop="2" />
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'blue',
        }}
      ></div>
      <Component prop="3" />
    </>
  );
};
