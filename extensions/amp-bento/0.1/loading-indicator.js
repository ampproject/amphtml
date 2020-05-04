
import {ContextNode} from '../../../src/node/node';
import {setKey} from '../../../src/node/context-type';
import {ContextNodeObserver} from '../../../src/node/observer';
import {AmpContext} from '../../../src/preact/context';

/**
 */
export class LoadingIndicatorService {

  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    console.log('LoadingIndicatorService: ', ampdoc);

    this.io_ = new IntersectionObserver(this.handleIntersections_.bind(this));

    this.co_ = new ContextNodeObserver(this.handleContextChanges_.bind(this), {
      contextTypes: [AmpContext],
    });
    this.co_.observe(ContextNode.get(ampdoc.getRootNode()), true);
  }

  disconnect() {
    this.io_.disconnect();
    this.co_.disconnect();
  }

  /**
   * @param {!Array<!ContextNodeObserverEntryDef>} records
   * @private
   */
  handleContextChanges_(records) {
    console.log('LoadingIndicatorService: contextChanges:', records);
    records.forEach(({contextNode}) => {
      const ampContext = contextNode.get(AmpContext);
      console.log('LoadingIndicatorService: contextChanges: ', contextNode, ampContext);
      if (ampContext && ampContext.renderable) {
        contextNode.initSelf(LoadingIndicator, LoadingIndicator);
        this.io_.observe(contextNode.getNode());
      } else {
        const li = contextNode.getSelf(LoadingIndicator);
        if (li) {
          contextNode.setSelf(LoadingIndicator, null);
          li.destroy();
        }
        this.io_.unobserve(contextNode.getNode());
      }
    });
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} records
   * @private
   */
  handleIntersections_(records) {
    console.log('LoadingIndicatorService: intersections:', records);
    records.forEach(({target, isIntersecting}) => {
      const contextNode = ContextNode.get(target);
      const li = contextNode.getSelf(LoadingIndicator);
      if (li) {
        li.toggle(isIntersecting);
      }
    });
  }
}

class LoadingIndicator {

  constructor(contextNode) {
    console.log('LoadingIndicator: constructor:', contextNode);
    this.contextNode_ = contextNode;
  }

  toggle(on) {
    console.log('LoadingIndicator: toggle:', this.contextNode_, on);
    this.contextNode_.getNode().style.border = on ? '4px solid blue' : '';
  }

  destroy() {
    console.log('LoadingIndicator: destroy');
    this.toggle(false);
  }
}

setKey(LoadingIndicator, 'LoadingIndicator');
