import {ContextNode} from './node';
export interface IContextProp<T, DEP> {
  /**
   * A globally unique key. Extensions must use a fully qualified name such
   * as "amp-extension:key" or "amp-extension:version:key".
   */
  key: string;

  /**
   * A type object that can be used for a using system. E.g.
   * this could be a Preact's Context object.
   */
  type: import('preact').Context<T>;

  /**
   * An array of dependencies that are required for the `compute` callback.
   */
  deps: IContextProp<DEP, any>[];

  /**
   * Whether the value needs a recursive resolution of the parent value. The
   * following values are allowed:
   * - `false`: the parent value is never needed. It's a non-recursive
   * property, such as `Loaded`.
   * - `true`: the parent value is always needed. It's a recursive property.
   * It could be a simple "find first" recursive property. Or it could be a
   * computable property, such as `score` where all values of the score are
   * compounded.
   * - a function: the parent value may or may not be needed. This function
   * will be called with all of the property inputs. It should return `true`
   * if the parent value is needed for the provided inputs. For instance,
   * a recursive property based on AND (e.g. `renderable`), can immediately
   * determine that the resulting value will be `false` because some inputs
   * are `false` and thus a more resource-sensitive parent resolution is not
   * necessary.
   */
  recursive: boolean | ((inputs: T[]) => boolean);

  /**
   * Computes the property value. This callback is passed the following
   * arguments:
   * 1. The DOM Node.
   * 2. An array of all inputs set on this DOM node for this property.
   * 3. If it's a recursive property, the parent value.
   * 4. If `deps` are specified - the dep values.
   */
  compute(node: Node, inputs: T[], ...deps: T[]): T | undefined;
  compute(
    node: Node,
    inputs: T[],
    parentValue: T,
    ...deps: DEP[]
  ): T | undefined;

  /**
   * The default value of a recursive property.
   */
  defaultValue?: T;
}

/**
 * The structure for a property's inputs. It's important that `values` are
 * easily available as an array to pass them to the `recursive` and
 * `compute` callbacks without reallocation.
 */
export interface IContextPropInput<T> {
  values: T[];
  setters: ((value: T) => void)[];
}

// TODO(rcebulko): Solve enum challenge bridging JS/TS
export type PendingEnumValue = number;

/** The structure for a property's computed values and subscribers. */
export interface IContextPropUsed<T, DEP> {
  prop: IContextProp<T, DEP>;
  subscribers: ((value: T) => void)[];
  value: T;
  pending: PendingEnumValue;
  counter: number;
  depValues: DEP[];
  parentValue: T;
  parentContextNode: null | import('./node').ContextNode<?>;
  ping: (refreshParent: boolean) => void;
  pingDep: ((dep: DEP) => void)[];
  pingParent: null | ((parentValue: T) => void);
}
declare global {
  interface Node {
    // Used to assign a ContextNode to a DOM Node.
    __AMP_NODE?: ContextNode<any>;

    // Used to map a Node to its assigned slot.
    __AMP_ASSIGNED_SLOT?: Node;
  }
}
