/**
 * @fileoverview
 * These are the packages, and their exports that are included in `bento.js`
 * Extension `bento-*.js` binaries will use these exports as provided by
 * `bento.js` from the `BENTO` global.
 *
 * We specify each export explicitly by name.
 * Unlisted imports will be bundled with each binary.
 */

module.exports = {
  '#preact': [
    'createElement',
    'cloneElement',
    'render',
    'hydrate',
    'Fragment',
    'createRef',
    'createContext',
    'useState',
    'useRef',
    'useEffect',
    'useLayoutEffect',
    'useContext',
    'useMemo',
    'useCallback',
    'useImperativeHandle',
    'toChildArray',
  ],
  '#preact/slot': ['createSlot', 'Slot', 'useSlotContext'],
  '#core/context': [
    'assignSlot',
    'unassignSlot',
    'setParent',
    'discover',
    'setIsRoot',
    'rediscoverChildren',
    'setProp',
    'removeProp',
    'addGroup',
    'setGroupProp',
    'removeGroupProp',
    'subscribe',
    'unsubscribe',
  ],
  '#core/context/values': ['Values'],
  '#preact/component': ['ContainWrapper', 'Wrapper'],
  '#preact/compat': ['forwardRef'],
  '#preact/base-element': ['PreactBaseElement'],
  '#preact/context': ['WithAmpContext', 'useAmpContext', 'useLoading'],
};
