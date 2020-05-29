
import {ContextNode, RenderableProp, contextProp, contextCalc} from '../../../src/context';
import {Deferred} from '../../../src/utils/promise';

/** @type {!ContextProp<VisibilityState>} */
export const RootVisibilityProp = contextProp('RootVisibility', {recursive: true});

/** @type {!ContextProp<string>} */
export const BaseUriProp = contextProp('baseURI', {recursive: true});

export function installRootServices(ampdoc) {
  console.log('RootServices: init');
  const contextRoot = ContextNode.get(ampdoc.getRootNode());

  // Visibility.
  setRootVisibility(contextRoot, ampdoc.getVisibilityState());
  ampdoc.onVisibilityChanged(() => setRootVisibility(contextRoot, ampdoc.getVisibilityState()));

  // <Renderable.Provider value={isVisible}>
  contextRoot.provide(
    RenderableProp,
    contextCalc({
      deps: [RootVisibilityProp],
      compute(contextNode, renderable, rootVisibility) {
        return renderable && rootVisibility == 'visible';
      },
    }));

  // Base URI.
  // <BaseURI.Provider value={ampdoc.getUrl()}>
  contextRoot.set(BaseUriProp, ampdoc.getUrl());

  // Measure renderability.
  /*
    function RenderableMeasurerProvider({children}) {
      const measureSize = useContext(SizeMeasurer);
      const measureRenderable = (node) => measureSize(node);
      return <RenderableMeasurer.Provider value={measureRenderable}>{children}</>;
    }
   */
  /*QQQQQ
  contextRoot.setSubtree(
    RenderableMeasurer,
    {
      deps: [SizeMeasurer],

      value(contextNode) {
        const measureSize = contextNode.get(SizeMeasurer);
        return measureSize(contextNode)
          .then(({width, height}) => width > 0 && height > 0);
      },
    });
  */
}

function setRootVisibility(contextRoot, visibilityState) {
  const isVisible = visibilityState == 'visible';
  console.log('RootServices: setRootVisibility:', visibilityState, isVisible);

  // <RootVisibility.Provider value={visibilityState}>
  contextRoot.set(RootVisibilityProp, visibilityState);
}
