
import {ContextNode, ContextNodeObserver, LoadedStateProp} from '../../../src/context';

/**
 */
export class LoadingIndicatorService {

  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    console.log('LoadingIndicatorService: ', ampdoc);

    // QQQ: replace with ContextNode.state of some sort.
    this.tracked_ = new Map();

    this.io_ = new IntersectionObserver(this.handleIntersections_.bind(this));

    this.co_ = new ContextNodeObserver(
      this.handleContextChanges_.bind(this),
      {
        props: [LoadedStateProp],
      });
    this.co_.observe(ContextNode.get(ampdoc.getRootNode()), /* scan */ true);
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
    records.forEach(({contextNode, prop}) => {
      console.log('LoadingIndicatorService: discovered: ', contextNode, prop);

      contextNode.subscribe(
        LoadedStateProp,
        (loadedState) => {
          console.log('LoadingIndicatorService: updated: ', contextNode, loadedState);
          if (loadedState === false) {
            const element = contextNode.node;
            this.tracked_.set(contextNode, new LoadingIndicator(contextNode));
            this.io_.observe(element);
            return () => {
              if (this.tracked_.get(contextNode)) {
                this.tracked_.get(contextNode).destroy();
              }
              this.tracked_.remove(contextNode);
              this.io_.unobserve(element);
            };
          }
        }
      );
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
      const li = this.tracked_.get(contextNode);
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
    this.contextNode_.element.style.border = on ? '4px solid blue' : '';
  }

  destroy() {
    console.log('LoadingIndicator: destroy');
    this.toggle(false);
  }
}
