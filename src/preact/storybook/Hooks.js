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
    ({isIntersecting}) => {
      setText(`is intersecting for ${prop}: ${isIntersecting}`);
    },
    [prop]
  );

  const anotherIoCallback = useCallback(
    ({isIntersecting}) => {
      // eslint-disable-next-line local/no-forbidden-terms
      console.log(`is intersecting for ${prop}: ${isIntersecting}`);
    },
    [prop]
  );

  useIntersectionObserver(
    ref,
    ioCallback,
    toWin(ref.current?.ownerDocument?.defaultView)
  );

  useIntersectionObserver(
    ref,
    anotherIoCallback,
    toWin(ref.current?.ownerDocument?.defaultView)
  );
  return <div ref={ref}>{text}</div>;
}

export const useIO = () => {
  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: 'blue',
        }}
      ></div>
      <Component prop="1" />
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: 'blue',
        }}
      ></div>
      <Component prop="2" />
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: 'blue',
        }}
      ></div>
      <Component prop="3" />
    </>
  );
};
