import {
  Loading,
  reducer as loadingReducer,
} from '#core/constants/loading-instructions';
import {contextProp} from '#core/context/prop';
import {ContextPropDef} from '#core/context/prop.type';

/**
 * Defines whether a DOM subtree can be currently seen by the user. A subtree
 * can be not renderable due `display: none`, or `hidden` attribute, unslotted
 * in shadow DOM, or because a parent component knows for certain that this
 * subtree cannot be seen by the user without some active interaction.
 *
 * Default is `true`.
 *
 * @const {!ContextPropDef<boolean>}
 */
const CanRender = contextProp('CanRender', {
  defaultValue: true,
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
 * @const {!ContextPropDef<boolean, boolean>}
 */
const CanPlay = contextProp('CanPlay', {
  defaultValue: true,
  recursive: (inputs) => inputs.reduce(andReducer),
  deps: [CanRender],
  compute: (contextNode, inputs, parentValue, canRender) =>
    (canRender && parentValue && inputs.reduce(andReducer, true)) || false,
});

/**
 * The default `Loading` instruction for a subtree. See `Loading` for the set
 * of possible values. Non-renderable subtrees automatically get a value of
 * "lazy".
 *
 * Default is "auto".
 *
 * @const {!ContextPropDef<!Loading, boolean>}
 */
const LoadingProp = contextProp('Loading', {
  defaultValue: Loading.AUTO,
  recursive: true,
  deps: [CanRender],
  compute: (contextNode, inputs, parentValue, canRender) =>
    loadingReducer(
      canRender ? Loading.AUTO : Loading.LAZY,
      loadingReducer(
        parentValue || Loading.AUTO,
        inputs.reduce(loadingReducer, Loading.AUTO)
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
