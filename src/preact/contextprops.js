import {
  Loading_Enum,
  reducer as loadingReducer,
} from '#core/constants/loading-instructions';
import {contextProp} from '#core/context/prop';

/**
 * Defines whether a DOM subtree can be currently seen by the user. A subtree
 * can be not renderable due `display: none`, or `hidden` attribute, unslotted
 * in shadow DOM, or because a parent component knows for certain that this
 * subtree cannot be seen by the user without some active interaction.
 *
 * Default is `true`.
 *
 * @type {import('#core/context/prop').IContextProp<boolean, boolean>}
 * @const
 */
const CanRender = contextProp('CanRender', {
  defaultValue: /** @type {boolean} */ (true),
  recursive: (inputs) => inputs.reduce(andReducer),
  compute: (contextNode, inputs, parentValue) =>
    (parentValue && inputs.reduce(andReducer, true)) || false,
});

/**
 * Defines whether a DOM subtree can be currently played or animated. If a
 * a subtree not renderable (`canRender == false`), it also cannot be played.
 * But even if a subtree is renderable, a parent component may decide that
 * playback should not be possible.
 *
 * Default is `true`.
 *
 * @type {import('#core/context/prop').IContextProp<boolean, boolean>}
 * @const
 */
const CanPlay = contextProp('CanPlay', {
  defaultValue: /** @type {boolean} */ (true),
  recursive: (inputs) => inputs.reduce(andReducer),
  deps: [CanRender],
  compute: (contextNode, inputs, parentValue, canRender) =>
    (canRender && parentValue && inputs.reduce(andReducer, true)) || false,
});

/**
 * The default `Loading_Enum` instruction for a subtree. See `Loading_Enum` for the set
 * of possible values. Non-renderable subtrees automatically get a value of
 * "lazy".
 *
 * Default is "auto".
 *
 * @type {import('#core/context/prop').IContextProp<Loading_Enum, boolean>}
 * @const
 */
const LoadingProp = contextProp('Loading', {
  defaultValue: /** @type {Loading_Enum} */ (Loading_Enum.AUTO),
  recursive: true,
  deps: [CanRender],
  compute: (contextNode, inputs, parentValue, canRender) =>
    loadingReducer(
      canRender ? Loading_Enum.AUTO : Loading_Enum.LAZY,
      loadingReducer(
        parentValue || Loading_Enum.AUTO,
        inputs.reduce(loadingReducer, Loading_Enum.AUTO)
      )
    ),
});

/**
 * @param {T} acc
 * @param {T} value
 * @return {T}
 * @template T
 */
const andReducer = (acc, value) => acc && value;

export {CanRender, CanPlay, LoadingProp};
