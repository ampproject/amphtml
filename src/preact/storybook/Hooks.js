import * as Preact from '#preact';
import {useCallback, useState} from '#preact';
import {useIntersectionObserver} from '#preact/component/intersection-observer';
import {useMergeRefs} from '#preact/utils';

export default {
  title: '0/Hooks',
};

/**
 * @param {{prop: *}} param0
 * @return {import('preact').VNode}
 */
function Component({prop}) {
  const [text, setText] = useState('initial render');
  const ioCallback = useCallback(
    /** @param {{isIntersecting: boolean}} param0 */
    ({isIntersecting}) => {
      setText(`is intersecting for ${prop}: ${isIntersecting}`);
    },
    [prop]
  );

  const anotherIoCallback = useCallback(
    /** @param {{isIntersecting: boolean}} param0 */
    ({isIntersecting}) => {
      // TODO(dmanek): Look into using Storybook actions instead of console.log below
      // eslint-disable-next-line local/no-forbidden-terms
      console.log(`is intersecting for ${prop}: ${isIntersecting}`);
    },
    [prop]
  );

  const ref = useIntersectionObserver(ioCallback);
  const anotherRef = useIntersectionObserver(anotherIoCallback);

  return <div ref={useMergeRefs([ref, anotherRef])}>{text}</div>;
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
