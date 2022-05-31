import {useImperativeHandle} from '#preact';

/**
 * @param {{current: ?T}} ref
 * @param {T} node
 * @template T
 */
export function useDOMHandle(ref, node) {
  useImperativeHandle(ref, () => node, [node]);
}
