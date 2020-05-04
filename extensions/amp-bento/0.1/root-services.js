
import {ContextNode} from '../../../src/node/node';
import {setKey} from '../../../src/node/context-type';
import {AmpContext} from '../../../src/preact/context';

export function installRootServices(ampdoc) {
  console.log('RootServices: init');
  const contextRoot = ContextNode.get(ampdoc.getRootNode());

  // Visibility.
  setRootVisibility(contextRoot, ampdoc.getVisibilityState());
  ampdoc.onVisibilityChanged(() => setRootVisibility(contextRoot, ampdoc.getVisibilityState()));

  // Base URI.
  contextRoot.setSelf('baseURI', ampdoc.getUrl());
}

function setRootVisibility(contextRoot, visibilityState) {
  const rootVisibility = new RootVisibility(visibilityState);
  console.log('RootServices: setRootVisibility:', rootVisibility);
  contextRoot.setSelf(RootVisibility, rootVisibility);
  contextRoot.setSelf(AmpContext, {
    renderable: rootVisibility.visible,
    playable: rootVisibility.visible,
  });
}

export class RootVisibility {
  constructor(visibilityState) {
    this.visibilityState = visibilityState;
    this.visible = visibilityState == 'visible';
    this.hidden =  visibilityState != 'visible';
  }
}

setKey(RootVisibility, 'RootVisibility');
