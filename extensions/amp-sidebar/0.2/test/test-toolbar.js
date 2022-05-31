import {toArray} from '#core/types/array';

import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';

import {createIframePromise} from '#testing/iframe';

import {Toolbar} from '../toolbar';

describes.realWin('amp-sidebar - toolbar', {}, (env) => {
  let timer;

  function getToolbars(options) {
    options = options || {};
    return createIframePromise().then((iframe) => {
      const {win} = iframe;
      const {document: doc} = win;

      timer = Services.timerFor(win);

      const ampdoc = new AmpDocSingle(win);
      const contextElement = {
        getAmpDoc: () => ampdoc,
        mutateElement: (cb) => {
          cb();
          return Promise.resolve();
        },
      };

      env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
        callback();
      });

      // Create toolbar elements
      const toolbarContainerElement = doc.createElement('div');
      const toolbars = [];
      doc.body.appendChild(toolbarContainerElement);

      // Create our individual toolbars
      options.forEach((toolbarObj) => {
        const navToolbar = doc.createElement('nav');
        if (toolbarObj.media) {
          navToolbar.setAttribute('toolbar', toolbar.media);
        } else {
          navToolbar.setAttribute('toolbar', '(min-width: 768px)');
        }
        if (toolbarObj.toolbarOnlyOnNav) {
          navToolbar.setAttribute('toolbar-only', '');
        }
        const toolbarTarget = doc.createElement('div');
        if (toolbarObj.toolbarTarget) {
          toolbarTarget.setAttribute('id', toolbarObj.toolbarTarget);
          navToolbar.setAttribute('toolbar-target', toolbarObj.toolbarTarget);
        } else if (toolbarObj.toolbarTargetError) {
          navToolbar.setAttribute('target', 'toolbar-target');
        } else {
          toolbarTarget.setAttribute('id', 'toolbar-target');
          navToolbar.setAttribute('toolbar-target', 'toolbar-target');
        }
        doc.body.appendChild(toolbarTarget);
        const toolbarList = doc.createElement('ul');
        for (let i = 0; i < 3; i++) {
          const li = doc.createElement('li');
          li.innerHTML = 'Toolbar item ' + i;
          toolbarList.appendChild(li);
        }
        navToolbar.appendChild(toolbarList);
        toolbarContainerElement.appendChild(navToolbar);
        toolbars.push(new Toolbar(navToolbar, contextElement));
      });

      return {iframe, ampdoc, toolbarContainerElement, toolbars};
    });
  }

  function resizeIframeToWidth(iframeObject, width, callback) {
    iframeObject.iframe.setAttribute('width', width);
    // Force the browser to re-draw
    iframeObject.win.innerWidth;
    callback();
  }

  it('toolbar header should error if target element \
   could not be found as it is required.', () => {
    return getToolbars([
      {
        targetError: true,
      },
    ])
      .then(() => {
        expect(false).to.be.equal(
          true,
          'Toolbar \
       should not be created when the target element is not found'
        );
      })
      .catch(() => {
        expect(true).to.be.ok;
      });
  });

  it('toolbar header should be hidden for a \
   non-matching window size for (min-width: 768px)', () => {
    return getToolbars([{}]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '1024px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
        });
        const toolbarElements = toArray(
          obj.ampdoc.getRootNode().getElementsByClassName('i-amphtml-toolbar')
        );
        resizeIframeToWidth(obj.iframe, '1px', () => {
          toolbars.forEach((toolbar) => {
            toolbar.onLayoutChange();
          });
          expect(toolbarElements.length).to.be.above(0);
          expect(toolbarElements[0].parentElement).to.have.display('none');
        });
      });
    });
  });

  it('toolbar header should be shown for a \
   matching window size for (min-width: 768px)', () => {
    return getToolbars([{}]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '4000px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
        });
        const toolbarElements = toArray(
          obj.ampdoc.getRootNode().getElementsByClassName('i-amphtml-toolbar')
        );
        expect(toolbarElements.length).to.be.above(0);
        expect(toolbarElements[0].parentElement).to.not.have.display('none');
      });
    });
  });

  it('toolbar should be placed into a target, with the \
   target attrbiute', () => {
    const targetId = 'toolbar-target';
    return getToolbars([
      {
        'toolbar-target': targetId,
      },
    ]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '1024px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
        });
        const toolbarQuery = `#${targetId} > nav[toolbar]`;
        const toolbarTargetElements = toArray(
          obj.ampdoc.getRootNode().querySelectorAll(toolbarQuery)
        );
        expect(toolbars.length).to.be.equal(1);
        expect(toolbarTargetElements.length).to.be.equal(1);
      });
    });
  });

  it('toolbar should be placed into a target, and shown for a \
   matching window size for (min-width: 768px)', () => {
    const targetId = 'toolbar-target';
    return getToolbars([
      {
        'toolbar-target': targetId,
      },
    ]).then((obj) => {
      const {toolbars} = obj;
      const toolbarTargets = toArray(
        obj.ampdoc.getRootNode().querySelectorAll(`#${targetId}`)
      );
      resizeIframeToWidth(obj.iframe, '4000px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
        });
        expect(toolbars.length).to.be.equal(1);
        expect(toolbarTargets.length).to.be.equal(1);
        expect(toolbarTargets[0]).to.not.have.display('none');
      });
    });
  });

  it('toolbar should be placed into a target, and hidden for a \
   non-matching window size for (min-width: 768px)', () => {
    const targetId = 'toolbar-target';
    return getToolbars([
      {
        'toolbar-target': targetId,
      },
    ]).then((obj) => {
      const {toolbars} = obj;
      const toolbarTargets = toArray(
        obj.ampdoc.getRootNode().querySelectorAll(`#${targetId}`)
      );
      resizeIframeToWidth(obj.iframe, '200px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
        });
        expect(toolbars.length).to.be.equal(1);
        expect(toolbarTargets.length).to.be.equal(1);
        expect(toolbarTargets[0]).to.have.display('none');
      });
    });
  });

  it('should add the "amp-sidebar-toolbar-target-shown" state class, \
   for matching window size of (min-width: 768px)', () => {
    return getToolbars([
      {
        toolbarOnlyOnNav: true,
      },
    ]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '4000px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
        });
        const toolbarNavElementsWithState = toArray(
          obj.ampdoc
            .getRootNode()
            .querySelectorAll('nav[toolbar].amp-sidebar-toolbar-target-shown')
        );
        expect(toolbarNavElementsWithState.length).to.be.equal(1);
        expect(toolbars.length).to.be.equal(1);
      });
    });
  });

  it('should add the "amp-sidebar-toolbar-target-hidden" state class, \
   for non-matching window size of (min-width: 768px)', () => {
    return getToolbars([
      {
        toolbarOnlyOnNav: true,
      },
    ]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '0px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
        });
        const toolbarNavElementsWithState = toArray(
          obj.ampdoc
            .getRootNode()
            .querySelectorAll('nav[toolbar].amp-sidebar-toolbar-target-hidden')
        );
        expect(toolbarNavElementsWithState.length).to.be.equal(1);
        expect(toolbars.length).to.be.equal(1);
      });
    });
  });

  it('toolbar should be in the hidden state \
   when it is not being displayed', () => {
    return getToolbars([{}]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '1px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
          expect(toolbar.isToolbarShown_()).to.be.false;
        });
      });
    });
  });

  it('toolbar should be in the shown state \
   when it is being displayed', () => {
    return getToolbars([{}]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '4000px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
          expect(toolbar.isToolbarShown_()).to.be.true;
        });
      });
    });
  });

  it('toolbar should not be able to be shown \
   if already in the shown state', () => {
    return getToolbars([{}]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '4000px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
          expect(toolbar.isToolbarShown_()).to.be.true;
        });
      });
    });
  });

  it('toolbar should be able to be shown \
   if not in the shown state, and return a promise', () => {
    return getToolbars([{}]).then((obj) => {
      const {toolbars} = obj;
      resizeIframeToWidth(obj.iframe, '1px', () => {
        toolbars.forEach((toolbar) => {
          toolbar.onLayoutChange();
          expect(toolbar).to.exist;
        });
      });
    });
  });
});
